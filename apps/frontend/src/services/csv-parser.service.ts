import Papa from 'papaparse';

import { detectCsvDelimiter } from '@groweasy/shared';

export interface ParsedCsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: string[];
  delimiter: string;
}

export function parseCsvPreview(content: string, maxRows = 50): ParsedCsvPreview {
  const delimiter = detectCsvDelimiter(content);

  const result = Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
    preview: maxRows,
    transformHeader: (h) => h.trim(),
  });

  const errors = result.errors.map((e) => e.message);
  const totalRows = countCsvRows(content, delimiter);

  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
    totalRows,
    errors,
    delimiter,
  };
}

export function countCsvRows(content: string, delimiter = detectCsvDelimiter(content)): number {
  const parsed = Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });
  return parsed.data.length;
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

export const CRM_FIELD_LABELS: Record<string, string> = {
  fullName: 'Name',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  title: 'Title',
  city: 'City',
  state: 'State',
  country: 'Country',
  zipCode: 'Postal code',
  leadOwner: 'Lead owner',
  crmStatus: 'CRM status',
  dataSource: 'Data source',
  source: 'Source',
  notes: 'Notes',
  createdAt: 'Created at',
  unknown: 'Unmapped',
};
