import Papa from 'papaparse';

export interface ParsedCsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: string[];
}

export function parseCsvPreview(content: string, maxRows = 50): ParsedCsvPreview {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    preview: maxRows,
    transformHeader: (h) => h.trim(),
  });

  const errors = result.errors.map((e) => e.message);

  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
    totalRows: result.data.length,
    errors,
  };
}

export function countCsvRows(content: string): number {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  return Math.max(0, lines.length - 1);
}

export function estimateImportMetrics(rowCount: number, columnCount: number) {
  const estimatedTokens = rowCount * columnCount * 12 + 2000;
  const estimatedCostUsd = (estimatedTokens / 1_000_000) * 3.5;
  const estimatedSeconds = Math.max(3, Math.ceil(rowCount / 50) * 4);

  return { estimatedTokens, estimatedCostUsd, estimatedSeconds };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCurrency(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(usd);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${String(ms)}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${String(seconds)}s`;
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60)}s`;
}
