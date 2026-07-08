import { describe, expect, it } from 'vitest';

import { normalizeLlmFieldName, normalizeLlmFields } from './field-mapper.js';

describe('field-mapper', () => {
  it('maps snake_case aliases to camelCase CRM fields', () => {
    expect(normalizeLlmFieldName('lead_owner')).toBe('leadOwner');
    expect(normalizeLlmFieldName('crm_status')).toBe('crmStatus');
    expect(normalizeLlmFieldName('name')).toBe('fullName');
  });

  it('normalizes a full fields object', () => {
    const result = normalizeLlmFields({
      name: { value: 'Test', confidence: 90 },
      crm_note: { value: 'note', confidence: 70 },
    });
    expect(result.fullName?.value).toBe('Test');
    expect(result.notes?.value).toBe('note');
  });
});
