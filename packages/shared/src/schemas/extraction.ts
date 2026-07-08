import { z } from 'zod';

import { rawExtractionResponseSchema } from './crm.js';

export const columnSemanticMetadataSchema = z.object({
  originalHeader: z.string(),
  normalizedHeader: z.string(),
  semanticType: z.string(),
  confidence: z.number().min(0).max(100),
  matchReason: z.string(),
});

export const headerAnalysisResultSchema = z.object({
  columns: z.array(columnSemanticMetadataSchema),
  duplicateHeaders: z.array(z.string()),
  emptyColumns: z.array(z.string()),
  unusedColumns: z.array(z.string()),
});

export const validationWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  rowIndex: z.number().int().optional(),
  severity: z.enum(['info', 'warning', 'error']),
});

export const importMetricsSchema = z.object({
  importId: z.string(),
  promptVersion: z.string(),
  model: z.string(),
  provider: z.enum(['anthropic', 'openai', 'gemini', 'openrouter', 'mock']),
  startTime: z.string(),
  endTime: z.string(),
  processingDurationMs: z.number(),
  totalRows: z.number().int(),
  successfulRows: z.number().int(),
  skippedRows: z.number().int(),
  retries: z.number().int(),
  estimatedInputTokens: z.number().int(),
  estimatedOutputTokens: z.number().int(),
  estimatedCostUsd: z.number(),
  warnings: z.array(validationWarningSchema),
  errors: z.array(validationWarningSchema),
});

export { rawExtractionResponseSchema };
