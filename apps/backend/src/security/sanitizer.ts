import { UploadError } from '@groweasy/shared';

const FORMULA_PREFIX = /^[\s]*[=+\-@]/;
const MAX_CELL_LENGTH = 10_000;

/** Neutralize CSV/formula injection in cell values. */
export function sanitizeCellValue(value: string): string {
  let sanitized = value.trim();

  if (sanitized.length > MAX_CELL_LENGTH) {
    sanitized = sanitized.slice(0, MAX_CELL_LENGTH);
  }

  if (FORMULA_PREFIX.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }

  return sanitized;
}

/** Sanitize all values in parsed CSV rows. */
export function sanitizeCsvRows(rows: Record<string, string>[]): Record<string, string>[] {
  return rows.map((row) => {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      sanitized[key] = sanitizeCellValue(value);
    }
    return sanitized;
  });
}

/** Strip control characters that could affect prompt parsing. */
export function stripControlCharacters(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/** Wrap user CSV content in delimiters to reduce prompt injection risk. */
export function wrapCsvForPrompt(csvContent: string): string {
  const cleaned = stripControlCharacters(csvContent);
  return `<user_csv_data>\n${cleaned}\n</user_csv_data>`;
}

/** Validate upload content is plausible CSV text. */
export function validateCsvContent(content: string, maxBytes: number): void {
  if (content.length === 0) {
    throw new UploadError('CSV content is empty');
  }

  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > maxBytes) {
    throw new UploadError(`CSV exceeds maximum size of ${String(maxBytes)} bytes`);
  }

  if (!content.includes(',') && !content.includes('\t') && content.split('\n').length < 2) {
    throw new UploadError('Content does not appear to be valid CSV');
  }
}

/** Remove UTF-8 BOM if present. */
export function stripBom(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }
  if (content.startsWith('\uFEFF')) {
    return content.slice(1);
  }
  return content;
}
