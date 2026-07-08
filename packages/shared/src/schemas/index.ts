import { z } from 'zod';

import { LLM_PROVIDERS } from '../constants/index.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const llmProviderSchema = z.enum(LLM_PROVIDERS);

export const llmCompletionRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  uptime: z.number(),
  checks: z.record(
    z.object({
      status: z.enum(['pass', 'fail']),
      message: z.string().optional(),
    }),
  ),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type LLMCompletionRequestInput = z.infer<typeof llmCompletionRequestSchema>;

export * from './crm.js';
export * from './extraction.js';
