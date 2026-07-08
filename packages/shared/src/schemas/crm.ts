import { z } from 'zod';

export const CRM_FIELD_NAMES = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'phoneCountryCode',
  'mobileWithoutCountryCode',
  'company',
  'title',
  'city',
  'state',
  'country',
  'zipCode',
  'leadOwner',
  'source',
  'crmStatus',
  'dataSource',
  'notes',
] as const;

export const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

export const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

/** Maps LLM output field names (snake_case) to internal CRM field names */
export const LLM_FIELD_ALIASES: Record<string, (typeof CRM_FIELD_NAMES)[number]> = {
  name: 'fullName',
  full_name: 'fullName',
  first_name: 'firstName',
  last_name: 'lastName',
  lead_owner: 'leadOwner',
  crm_status: 'crmStatus',
  data_source: 'dataSource',
  crm_note: 'notes',
  country_code: 'phoneCountryCode',
  mobile_without_country_code: 'mobileWithoutCountryCode',
  zip: 'zipCode',
  zip_code: 'zipCode',
};

export const crmFieldNameSchema = z.enum(CRM_FIELD_NAMES);
export const crmStatusSchema = z.enum(CRM_STATUS_VALUES);
export const dataSourceSchema = z.enum(DATA_SOURCE_VALUES);

export const rawExtractedFieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(100).optional(),
});

export const rawExtractionRowSchema = z.object({
  rowIndex: z.number().int().min(0),
  fields: z.record(z.string(), rawExtractedFieldSchema),
});

export const extractionWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  rowIndex: z.number().int().optional(),
  field: z.string().optional(),
});

export const extractionSkippedSchema = z.object({
  rowIndex: z.number().int().min(0),
  reason: z.string(),
});

export const extractionOutputSchema = z.object({
  records: z.array(rawExtractionRowSchema),
  skipped: z.array(extractionSkippedSchema).default([]),
  warnings: z.array(extractionWarningSchema).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const legacyExtractionResponseSchema = z.object({
  rows: z.array(rawExtractionRowSchema),
});

export const rawExtractionResponseSchema = z.union([
  extractionOutputSchema,
  legacyExtractionResponseSchema,
]);

export const fieldConfidenceSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(100),
  level: z.enum(['accept', 'accept_with_warning', 'flag', 'blank']),
  sourceColumn: z.string().optional(),
  warnings: z.array(z.string()).optional(),
});

export const crmRecordSchema = z.record(crmFieldNameSchema, fieldConfidenceSchema);
