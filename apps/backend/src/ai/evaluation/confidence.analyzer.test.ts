import { describe, expect, it } from 'vitest';

import { ConfidenceAnalyzer } from './confidence.analyzer.js';

describe('ConfidenceAnalyzer', () => {
  const analyzer = new ConfidenceAnalyzer();

  it('accepts high confidence valid email', () => {
    const record = analyzer.analyzeRow(
      {
        rowIndex: 0,
        fields: { email: { value: 'test@example.com', confidence: 98 } },
      },
      [
        {
          originalHeader: 'Email',
          normalizedHeader: 'email',
          semanticType: 'email',
          confidence: 95,
          matchReason: 'test',
        },
      ],
    );

    expect(record.email.level).toBe('accept');
    expect(record.email.value).toBe('test@example.com');
    expect(record.email.confidence).toBeGreaterThan(90);
  });

  it('blanks fields below 40 confidence', () => {
    const record = analyzer.analyzeRow(
      {
        rowIndex: 0,
        fields: { company: { value: 'Maybe Corp', confidence: 30 } },
      },
      [],
    );

    expect(record.company.level).toBe('blank');
    expect(record.company.value).toBeNull();
  });

  it('blanks invalid email with low confidence', () => {
    const record = analyzer.analyzeRow(
      {
        rowIndex: 0,
        fields: { email: { value: 'not-an-email', confidence: 80 } },
      },
      [],
    );

    expect(record.email.confidence).toBeLessThanOrEqual(35);
    expect(record.email.level).toBe('blank');
  });
});
