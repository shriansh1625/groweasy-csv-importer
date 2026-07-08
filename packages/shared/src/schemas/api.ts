import { z } from 'zod';

export const extractCsvRequestSchema = z.object({
  csv: z.string().min(1, 'CSV content is required').max(12_000_000),
});

export const extractRetryRequestSchema = z.object({
  rowIndices: z.array(z.number().int().min(0)).optional(),
});

export type ExtractCsvRequest = z.infer<typeof extractCsvRequestSchema>;
export type ExtractRetryRequest = z.infer<typeof extractRetryRequestSchema>;
