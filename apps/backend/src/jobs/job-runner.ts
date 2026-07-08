import { generateId } from '@groweasy/shared';
import type {
  ExtractionPipelineResult,
  ImportProgressStage,
  ImportJobProgress,
  FailedBatchInfo,
} from '@groweasy/shared';
import { IMPORT_STAGE_LABELS } from '@groweasy/shared';

import type { PipelineProgressReporter } from '@/ai/pipeline/progress.reporter.js';
import { importJobStore } from '@/jobs/import-job.store.js';

export function createJobProgressReporter(importId: string): PipelineProgressReporter {
  const failedBatches: FailedBatchInfo[] = [];

  return {
    onStage(stage: ImportProgressStage, updates?: Partial<ImportJobProgress>): void {
      importJobStore.updateProgress(importId, {
        stage,
        stageLabel: IMPORT_STAGE_LABELS[stage],
        status: stage === 'complete' ? 'completed' : 'running',
        ...updates,
      });
    },

    onBatchStart(batchIndex: number, batchTotal: number): void {
      importJobStore.updateProgress(importId, {
        batchCurrent: batchIndex,
        batchTotal,
        stage: 'processing_batch',
        stageLabel: `Processing Batch ${String(batchIndex + 1)}/${String(batchTotal)}`,
      });
    },

    onBatchComplete(_batchIndex: number, rowsProcessed: number, batchLatencyMs: number, _retries: number): void {
      const job = importJobStore.getJob(importId);
      if (!job) return;

      const elapsed = Date.now() - new Date(job.progress.startedAt).getTime();
      const rowsPerSecond = elapsed > 0 ? Math.round((rowsProcessed / elapsed) * 1000 * 100) / 100 : 0;

      importJobStore.updateProgress(importId, {
        rowsProcessed,
        rowsPerSecond,
        averageBatchLatencyMs: batchLatencyMs,
      });
    },

    onBatchFailed(batchIndex: number, batchId: string, rowIndices: number[], error?: string): void {
      const info: FailedBatchInfo = { batchId, batchIndex, rowIndices };
      if (error !== undefined) info.error = error;
      failedBatches.push(info);
      const job = importJobStore.getJob(importId);
      if (job) {
        job.failedBatches = failedBatches;
      }
    },
  };
}

export function completeJob(importId: string, result: ExtractionPipelineResult): void {
  importJobStore.complete(importId, result);
}

export function failJob(importId: string, error: string): void {
  importJobStore.fail(importId, error);
}

export function createImportId(): string {
  return generateId('import');
}
