import { UploadError } from '@groweasy/shared';
import { describe, expect, it } from 'vitest';

import { sanitizeCellValue, stripBom, validateCsvContent } from './sanitizer.js';

describe('sanitizer', () => {
  it('neutralizes formula injection', () => {
    expect(sanitizeCellValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCellValue('+1234')).toBe("'+1234");
    expect(sanitizeCellValue('-100')).toBe("'-100");
    expect(sanitizeCellValue('@evil')).toBe("'@evil");
  });

  it('strips UTF-8 BOM', () => {
    expect(stripBom('\uFEFFName,Email')).toBe('Name,Email');
  });

  it('rejects oversized content', () => {
    expect(() => validateCsvContent('a'.repeat(100), 50)).toThrow(UploadError);
  });

  it('rejects empty content', () => {
    expect(() => validateCsvContent('', 1000)).toThrow(UploadError);
  });
});
