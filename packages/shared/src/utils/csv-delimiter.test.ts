import { describe, expect, it } from 'vitest';

import { detectCsvDelimiter, delimiterLabel } from './csv-delimiter.js';

describe('detectCsvDelimiter', () => {
  it('detects comma-separated', () => {
    expect(detectCsvDelimiter('Name,Email,Phone\nJohn,j@test.com,555')).toBe(',');
  });

  it('detects semicolon-separated', () => {
    expect(detectCsvDelimiter('Name;Email;Phone\nJohn;j@test.com;555')).toBe(';');
  });

  it('detects tab-separated', () => {
    expect(detectCsvDelimiter('Name\tEmail\tPhone\nJohn\tj@test.com\t555')).toBe('\t');
  });

  it('labels delimiters', () => {
    expect(delimiterLabel(';')).toBe('Semicolon');
    expect(delimiterLabel('\t')).toBe('Tab');
  });
});
