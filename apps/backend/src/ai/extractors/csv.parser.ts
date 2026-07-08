import Papa from 'papaparse';

import type { ParsedCsvData } from '@groweasy/shared';
import { CsvParseError, detectCsvDelimiter } from '@groweasy/shared';

import { stripBom } from '../../security/sanitizer.js';
import { normalizeText } from '../normalizers/text.normalizer.js';

export class CsvParser {
  parse(content: string): ParsedCsvData {
    const withoutBom = stripBom(content.trim());
    if (withoutBom.length === 0) {
      throw new CsvParseError('CSV content is empty');
    }

    const headerCounts = new Map<string, number>();
    const duplicateHeaders: string[] = [];
    const headerByIndex = new Map<number, string>();

    const delimiter = detectCsvDelimiter(withoutBom);

    const result = Papa.parse<Record<string, string>>(withoutBom, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      transformHeader: (header, index) => {
        const cached = headerByIndex.get(index);
        if (cached !== undefined) return cached;

        const base = this.normalizeHeader(header, index);
        const key = base.toLowerCase();
        const count = headerCounts.get(key) ?? 0;
        if (count > 0) duplicateHeaders.push(base);
        headerCounts.set(key, count + 1);
        const finalName = count > 0 ? `${base}_${String(count + 1)}` : base;
        headerByIndex.set(index, finalName);
        return finalName;
      },
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      throw new CsvParseError(result.errors[0]?.message ?? 'CSV parse failed');
    }

    const headers = result.meta.fields ?? [];
    if (headers.length === 0) {
      throw new CsvParseError('CSV header row is empty');
    }

    const rows: Record<string, string>[] = [];
    const duplicateRowIndices: number[] = [];
    const seenFingerprints = new Map<string, number>();

    for (let i = 0; i < result.data.length; i++) {
      const rawRow = result.data[i];
      if (!rawRow) continue;

      const row: Record<string, string> = {};
      for (const header of headers) {
        row[header] = normalizeText(rawRow[header] ?? '');
      }

      const fingerprint = headers.map((h) => row[h] ?? '').join('|');
      const existingIndex = seenFingerprints.get(fingerprint);
      if (existingIndex !== undefined) {
        duplicateRowIndices.push(i);
      } else {
        seenFingerprints.set(fingerprint, i);
        rows.push(row);
      }
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
      duplicateRowIndices,
      duplicateHeaders,
    };
  }

  private normalizeHeader(header: string, index: number): string {
    const trimmed = normalizeText(stripBom(header));
    return trimmed.length > 0 ? trimmed : `Column_${String(index + 1)}`;
  }
}
