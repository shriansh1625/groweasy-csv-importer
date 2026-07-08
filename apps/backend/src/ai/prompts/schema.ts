export const OUTPUT_CONTRACT = {
  records: 'Array of extracted CRM records with rowIndex and fields',
  skipped: 'Array of { rowIndex, reason } for rows that cannot be processed',
  warnings: 'Array of { code, message, rowIndex?, field? } for ambiguous or partial extractions',
  metadata: 'Object with promptVersion, processedRows count',
} as const;

export const RECORD_FIELD_SHAPE = {
  value: 'string | null',
  confidence: 'integer 0-100',
} as const;

export const OUTPUT_EXAMPLE = JSON.stringify(
  {
    records: [
      {
        rowIndex: 0,
        fields: {
          fullName: { value: 'Jane Doe', confidence: 95 },
          email: { value: 'jane@example.com', confidence: 98 },
          phone: { value: '+919876543210', confidence: 90 },
          crmStatus: { value: 'GOOD_LEAD_FOLLOW_UP', confidence: 85 },
          dataSource: { value: null, confidence: 0 },
          notes: { value: null, confidence: 0 },
        },
      },
    ],
    skipped: [],
    warnings: [{ code: 'AMBIGUOUS_COLUMN', message: 'Two columns match email equally', rowIndex: 0, field: 'email' }],
    metadata: { promptVersion: 'v2', processedRows: 1 },
  },
  null,
  0,
);

export function buildSchemaPrompt(): string {
  return `OUTPUT CONTRACT — emit exactly this top-level shape, no additional keys:
${JSON.stringify(OUTPUT_CONTRACT)}

Each field in records[].fields uses: ${JSON.stringify(RECORD_FIELD_SHAPE)}

Example (structure only):
${OUTPUT_EXAMPLE}

Allowed crmStatus: GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE
Allowed dataSource: leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots
Use null + confidence 0 for any value not in allowed enums or not present in source.`;
}

export const SELF_VALIDATION_CHECKLIST = [
  'JSON is valid and parseable',
  'Top-level keys are exactly: records, skipped, warnings, metadata',
  'Every record has rowIndex and fields object',
  'crmStatus and dataSource match allowed enums or are null',
  'No duplicate primary email/phone within same record unless appended to notes',
  'Email syntax valid or null',
  'Phone normalized or null',
  'No markdown, prose, or code fences',
  'No fabricated values',
];

export function buildSelfValidationPrompt(): string {
  return `Before emitting final output, internally verify:\n${SELF_VALIDATION_CHECKLIST.map((c, i) => `${String(i + 1)}. ${c}`).join('\n')}`;
}
