import type { CrmRecord, HeaderAnalysisResult, ImportMetrics, ValidationWarning } from '@groweasy/shared';
import type { LLMProviderName } from '@groweasy/shared';

export class MetricsCollector {
  private importId = '';
  private promptVersion = '';
  private model = '';
  private provider: LLMProviderName = 'anthropic';
  private startTime = '';
  private totalRows = 0;
  private successfulRows = 0;
  private skippedRows = 0;
  private retries = 0;
  private estimatedInputTokens = 0;
  private estimatedOutputTokens = 0;
  private estimatedCostUsd = 0;
  private warnings: ValidationWarning[] = [];
  private errors: ValidationWarning[] = [];

  start(importId: string, promptVersion: string, provider: LLMProviderName, model: string, totalRows: number): void {
    this.reset();
    this.importId = importId;
    this.promptVersion = promptVersion;
    this.provider = provider;
    this.model = model;
    this.totalRows = totalRows;
    this.startTime = new Date().toISOString();
  }

  reset(): void {
    this.importId = '';
    this.promptVersion = '';
    this.model = '';
    this.provider = 'anthropic';
    this.startTime = '';
    this.totalRows = 0;
    this.successfulRows = 0;
    this.skippedRows = 0;
    this.retries = 0;
    this.estimatedInputTokens = 0;
    this.estimatedOutputTokens = 0;
    this.estimatedCostUsd = 0;
    this.warnings = [];
    this.errors = [];
  }

  recordBatch(inputTokens: number, outputTokens: number, cost: number, batchRetries: number): void {
    this.estimatedInputTokens += inputTokens;
    this.estimatedOutputTokens += outputTokens;
    this.estimatedCostUsd += cost;
    this.retries += batchRetries;
  }

  recordWarning(warning: ValidationWarning): void {
    if (warning.severity === 'error') {
      this.errors.push(warning);
    } else {
      this.warnings.push(warning);
    }
  }

  recordSuccess(count: number): void {
    this.successfulRows += count;
  }

  recordSkipped(count: number): void {
    this.skippedRows += count;
  }

  getEstimatedCost(): number {
    return this.estimatedCostUsd;
  }

  getEstimatedTokens(): number {
    return this.estimatedInputTokens + this.estimatedOutputTokens;
  }

  finalize(): ImportMetrics {
    const endTime = new Date().toISOString();
    const processingDurationMs =
      new Date(endTime).getTime() - new Date(this.startTime).getTime();

    return {
      importId: this.importId,
      promptVersion: this.promptVersion,
      model: this.model,
      provider: this.provider,
      startTime: this.startTime,
      endTime,
      processingDurationMs,
      totalRows: this.totalRows,
      successfulRows: this.successfulRows,
      skippedRows: this.skippedRows,
      retries: this.retries,
      estimatedInputTokens: this.estimatedInputTokens,
      estimatedOutputTokens: this.estimatedOutputTokens,
      estimatedCostUsd: this.estimatedCostUsd,
      warnings: this.warnings,
      errors: this.errors,
    };
  }
}

export class ResponseBuilder {
  build(
    records: CrmRecord[],
    metrics: ImportMetrics,
    headerAnalysis: HeaderAnalysisResult,
    warnings: ValidationWarning[],
  ) {
    return {
      importId: metrics.importId,
      records,
      metrics,
      headerAnalysis,
      warnings,
    };
  }
}
