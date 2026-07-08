import type { ImportJobProgress, ImportProgressStage } from '@groweasy/shared';

export interface PipelineProgressReporter {
  onStage(stage: ImportProgressStage, updates?: Partial<ImportJobProgress>): void;
  onBatchStart(batchIndex: number, batchTotal: number): void;
  onBatchComplete(batchIndex: number, rowsProcessed: number, batchLatencyMs: number, retries: number): void;
  onBatchFailed(batchIndex: number, batchId: string, rowIndices: number[], error?: string): void;
}

export class NoOpProgressReporter implements PipelineProgressReporter {
  onStage(): void {}
  onBatchStart(): void {}
  onBatchComplete(): void {}
  onBatchFailed(): void {}
}
