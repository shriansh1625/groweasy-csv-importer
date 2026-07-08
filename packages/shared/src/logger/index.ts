import type { LLMUsageMetrics, RequestContext } from '../types/index.js';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export interface LogContext {
  requestId?: string;
  batchId?: string;
  durationMs?: number;
  status?: number;
  [key: string]: unknown;
}

export interface RequestLogContext extends LogContext {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
}

export interface AILogContext extends LogContext {
  batchId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  retryCount: number;
  processingTimeMs: number;
}

export interface Logger {
  fatal(context: LogContext, message: string): void;
  error(context: LogContext, message: string): void;
  warn(context: LogContext, message: string): void;
  info(context: LogContext, message: string): void;
  debug(context: LogContext, message: string): void;
  trace(context: LogContext, message: string): void;
  child(context: LogContext): Logger;
  logRequest(context: RequestLogContext): void;
  logAIRequest(context: AILogContext): void;
}

export function createRequestContext(requestId: string, extras?: Partial<RequestContext>): RequestContext {
  return {
    requestId,
    timestamp: new Date().toISOString(),
    ...extras,
  };
}

export function aiMetricsToLogContext(metrics: LLMUsageMetrics): AILogContext {
  return {
    batchId: metrics.batchId,
    provider: metrics.provider,
    model: metrics.model,
    inputTokens: metrics.inputTokens,
    outputTokens: metrics.outputTokens,
    estimatedCostUsd: metrics.estimatedCostUsd,
    retryCount: metrics.retryCount,
    processingTimeMs: metrics.processingTimeMs,
  };
}
