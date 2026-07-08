import { describe, expect, it } from 'vitest';

import { detectCsvDelimiter } from '@groweasy/shared';

import { countCsvRows, parseCsvPreview } from './csv-parser.service';

describe('parseCsvPreview', () => {
  it('parses comma-separated CSV', () => {
    const result = parseCsvPreview('Name,Email\nJohn,j@test.com\nJane,jane@test.com');
    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.rows).toHaveLength(2);
    expect(result.totalRows).toBe(2);
  });

  it('detects semicolon delimiter', () => {
    const content = 'Name;Email\nJohn;j@test.com';
    expect(detectCsvDelimiter(content)).toBe(';');
    const result = parseCsvPreview(content);
    expect(result.headers).toEqual(['Name', 'Email']);
  });
});

describe('countCsvRows', () => {
  it('counts rows excluding header', () => {
    expect(countCsvRows('A,B\n1,2\n3,4')).toBe(2);
  });
});
