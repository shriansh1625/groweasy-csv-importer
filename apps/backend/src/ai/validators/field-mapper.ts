import type { CrmFieldName } from '@groweasy/shared';
import { CRM_FIELD_NAMES, LLM_FIELD_ALIASES } from '@groweasy/shared';

export function normalizeLlmFieldName(rawField: string): CrmFieldName | null {
  const normalized = rawField.trim();

  if ((CRM_FIELD_NAMES as readonly string[]).includes(normalized)) {
    return normalized as CrmFieldName;
  }

  const alias = LLM_FIELD_ALIASES[normalized.toLowerCase()];
  if (alias) {
    return alias;
  }

  const camelCase = normalized.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  if ((CRM_FIELD_NAMES as readonly string[]).includes(camelCase)) {
    return camelCase as CrmFieldName;
  }

  return null;
}

export function normalizeLlmFields(
  fields: Record<string, { value: string | null; confidence?: number | undefined }>,
): Partial<Record<CrmFieldName, { value: string | null; confidence?: number | undefined }>> {
  const normalized: Partial<
    Record<CrmFieldName, { value: string | null; confidence?: number | undefined }>
  > = {};

  for (const [rawKey, data] of Object.entries(fields)) {
    const fieldName = normalizeLlmFieldName(rawKey);
    if (fieldName) {
      normalized[fieldName] = data;
    }
  }

  return normalized;
}
