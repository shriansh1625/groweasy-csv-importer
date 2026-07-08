import type { LLMProviderName } from './index.js';
import type { ExtractionPipelineResult, ValidationWarning } from './extraction.js';

export type ImportJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ImportProgressStage =
  | 'preparing'
  | 'analyzing_headers'
  | 'normalizing'
  | 'building_batches'
  | 'processing_batch'
  | 'validating'
  | 'finalizing'
  | 'complete';

export const IMPORT_STAGE_LABELS: Record<ImportProgressStage, string> = {
  preparing: 'Preparing CSV',
  analyzing_headers: 'Analyzing Headers',
  normalizing: 'Normalizing Data',
  building_batches: 'Building Batches',
  processing_batch: 'Processing Batch',
  validating: 'Validating Results',
  finalizing: 'Finalizing',
  complete: 'Complete',
};

export interface ImportJobProgress {
  importId: string;
  status: ImportJobStatus;
  stage: ImportProgressStage;
  stageLabel: string;
  rowsProcessed: number;
  rowsTotal: number;
  rowsSkipped: number;
  batchCurrent: number;
  batchTotal: number;
  warningsCount: number;
  retries: number;
  estimatedCostUsd: number;
  estimatedTokens: number;
  provider: LLMProviderName;
  model: string;
  promptVersion: string;
  rowsPerSecond?: number;
  averageBatchLatencyMs?: number;
  successPercent?: number;
  skippedPercent?: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export type ImportProgressEventType = 'progress' | 'complete' | 'error';

export interface ImportProgressEvent {
  type: ImportProgressEventType;
  timestamp: string;
  progress?: ImportJobProgress;
  result?: ExtractionPipelineResult;
  error?: string;
}

export interface StartImportRequest {
  csv: string;
  importId?: string;
}

export interface StartImportResponse {
  importId: string;
  status: ImportJobStatus;
}

export interface RetryImportRequest {
  rowIndices?: number[];
}

export type ExportFormat = 'crm-csv' | 'json' | 'skipped-csv' | 'warnings-csv' | 'report-json';

export interface FailedBatchInfo {
  batchId: string;
  batchIndex: number;
  rowIndices: number[];
  error?: string;
}

export interface ImportJobState {
  importId: string;
  status: ImportJobStatus;
  csvContent: string;
  progress: ImportJobProgress;
  result?: ExtractionPipelineResult;
  failedBatches: FailedBatchInfo[];
  warnings: ValidationWarning[];
}
