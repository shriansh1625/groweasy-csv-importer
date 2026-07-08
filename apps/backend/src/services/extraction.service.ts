import { generateId, NotFoundError, UploadError } from '@groweasy/shared';
import type { CrmRecord, ExtractionPipelineResult, ExportFormat } from '@groweasy/shared';

import { ExtractionPipeline } from '@/ai/pipeline/extraction.pipeline.js';
import { createLLMProvider } from '@/ai/providers/index.js';
import { config } from '@/config/index.js';
import { importJobStore } from '@/jobs/import-job.store.js';
import { createImportId, createJobProgressReporter, completeJob, failJob } from '@/jobs/job-runner.js';
import { validateCsvContent } from '@/security/sanitizer.js';
import type { LLMProvider } from '@/providers/llm/types.js';

import { exportResult } from './export.service.js';

export class ExtractionService {
  private readonly pipeline = new ExtractionPipeline();

  async startImport(
    csvContent: string,
    options?: { llmProvider?: LLMProvider },
  ): Promise<{ importId: string; status: 'pending' }> {
    validateCsvContent(csvContent, config.upload.maxSizeBytes);

    const provider = options?.llmProvider ?? createLLMProvider();
    const importId = createImportId();

    importJobStore.createJob(
      importId,
      csvContent,
      provider.name as import('@groweasy/shared').LLMProviderName,
      provider.model,
      config.extraction.promptVersion,
    );

    void this.runImportAsync(importId, csvContent, provider);

    return { importId, status: 'pending' };
  }

  async extractFromCsv(
    csvContent: string,
    options?: { llmProvider?: LLMProvider; importId?: string },
  ): Promise<ExtractionPipelineResult> {
    validateCsvContent(csvContent, config.upload.maxSizeBytes);
    const llmProvider = options?.llmProvider ?? createLLMProvider();
    const importId = options?.importId ?? generateId('import');

    return this.pipeline.execute(csvContent, { llmProvider, importId });
  }

  getJobStatus(importId: string) {
    const job = importJobStore.getJob(importId);
    if (!job) throw new NotFoundError(`Import job ${importId} not found`);
    return job.progress;
  }

  getJobResult(importId: string): ExtractionPipelineResult {
    const job = importJobStore.getJob(importId);
    if (!job) throw new NotFoundError(`Import job ${importId} not found`);
    if (!job.result) throw new NotFoundError(`Import job ${importId} is not complete`);
    return job.result;
  }

  subscribeToProgress(importId: string, listener: (event: import('@groweasy/shared').ImportProgressEvent) => void) {
    const job = importJobStore.getJob(importId);
    if (!job) throw new NotFoundError(`Import job ${importId} not found`);
    return importJobStore.subscribe(importId, listener);
  }

  async retryFailedRows(importId: string, rowIndices?: number[]): Promise<{ importId: string; status: 'pending' }> {
    const job = importJobStore.getJob(importId);
    if (!job) throw new NotFoundError(`Import job ${importId} not found`);

    const indices =
      rowIndices ??
      job.failedBatches.flatMap((b) => b.rowIndices);

    if (indices.length === 0) {
      throw new UploadError('No failed rows to retry');
    }

    const provider = createLLMProvider();
    importJobStore.updateStatus(importId, 'running');

    void this.runRetryAsync(importId, job.csvContent, provider, indices);

    return { importId, status: 'pending' };
  }

  exportImport(importId: string, format: ExportFormat) {
    const result = this.getJobResult(importId);
    return exportResult(result, format);
  }

  private async runImportAsync(importId: string, csvContent: string, provider: LLMProvider): Promise<void> {
    try {
      importJobStore.updateStatus(importId, 'running');
      const reporter = createJobProgressReporter(importId);

      const result = await this.pipeline.execute(csvContent, {
        llmProvider: provider,
        importId,
        reporter,
      });

      completeJob(importId, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      failJob(importId, message);
    }
  }

  private async runRetryAsync(
    importId: string,
    csvContent: string,
    provider: LLMProvider,
    rowIndices: number[],
  ): Promise<void> {
    try {
      const reporter = createJobProgressReporter(importId);
      const existingJob = importJobStore.getJob(importId);
      const existingResult = existingJob?.result;

      const retryResult = await this.pipeline.execute(csvContent, {
        llmProvider: provider,
        importId,
        reporter,
        retryRowIndices: rowIndices,
      });

      if (existingResult) {
        const mergedByKey = new Map<string, CrmRecord>();
        const recordKey = (r: CrmRecord) =>
          r.email.value ?? r.phone.value ?? r.fullName.value ?? '';

        for (const record of existingResult.records) {
          const key = recordKey(record);
          if (key) mergedByKey.set(key, record);
        }
        for (const record of retryResult.records) {
          const key = recordKey(record);
          if (key) mergedByKey.set(key, record);
        }

        const mergedRecords = [...mergedByKey.values()];

        const merged: ExtractionPipelineResult = {
          ...retryResult,
          records: mergedRecords,
          metrics: {
            ...retryResult.metrics,
            successfulRows: mergedRecords.length,
            retries: existingResult.metrics.retries + retryResult.metrics.retries,
          },
        };
        completeJob(importId, merged);
      } else {
        completeJob(importId, retryResult);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Retry failed';
      failJob(importId, message);
    }
  }
}
