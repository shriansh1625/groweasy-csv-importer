import type { LLM_PROVIDERS } from '../constants/index.js';

export type HttpStatus = (typeof import('../constants/index.js').HTTP_STATUS)[keyof typeof import('../constants/index.js').HTTP_STATUS];

export type ErrorCode = (typeof import('../constants/index.js').ERROR_CODES)[keyof typeof import('../constants/index.js').ERROR_CODES];

export type LLMProviderName = (typeof LLM_PROVIDERS)[number];

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: ResponseMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  durationMs?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LLMCompletionRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMCompletionResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
}

export interface LLMUsageMetrics {
  batchId: string;
  provider: LLMProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  retryCount: number;
  processingTimeMs: number;
}

export interface RequestContext {
  requestId: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: Record<string, { status: 'pass' | 'fail'; message?: string }>;
}

export type {
  CrmFieldName,
  CrmStatus,
  DataSource,
  ConfidenceLevel,
  FieldConfidence,
  CrmRecord,
  SemanticFieldType,
  ColumnSemanticMetadata,
  HeaderAnalysisResult,
  ParsedCsvData,
  NormalizedCsvData,
  BatchMetadata,
  ExtractionBatch,
  ValidationWarning,
  RawExtractionRow,
  ImportMetrics,
  ExtractionPipelineResult,
  PipelineContext,
} from './extraction.js';

export type {
  ImportJobStatus,
  ImportProgressStage,
  ImportJobProgress,
  ImportProgressEvent,
  ImportProgressEventType,
  StartImportRequest,
  StartImportResponse,
  RetryImportRequest,
  ExportFormat,
  FailedBatchInfo,
  ImportJobState,
} from './import-job.js';

export { IMPORT_STAGE_LABELS } from './import-job.js';
