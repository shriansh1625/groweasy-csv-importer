import type { CrmFieldName, ParsedCsvData } from '@groweasy/shared';

import { normalizeDate } from './date.normalizer.js';
import { normalizeEmail } from './email.normalizer.js';
import { normalizePhone } from './phone.normalizer.js';
import { normalizeText, normalizeHeader } from './text.normalizer.js';

export class NormalizationEngine {
  normalizeParsedData(data: ParsedCsvData): ParsedCsvData {
    const dedupedHeaders = this.removeDuplicateColumns(data.headers);
    const nonEmptyHeaders = this.removeEmptyColumns(dedupedHeaders, data.rows);
    const uniqueRows = this.deduplicateRows(data.rows, nonEmptyHeaders);

    const normalizedRows = uniqueRows.map((row) => this.normalizeRow(row, nonEmptyHeaders));

    return {
      headers: nonEmptyHeaders,
      rows: normalizedRows,
      totalRows: normalizedRows.length,
      duplicateRowIndices: data.duplicateRowIndices,
    };
  }

  private removeDuplicateColumns(headers: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const header of headers) {
      const key = normalizeHeader(header);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(header);
      }
    }

    return result;
  }

  private removeEmptyColumns(headers: string[], rows: Record<string, string>[]): string[] {
    return headers.filter((header) =>
      rows.some((row) => {
        const value = row[header];
        return value !== undefined && value.trim().length > 0;
      }),
    );
  }

  private deduplicateRows(
    rows: Record<string, string>[],
    headers: string[],
  ): Record<string, string>[] {
    const seen = new Set<string>();
    const result: Record<string, string>[] = [];

    for (const row of rows) {
      const fingerprint = headers.map((h) => row[h] ?? '').join('|');
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        result.push(row);
      }
    }

    return result;
  }

  private normalizeRow(row: Record<string, string>, headers: string[]): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const header of headers) {
      const raw = row[header] ?? '';
      normalized[header] = this.normalizeFieldValue(raw, header);
    }

    return normalized;
  }

  private normalizeFieldValue(value: string, header: string): string {
    const text = normalizeText(value);
    const headerLower = normalizeHeader(header);

    if (/mail|email|e-mail/.test(headerLower)) {
      return normalizeEmail(text) ?? text;
    }

    if (/phone|mobile|contact|whatsapp|tel/.test(headerLower)) {
      return normalizePhone(text) ?? text;
    }

    if (/date|created|updated|dob/.test(headerLower)) {
      return normalizeDate(text) ?? text;
    }

    return text;
  }

  normalizeCrmFieldValue(field: CrmFieldName, value: string | null): string | null {
    if (value === null || value.trim().length === 0) {
      return null;
    }

    switch (field) {
      case 'email':
        return normalizeEmail(value);
      case 'phone':
        return normalizePhone(value);
      default:
        return normalizeText(value);
    }
  }
}

export { normalizeText, normalizeHeader, normalizeEmail, normalizePhone, normalizeDate };
