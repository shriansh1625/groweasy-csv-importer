import { generateId, delimiterLabel, detectCsvDelimiter } from '@groweasy/shared';
import type {
  CrmRecord,
  ExtractionBatch,
  ExtractionPipelineResult,
  HeaderAnalysisResult,
  ImportProgressStage,
  ValidationWarning,
} from '@groweasy/shared';

import { config } from '@/config/index.js';
import { getLogger } from '@/logger/index.js';
import { sanitizeCsvRows } from '@/security/sanitizer.js';
import type { LLMProvider } from '@/providers/llm/types.js';
import { ConcurrencyPool } from '@/utils/concurrency-pool.js';

import { BatchBuilder } from '../batching/batch.builder.js';
import { ExtractionCache } from '../cache/extraction.cache.js';
import { ColumnSemanticAnalyzer, CsvParser, HeaderAnalyzer } from '../extractors/index.js';
import { ConfidenceAnalyzer } from '../evaluation/confidence.analyzer.js';
import { MetricsCollector, ResponseBuilder } from '../metrics/metrics.collector.js';
import { NormalizationEngine } from '../normalizers/index.js';
import { PromptRegistry, type PromptVersion } from '../prompts/PromptRegistry.js';
import { ResponseValidator } from '../validators/response.validator.js';

import { PostProcessor } from './post-processor.js';
import { type PipelineProgressReporter, NoOpProgressReporter } from './progress.reporter.js';
import { RecoveryEngine } from './recovery.engine.js';

export interface ExtractionPipelineOptions {
  llmProvider: LLMProvider;
  promptVersion?: PromptVersion;
  importId?: string;
  reporter?: PipelineProgressReporter;
  retryRowIndices?: number[];
}

export class ExtractionPipeline {
  private readonly csvParser = new CsvParser();
  private readonly headerAnalyzer = new HeaderAnalyzer();
  private readonly columnAnalyzer = new ColumnSemanticAnalyzer();
  private readonly normalizer = new NormalizationEngine();
  private readonly batchBuilder = new BatchBuilder();
  private readonly recoveryEngine = new RecoveryEngine();
  private readonly confidenceAnalyzer = new ConfidenceAnalyzer();
  private readonly responseValidator = new ResponseValidator();
  private readonly postProcessor = new PostProcessor();
  private readonly metricsCollector = new MetricsCollector();
  private readonly responseBuilder = new ResponseBuilder();
  private readonly cache = new ExtractionCache();
  private readonly logger = getLogger();
  private readonly concurrencyPool = new ConcurrencyPool(config.extraction.maxConcurrentBatches);

  async execute(csvContent: string, options: ExtractionPipelineOptions): Promise<ExtractionPipelineResult> {
    const importId = options.importId ?? generateId('import');
    const promptVersion = options.promptVersion ?? config.extraction.promptVersion;
    const provider = options.llmProvider;
    const reporter = options.reporter ?? new NoOpProgressReporter();

    const cached = this.cache.get(importId);
    if (cached && !options.retryRowIndices) {
      return cached;
    }

    const startTime = Date.now();
    const batchLatencies: number[] = [];

    reporter.onStage('preparing', { rowsTotal: 0, rowsProcessed: 0 });

    const parsed = this.csvParser.parse(csvContent);
    const sanitizedRows = sanitizeCsvRows(parsed.rows);
    const parsedWithSanitized = { ...parsed, rows: sanitizedRows };

    reporter.onStage('analyzing_headers');
    const headerAnalysis = this.columnAnalyzer.enrich(this.headerAnalyzer.analyze(parsedWithSanitized.headers));

    reporter.onStage('normalizing');
    const normalized = this.normalizer.normalizeParsedData(parsedWithSanitized);

    this.metricsCollector.start(
      importId,
      promptVersion,
      provider.name as import('@groweasy/shared').LLMProviderName,
      provider.model,
      normalized.totalRows,
    );

    reporter.onStage('building_batches', { rowsTotal: normalized.totalRows });

    const activeHeaderContext = this.columnAnalyzer.getActiveColumns(headerAnalysis.columns);

    const batches = this.batchBuilder.buildBatches(normalized.rows, activeHeaderContext, {
      contextWindow: config.extraction.contextWindow,
      targetContextRatio: config.extraction.targetContextRatio,
      provider: provider.name as import('@groweasy/shared').LLMProviderName,
      model: provider.model,
      promptVersion,
      llmProvider: provider,
    });

    const filteredBatches = options.retryRowIndices
      ? this.filterBatchesForRetry(batches, options.retryRowIndices)
      : batches;

    reporter.onStage('processing_batch', {
      batchTotal: filteredBatches.length,
      batchCurrent: 0,
      rowsTotal: normalized.totalRows,
    });

    const allWarnings: ValidationWarning[] = [];
    let totalRetries = 0;
    let rowsProcessed = 0;

    const batchResults = await Promise.all(
      filteredBatches.map((batch, batchIndex) =>
        this.concurrencyPool.run(async () => {
          const batchStart = Date.now();
          reporter.onBatchStart(batchIndex, filteredBatches.length);

          this.logger.info(
            {
              batchId: batch.metadata.batchId,
              rowCount: batch.metadata.rowCount,
              estimatedTokens: batch.metadata.estimatedTokens,
            },
            'Processing extraction batch',
          );

          try {
            const recovery = await this.recoveryEngine.extractWithRecovery(
              batch,
              provider,
              promptVersion,
              config.extraction.maxRetries,
            );

            const remappedRows = recovery.rows.map((row, localIdx) => ({
              ...row,
              rowIndex: batch.metadata.rowIndices[localIdx] ?? batch.metadata.rowIndices[row.rowIndex] ?? row.rowIndex,
            }));

            const actualInputTokens = batch.metadata.estimatedTokens;
            const actualOutputTokens = remappedRows.length * 150;
            const actualCost = provider.estimateCost(actualInputTokens, actualOutputTokens);

            const batchLatency = Date.now() - batchStart;

            if (remappedRows.length === 0) {
              reporter.onBatchFailed(batchIndex, batch.metadata.batchId, batch.metadata.rowIndices);
            }

            this.logger.logAIRequest({
              batchId: batch.metadata.batchId,
              provider: provider.name,
              model: provider.model,
              inputTokens: actualInputTokens,
              outputTokens: actualOutputTokens,
              estimatedCostUsd: actualCost,
              retryCount: recovery.retries,
              processingTimeMs: batchLatency,
            });

            return {
              rows: remappedRows,
              warnings: recovery.warnings,
              retries: recovery.retries,
              batchLatency,
              batchIndex,
              inputTokens: actualInputTokens,
              outputTokens: actualOutputTokens,
              cost: actualCost,
            };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Batch failed';
            reporter.onBatchFailed(batchIndex, batch.metadata.batchId, batch.metadata.rowIndices, message);
            return {
              rows: [],
              warnings: [{
                code: 'BATCH_EXTRACTION_FAILED',
                message: `Batch ${batch.metadata.batchId}: ${message}`,
                severity: 'error' as const,
              }],
              retries: 0,
              batchLatency: Date.now() - batchStart,
              batchIndex,
              inputTokens: 0,
              outputTokens: 0,
              cost: 0,
            };
          }
        }),
      ),
    );

    for (const result of batchResults.sort((a, b) => a.batchIndex - b.batchIndex)) {
      totalRetries += result.retries;
      allWarnings.push(...result.warnings);
      batchLatencies.push(result.batchLatency);
      rowsProcessed += result.rows.length;

      this.metricsCollector.recordBatch(result.inputTokens, result.outputTokens, result.cost, result.retries);

      reporter.onBatchComplete(result.batchIndex, rowsProcessed, result.batchLatency, result.retries);
      reporter.onStage('processing_batch', {
        batchCurrent: result.batchIndex + 1,
        rowsProcessed,
        retries: totalRetries,
        estimatedCostUsd: this.metricsCollector.getEstimatedCost(),
        estimatedTokens: this.metricsCollector.getEstimatedTokens(),
      });
    }

    const allRawRows = batchResults.flatMap((r) => r.rows);

    reporter.onStage('validating');

    let records: CrmRecord[] = allRawRows.map((rawRow) =>
      this.confidenceAnalyzer.analyzeRow(rawRow, headerAnalysis.columns),
    );

    records = this.postProcessor.process(records);

    const duplicateWarnings = this.responseValidator.detectDuplicates(records);
    const crmWarnings = this.responseValidator.validateCrmRecords(records);
    allWarnings.push(...duplicateWarnings, ...crmWarnings);

    for (const warning of allWarnings) {
      this.metricsCollector.recordWarning(warning);
    }

    this.metricsCollector.recordSuccess(records.length);
    this.metricsCollector.recordSkipped(normalized.totalRows - records.length);

    reporter.onStage('finalizing');

    const durationMs = Date.now() - startTime;
    const metrics = this.metricsCollector.finalize();
    metrics.retries = totalRetries;
    metrics.rowsPerSecond = durationMs > 0 ? Math.round((records.length / durationMs) * 1000 * 100) / 100 : 0;
    metrics.averageBatchLatencyMs =
      batchLatencies.length > 0
        ? Math.round(batchLatencies.reduce((a, b) => a + b, 0) / batchLatencies.length)
        : 0;
    metrics.successPercent =
      normalized.totalRows > 0 ? Math.round((records.length / normalized.totalRows) * 100) : 0;
    metrics.skippedPercent =
      normalized.totalRows > 0 ? Math.round(((normalized.totalRows - records.length) / normalized.totalRows) * 100) : 0;

    const result = this.responseBuilder.build(records, metrics, headerAnalysis, allWarnings);
    this.cache.set(importId, result);

    reporter.onStage('complete', {
      rowsProcessed: records.length,
      rowsTotal: normalized.totalRows,
      rowsSkipped: normalized.totalRows - records.length,
    });

    this.logger.info(
      {
        importId,
        promptVersion,
        provider: provider.name,
        totalRows: metrics.totalRows,
        successfulRows: metrics.successfulRows,
        estimatedCostUsd: metrics.estimatedCostUsd,
        retries: metrics.retries,
        durationMs: metrics.processingDurationMs,
        rowsPerSecond: metrics.rowsPerSecond,
      },
      'Extraction pipeline completed',
    );

    return result;
  }

  private filterBatchesForRetry(
    batches: ExtractionBatch[],
    retryRowIndices: number[],
  ): ExtractionBatch[] {
    const retrySet = new Set(retryRowIndices);
    return batches
      .map((batch) => {
        const matchingIndices: number[] = [];
        const matchingRows: Record<string, string>[] = [];

        for (let i = 0; i < batch.metadata.rowIndices.length; i++) {
          const rowIndex = batch.metadata.rowIndices[i];
          if (rowIndex !== undefined && retrySet.has(rowIndex)) {
            matchingIndices.push(rowIndex);
            const row = batch.rows[i];
            if (row) matchingRows.push(row);
          }
        }

        if (matchingRows.length === 0) return null;

        return {
          ...batch,
          rows: matchingRows,
          metadata: {
            ...batch.metadata,
            rowCount: matchingRows.length,
            rowIndices: matchingIndices,
          },
        };
      })
      .filter((b): b is ExtractionBatch => b !== null);
  }

  analyzeHeaders(csvContent: string): {
    totalRows: number;
    headers: string[];
    duplicateHeaders: string[];
    delimiter: string;
    headerAnalysis: HeaderAnalysisResult;
  } {
    const parsed = this.csvParser.parse(csvContent);
    const headerAnalysis = this.columnAnalyzer.enrich(this.headerAnalyzer.analyze(parsed.headers));
    return {
      totalRows: parsed.totalRows,
      headers: parsed.headers,
      duplicateHeaders: parsed.duplicateHeaders ?? [],
      delimiter: delimiterLabel(detectCsvDelimiter(csvContent)),
      headerAnalysis,
    };
  }
}
