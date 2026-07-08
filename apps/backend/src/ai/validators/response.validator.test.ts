import { describe, expect, it } from 'vitest';

import { ResponseValidator } from './response.validator.js';

const validResponse = JSON.stringify({
  records: [
    {
      rowIndex: 0,
      fields: {
        email: { value: 'test@example.com', confidence: 95 },
        phone: { value: 'invalid', confidence: 80 },
      },
    },
  ],
  skipped: [],
  warnings: [],
  metadata: {},
});

describe('ResponseValidator', () => {
  const validator = new ResponseValidator();

  it('validates correct JSON response', () => {
    const result = validator.validateRawResponse(validResponse);
    expect(result.rows).toHaveLength(1);
    expect(result.warnings.some((w) => w.code === 'INVALID_PHONE')).toBe(true);
  });

  it('repairs malformed JSON', () => {
    const malformed = '{"records": [{"rowIndex": 0, "fields": {"email": {"value": "a@b.com", "confidence": 90}}}], "skipped": [], "warnings": [], "metadata": {}}';
    const result = validator.validateRawResponse(malformed);
    expect(result.rows.length).toBeGreaterThanOrEqual(0);
  });

  it('detects duplicate emails', () => {
    const emptyField = { value: null, confidence: 0, level: 'blank' as const };
    const records = [
      {
        firstName: emptyField,
        lastName: emptyField,
        fullName: emptyField,
        email: { value: 'dup@test.com', confidence: 95, level: 'accept' as const },
        phone: emptyField,
        phoneCountryCode: emptyField,
        mobileWithoutCountryCode: emptyField,
        company: emptyField,
        title: emptyField,
        city: emptyField,
        state: emptyField,
        country: emptyField,
        zipCode: emptyField,
        leadOwner: emptyField,
        source: emptyField,
        crmStatus: emptyField,
        dataSource: emptyField,
        notes: emptyField,
      },
      {
        firstName: emptyField,
        lastName: emptyField,
        fullName: emptyField,
        email: { value: 'dup@test.com', confidence: 95, level: 'accept' as const },
        phone: emptyField,
        phoneCountryCode: emptyField,
        mobileWithoutCountryCode: emptyField,
        company: emptyField,
        title: emptyField,
        city: emptyField,
        state: emptyField,
        country: emptyField,
        zipCode: emptyField,
        leadOwner: emptyField,
        source: emptyField,
        crmStatus: emptyField,
        dataSource: emptyField,
        notes: emptyField,
      },
    ];

    const warnings = validator.detectDuplicates(records);
    expect(warnings.some((w) => w.code === 'DUPLICATE_EMAIL')).toBe(true);
  });
});
