import { describe, expect, it } from 'vitest';

import { ResponseValidator } from '../validators/response.validator.js';

describe('Enterprise output contract', () => {
  const validator = new ResponseValidator();

  it('parses new records/skipped/warnings/metadata format', () => {
    const response = JSON.stringify({
      records: [
        {
          rowIndex: 0,
          fields: {
            fullName: { value: 'John Doe', confidence: 95 },
            email: { value: 'john@example.com', confidence: 100 },
            crmStatus: { value: 'GOOD_LEAD_FOLLOW_UP', confidence: 90 },
            dataSource: { value: 'meridian_tower', confidence: 88 },
          },
        },
      ],
      skipped: [{ rowIndex: 1, reason: 'Empty row' }],
      warnings: [{ code: 'AMBIGUOUS_COLUMN', message: 'Two email columns', field: 'email' }],
      metadata: { promptVersion: 'v2', processedRows: 1 },
    });

    const result = validator.validateRawResponse(response);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.fields.fullName?.value).toBe('John Doe');
    expect(result.skippedCount).toBe(1);
    expect(result.warnings.some((w) => w.code === 'ROW_SKIPPED')).toBe(true);
  });

  it('maps snake_case LLM fields to camelCase', () => {
    const response = JSON.stringify({
      records: [
        {
          rowIndex: 0,
          fields: {
            name: { value: 'Jane Smith', confidence: 92 },
            lead_owner: { value: 'Alice', confidence: 85 },
            crm_status: { value: 'SALE_DONE', confidence: 90 },
            data_source: { value: 'eden_park', confidence: 88 },
          },
        },
      ],
      skipped: [],
      warnings: [],
      metadata: {},
    });

    const result = validator.validateRawResponse(response);
    expect(result.rows[0]?.fields.fullName?.value).toBe('Jane Smith');
    expect(result.rows[0]?.fields.leadOwner?.value).toBe('Alice');
    expect(result.rows[0]?.fields.crmStatus?.value).toBe('SALE_DONE');
    expect(result.rows[0]?.fields.dataSource?.value).toBe('eden_park');
  });

  it('rejects invalid crmStatus with warning', () => {
    const response = JSON.stringify({
      records: [
        {
          rowIndex: 0,
          fields: {
            crmStatus: { value: 'INVENTED_STATUS', confidence: 80 },
          },
        },
      ],
      skipped: [],
      warnings: [],
      metadata: {},
    });

    const result = validator.validateRawResponse(response);
    expect(result.warnings.some((w) => w.code === 'INVALID_CRM_STATUS')).toBe(true);
  });

  it('still supports legacy rows format', () => {
    const response = JSON.stringify({
      rows: [{ rowIndex: 0, fields: { email: { value: 'legacy@test.com', confidence: 95 } } }],
    });

    const result = validator.validateRawResponse(response);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.fields.email?.value).toBe('legacy@test.com');
  });
});

describe('Prompt regression — messy datasets', () => {
  const validator = new ResponseValidator();

  const messyResponses = [
    {
      label: 'placeholder rejection',
      content: JSON.stringify({
        records: [{ rowIndex: 0, fields: { email: { value: null, confidence: 0 }, phone: { value: null, confidence: 0 } } }],
        skipped: [],
        warnings: [{ code: 'PLACEHOLDER_REJECTED', message: 'Rejected placeholders' }],
        metadata: {},
      }),
      expectBlankEmail: true,
    },
    {
      label: 'json with markdown fences stripped',
      content: '```json\n' + JSON.stringify({
        records: [{ rowIndex: 0, fields: { fullName: { value: 'Test', confidence: 90 } } }],
        skipped: [],
        warnings: [],
        metadata: {},
      }) + '\n```',
      expectName: 'Test',
    },
  ];

  for (const sample of messyResponses) {
    it(`handles ${sample.label}`, () => {
      const result = validator.validateRawResponse(sample.content);
      if (sample.expectBlankEmail) {
        expect(result.rows[0]?.fields.email?.value).toBeNull();
      }
      if (sample.expectName) {
        expect(result.rows[0]?.fields.fullName?.value).toBe(sample.expectName);
      }
    });
  }
});
