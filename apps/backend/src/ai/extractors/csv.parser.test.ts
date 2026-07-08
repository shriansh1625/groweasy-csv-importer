import { describe, expect, it } from 'vitest';

import { CsvParser } from './csv.parser.js';

describe('CsvParser edge cases', () => {
  const parser = new CsvParser();

  it('handles UTF-8 BOM', () => {
    const result = parser.parse('\uFEFFName,Email\nJohn,john@test.com');
    expect(result.headers.length).toBe(2);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.[result.headers[0] ?? '']).toBe('John');
  });

  it('handles quoted commas', () => {
    const result = parser.parse('Name,Notes\nJohn,"Line1,Line2"');
    const notesKey = result.headers.find((h) => h.toLowerCase().startsWith('notes')) ?? 'Notes';
    expect(result.rows[0]?.[notesKey]).toBe('Line1,Line2');
  });

  it('handles quoted newlines', () => {
    const result = parser.parse('Name,Notes\nJane,"Multi\nLine"');
    const notesKey = result.headers.find((h) => h.toLowerCase().startsWith('notes')) ?? 'Notes';
    expect(result.rows[0]?.[notesKey]).toContain('Multi');
  });

  it('deduplicates blank headers', () => {
    const result = parser.parse('Name,,Email\nJohn,x,john@test.com');
    expect(result.headers.filter((h) => h.startsWith('Column_')).length).toBeGreaterThan(0);
  });

  it('detects duplicate rows', () => {
    const result = parser.parse('Name,Email\nJohn,j@test.com\nJohn,j@test.com');
    expect(result.rows).toHaveLength(1);
    expect(result.duplicateRowIndices).toHaveLength(1);
  });

  it('handles duplicate header names', () => {
    const result = parser.parse('Name,Name,Email\nJohn,Doe,j@test.com');
    expect(result.duplicateHeaders.length).toBeGreaterThan(0);
    expect(result.headers).toHaveLength(3);
    expect(result.headers.some((h) => h.startsWith('Name_'))).toBe(true);
  });

  it('handles semicolon-separated European CSV', () => {
    const result = parser.parse('Name;Email;Phone\nJohn;j@test.com;555');
    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.rows[0]?.[result.headers[1] ?? 'Email']).toBe('j@test.com');
  });

  it('handles tab-separated CSV', () => {
    const result = parser.parse('Name\tEmail\nJane\tjane@test.com');
    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.rows[0]?.[result.headers[0] ?? 'Name']).toBe('Jane');
  });
});
