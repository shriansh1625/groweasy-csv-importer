import type {
  ExtractionPipelineResult,
  ImportJobProgress,
  ImportJobState,
  ImportJobStatus,
  ImportProgressEvent,
  ImportProgressStage,
  LLMProviderName,
  ValidationWarning,
} from '@groweasy/shared';
import { IMPORT_STAGE_LABELS } from '@groweasy/shared';

import { config } from '@/config/index.js';

type ProgressListener = (event: ImportProgressEvent) => void;

export class ImportJobStore {
  private readonly jobs = new Map<string, ImportJobState>();
  private readonly listeners = new Map<string, Set<ProgressListener>>();
  private readonly ttlMs: number;

  constructor(ttlMs = 3_600_000) {
    this.ttlMs = ttlMs;
  }

  createJob(importId: string, csvContent: string, provider: LLMProviderName, model: string, promptVersion: string): ImportJobState {
    const progress = this.buildProgress(importId, provider, model, promptVersion);
    const job: ImportJobState = {
      importId,
      status: 'pending',
      csvContent,
      progress,
      failedBatches: [],
      warnings: [],
    };
    this.jobs.set(importId, job);
    this.scheduleCleanup(importId);
    return job;
  }

  getJob(importId: string): ImportJobState | undefined {
    return this.jobs.get(importId);
  }

  updateStatus(importId: string, status: ImportJobStatus): void {
    const job = this.jobs.get(importId);
    if (!job) return;
    job.status = status;
    job.progress.status = status;
    this.emit(importId, { type: 'progress', timestamp: new Date().toISOString(), progress: { ...job.progress } });
  }

  updateProgress(importId: string, updates: Partial<ImportJobProgress>): void {
    const job = this.jobs.get(importId);
    if (!job) return;

    job.progress = { ...job.progress, ...updates };
    if (updates.stage) {
      job.progress.stageLabel = IMPORT_STAGE_LABELS[updates.stage] ?? job.progress.stageLabel;
    }

    this.emit(importId, { type: 'progress', timestamp: new Date().toISOString(), progress: { ...job.progress } });
  }

  addWarnings(importId: string, warnings: ValidationWarning[]): void {
    const job = this.jobs.get(importId);
    if (!job) return;
    job.warnings.push(...warnings);
    job.progress.warningsCount = job.warnings.length;
  }

  complete(importId: string, result: ExtractionPipelineResult): void {
    const job = this.jobs.get(importId);
    if (!job) return;

    job.status = 'completed';
    job.result = result;
    job.progress = {
      ...job.progress,
      status: 'completed',
      stage: 'complete',
      stageLabel: IMPORT_STAGE_LABELS.complete,
      rowsProcessed: result.metrics.successfulRows,
      rowsTotal: result.metrics.totalRows,
      rowsSkipped: result.metrics.skippedRows,
      retries: result.metrics.retries,
      estimatedCostUsd: result.metrics.estimatedCostUsd,
      estimatedTokens: result.metrics.estimatedInputTokens + result.metrics.estimatedOutputTokens,
      completedAt: new Date().toISOString(),
      ...(result.metrics.rowsPerSecond !== undefined ? { rowsPerSecond: result.metrics.rowsPerSecond } : {}),
      ...(result.metrics.averageBatchLatencyMs !== undefined
        ? { averageBatchLatencyMs: result.metrics.averageBatchLatencyMs }
        : {}),
      ...(result.metrics.successPercent !== undefined ? { successPercent: result.metrics.successPercent } : {}),
      ...(result.metrics.skippedPercent !== undefined ? { skippedPercent: result.metrics.skippedPercent } : {}),
    };

    this.emit(importId, {
      type: 'complete',
      timestamp: new Date().toISOString(),
      progress: { ...job.progress },
      result,
    });
  }

  fail(importId: string, error: string): void {
    const job = this.jobs.get(importId);
    if (!job) return;

    job.status = 'failed';
    job.progress.status = 'failed';
    job.progress.error = error;
    job.progress.completedAt = new Date().toISOString();

    this.emit(importId, {
      type: 'error',
      timestamp: new Date().toISOString(),
      progress: { ...job.progress },
      error,
    });
  }

  subscribe(importId: string, listener: ProgressListener): () => void {
    if (!this.listeners.has(importId)) {
      this.listeners.set(importId, new Set());
    }
    this.listeners.get(importId)!.add(listener);

    const job = this.jobs.get(importId);
    if (job) {
      if (job.status === 'completed' && job.result) {
        listener({
          type: 'complete',
          timestamp: new Date().toISOString(),
          progress: { ...job.progress },
          result: job.result,
        });
      } else if (job.status === 'failed') {
        listener({
          type: 'error',
          timestamp: new Date().toISOString(),
          progress: { ...job.progress },
          ...(job.progress.error !== undefined ? { error: job.progress.error } : {}),
        });
      } else {
        listener({ type: 'progress', timestamp: new Date().toISOString(), progress: { ...job.progress } });
      }
    }

    return () => {
      this.listeners.get(importId)?.delete(listener);
    };
  }

  private emit(importId: string, event: ImportProgressEvent): void {
    const set = this.listeners.get(importId);
    if (!set) return;
    for (const listener of set) {
      listener(event);
    }
  }

  private buildProgress(
    importId: string,
    provider: LLMProviderName,
    model: string,
    promptVersion: string,
  ): ImportJobProgress {
    return {
      importId,
      status: 'pending',
      stage: 'preparing',
      stageLabel: IMPORT_STAGE_LABELS.preparing,
      rowsProcessed: 0,
      rowsTotal: 0,
      rowsSkipped: 0,
      batchCurrent: 0,
      batchTotal: 0,
      warningsCount: 0,
      retries: 0,
      estimatedCostUsd: 0,
      estimatedTokens: 0,
      provider,
      model,
      promptVersion,
      startedAt: new Date().toISOString(),
    };
  }

  private scheduleCleanup(importId: string): void {
    setTimeout(() => {
      this.jobs.delete(importId);
      this.listeners.delete(importId);
    }, this.ttlMs);
  }
}

export const importJobStore = new ImportJobStore(config.extraction.jobTtlMs);
