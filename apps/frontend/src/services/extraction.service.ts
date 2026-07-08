import type {
  ApiResponse,
  ExportFormat,
  ExtractionPipelineResult,
  HeaderAnalysisResult,
  ImportJobProgress,
  ImportProgressEvent,
  StartImportResponse,
} from '@groweasy/shared';

import { API_ROUTES } from '@/config/app';
import type { ImportProgress } from '@/stores/import.store';

export interface CsvAnalyzeResult {
  totalRows: number;
  headers: string[];
  duplicateHeaders: string[];
  delimiter: string;
  headerAnalysis: HeaderAnalysisResult;
}

export async function analyzeCsv(csvContent: string): Promise<CsvAnalyzeResult> {
  const response = await fetch(API_ROUTES.extractAnalyze, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvContent }),
  });

  const body = (await response.json()) as ApiResponse<CsvAnalyzeResult>;

  if (!response.ok || !body.success || !body.data) {
    const message = body.error?.message ?? `Failed to analyze CSV (${String(response.status)})`;
    throw new Error(message);
  }

  return body.data;
}

export async function startImport(csvContent: string): Promise<StartImportResponse> {
  const response = await fetch(API_ROUTES.extractStart, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvContent }),
  });

  const body = (await response.json()) as ApiResponse<StartImportResponse>;

  if (!response.ok || !body.success || !body.data) {
    const message = body.error?.message ?? `Failed to start import (${String(response.status)})`;
    throw new Error(message);
  }

  return body.data;
}

export function subscribeToImportEvents(
  importId: string,
  onEvent: (event: ImportProgressEvent) => void,
  onError?: (error: Error) => void,
): () => void {
  const url = API_ROUTES.extractEvents(importId);
  const eventSource = new EventSource(url);

  eventSource.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data as string) as ImportProgressEvent;
      onEvent(event);
      if (event.type === 'complete' || event.type === 'error') {
        eventSource.close();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to parse SSE event'));
    }
  };

  eventSource.onerror = () => {
    onError?.(new Error('SSE connection lost'));
    eventSource.close();
  };

  return () => eventSource.close();
}

/** SSE with polling fallback when the stream drops (e.g. proxy timeout). */
export function subscribeWithImportFallback(
  importId: string,
  onEvent: (event: ImportProgressEvent) => void,
): () => void {
  let stopped = false;
  let pollTimer: ReturnType<typeof setInterval> | undefined;

  const stop = () => {
    stopped = true;
    if (pollTimer) clearInterval(pollTimer);
  };

  const poll = () => {
    void pollImportStatus(importId)
      .then((progress) => {
        if (stopped) return;
        onEvent({ type: 'progress', progress, timestamp: new Date().toISOString() });
        if (progress.status === 'completed') {
          void fetchImportResult(importId).then((result) => {
            onEvent({ type: 'complete', result, timestamp: new Date().toISOString() });
          });
          stop();
        }
        if (progress.status === 'failed') {
          onEvent({
            type: 'error',
            error: progress.error ?? 'Import failed',
            timestamp: new Date().toISOString(),
          });
          stop();
        }
      })
      .catch(() => {
        // Keep polling through transient network errors
      });
  };

  const unsub = subscribeToImportEvents(importId, onEvent, () => {
    if (stopped) return;
    poll();
    pollTimer = setInterval(poll, 2000);
  });

  return () => {
    stop();
    unsub();
  };
}

export async function pollImportStatus(importId: string): Promise<ImportJobProgress> {
  const response = await fetch(API_ROUTES.extractStatus(importId));
  const body = (await response.json()) as ApiResponse<ImportJobProgress>;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to fetch import status');
  }

  return body.data;
}

export async function fetchImportResult(importId: string): Promise<ExtractionPipelineResult> {
  const response = await fetch(API_ROUTES.extractResult(importId));
  const body = (await response.json()) as ApiResponse<ExtractionPipelineResult>;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to fetch import result');
  }

  return body.data;
}

export async function retryImport(importId: string, rowIndices?: number[]): Promise<StartImportResponse> {
  const response = await fetch(API_ROUTES.extractRetry(importId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rowIndices ? { rowIndices } : {}),
  });

  const body = (await response.json()) as ApiResponse<StartImportResponse>;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Retry failed');
  }

  return body.data;
}

export async function downloadExport(importId: string, format: ExportFormat): Promise<void> {
  const url = `${API_ROUTES.extractExport(importId)}?format=${encodeURIComponent(format)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Export failed (${String(response.status)})`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? `${importId}-${format.replace('-', '.')}`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

/** @deprecated Use startImport + SSE */
export async function extractCsv(csvContent: string): Promise<ExtractionPipelineResult> {
  const response = await fetch(API_ROUTES.extract, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvContent }),
  });

  const body = (await response.json()) as ApiResponse<ExtractionPipelineResult>;

  if (!response.ok || !body.success || !body.data) {
    const message = body.error?.message ?? `Extraction failed (${String(response.status)})`;
    throw new Error(message);
  }

  return body.data;
}

export async function fetchHealthStatus(): Promise<'online' | 'offline'> {
  try {
    const response = await fetch(API_ROUTES.health);
    if (!response.ok) return 'offline';
    const body = (await response.json()) as ApiResponse<{ status: string }>;
    return body.data?.status === 'healthy' ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

export function mapJobProgressToStore(progress: ImportJobProgress): Partial<ImportProgress> {
  const mapped: Partial<ImportProgress> = {
    importId: progress.importId,
    stageLabel: progress.stageLabel,
    rowsProcessed: progress.rowsProcessed,
    rowsTotal: progress.rowsTotal,
    batchCurrent: progress.batchCurrent,
    batchTotal: progress.batchTotal,
    estimatedTokens: progress.estimatedTokens,
    estimatedCostUsd: progress.estimatedCostUsd,
    provider: progress.provider,
    model: progress.model,
    retries: progress.retries,
  };

  if (progress.rowsPerSecond !== undefined) mapped.rowsPerSecond = progress.rowsPerSecond;
  if (progress.averageBatchLatencyMs !== undefined) mapped.averageBatchLatencyMs = progress.averageBatchLatencyMs;
  if (progress.successPercent !== undefined) mapped.successPercent = progress.successPercent;
  if (progress.skippedPercent !== undefined) mapped.skippedPercent = progress.skippedPercent;

  return mapped;
}
