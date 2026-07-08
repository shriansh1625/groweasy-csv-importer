import { describe, expect, it } from 'vitest';

import { NormalizationEngine } from './preprocessing.engine.js';

describe('NormalizationEngine', () => {
  const engine = new NormalizationEngine();

  it('removes empty columns', () => {
    const result = engine.normalizeParsedData({
      headers: ['Name', 'Empty'],
      rows: [{ Name: 'John', Empty: '' }, { Name: 'Jane', Empty: '  ' }],
      totalRows: 2,
      duplicateRowIndices: [],
    });

    expect(result.headers).toEqual(['Name']);
  });

  it('deduplicates identical rows', () => {
    const result = engine.normalizeParsedData({
      headers: ['Email'],
      rows: [{ Email: 'a@test.com' }, { Email: 'a@test.com' }, { Email: 'b@test.com' }],
      totalRows: 3,
      duplicateRowIndices: [],
    });

    expect(result.rows).toHaveLength(2);
  });

  it('normalizes email fields', () => {
    const value = engine.normalizeCrmFieldValue('email', '  Test@Example.COM  ');
    expect(value).toBe('test@example.com');
  });
});
