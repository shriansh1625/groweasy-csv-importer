import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

import { ConfigurationError } from '@groweasy/shared';

loadDotenv();

const llmProviders = ['anthropic', 'openai', 'gemini', 'openrouter', 'mock'] as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_NAME: z.string().default('groweasy-csv-importer'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    LLM_PROVIDER: z.enum(llmProviders).default('openrouter'),

    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),

    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o'),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().default('qwen/qwen-2.5-7b-instruct'),
    OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),
    OPENROUTER_APP_NAME: z.string().default('Civic Seva'),
    OPENROUTER_SITE_URL: z.string().optional(),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

    MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(10),

    PROMPT_VERSION: z.enum(['v1', 'v2', 'experimental']).default('v2'),
    LLM_CONTEXT_WINDOW: z.coerce.number().int().positive().default(200_000),
    LLM_TARGET_CONTEXT_RATIO: z.coerce.number().min(0.1).max(0.95).default(0.7),
    LLM_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(1),
    LLM_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
    LLM_MAX_CONCURRENT_BATCHES: z.coerce.number().int().min(1).max(10).default(3),
    IMPORT_JOB_TTL_MS: z.coerce.number().int().positive().default(3_600_000),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'test') {
      return;
    }

    if (env.LLM_PROVIDER === 'mock') {
      return;
    }

    const missingKey =
      (env.LLM_PROVIDER === 'anthropic' && !env.ANTHROPIC_API_KEY && 'ANTHROPIC_API_KEY') ||
      (env.LLM_PROVIDER === 'openai' && !env.OPENAI_API_KEY && 'OPENAI_API_KEY') ||
      (env.LLM_PROVIDER === 'gemini' && !env.GEMINI_API_KEY && 'GEMINI_API_KEY') ||
      (env.LLM_PROVIDER === 'openrouter' && !env.OPENROUTER_API_KEY && 'OPENROUTER_API_KEY') ||
      false;

    if (missingKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${missingKey} is required when LLM_PROVIDER is "${env.LLM_PROVIDER}"`,
        path: [missingKey],
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | undefined;

export function loadConfig(options?: { force?: boolean }): EnvConfig {
  if (cachedConfig && !options?.force) {
    return cachedConfig;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten();
    throw new ConfigurationError('Invalid environment configuration', {
      fieldErrors: formatted.fieldErrors,
      formErrors: formatted.formErrors,
    });
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = undefined;
}

export const config = {
  get app() {
    return {
      name: getConfig().APP_NAME,
      env: getConfig().NODE_ENV,
      isProduction: getConfig().NODE_ENV === 'production',
      isDevelopment: getConfig().NODE_ENV === 'development',
      isTest: getConfig().NODE_ENV === 'test',
    };
  },
  get server() {
    const corsRaw = getConfig().CORS_ORIGIN;
    const corsOrigins = corsRaw
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    return {
      port: getConfig().PORT,
      host: getConfig().HOST,
      corsOrigin: corsRaw,
      corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
    };
  },
  get logging() {
    return {
      level: getConfig().LOG_LEVEL,
    };
  },
  get llm() {
    const cfg = getConfig();
    return {
      provider: cfg.LLM_PROVIDER,
      anthropic: {
        apiKey: cfg.ANTHROPIC_API_KEY,
        model: cfg.ANTHROPIC_MODEL,
      },
      openai: {
        apiKey: cfg.OPENAI_API_KEY,
        model: cfg.OPENAI_MODEL,
      },
      gemini: {
        apiKey: cfg.GEMINI_API_KEY,
        model: cfg.GEMINI_MODEL,
      },
      openrouter: {
        apiKey: cfg.OPENROUTER_API_KEY,
        model: cfg.OPENROUTER_MODEL,
        baseUrl: cfg.OPENROUTER_BASE_URL,
        appName: cfg.OPENROUTER_APP_NAME,
        siteUrl: cfg.OPENROUTER_SITE_URL,
      },
    };
  },
  get rateLimit() {
    return {
      windowMs: getConfig().RATE_LIMIT_WINDOW_MS,
      maxRequests: getConfig().RATE_LIMIT_MAX_REQUESTS,
    };
  },
  get upload() {
    return {
      maxSizeMb: getConfig().MAX_UPLOAD_SIZE_MB,
      maxSizeBytes: getConfig().MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    };
  },
  get extraction() {
    return {
      promptVersion: getConfig().PROMPT_VERSION,
      contextWindow: getConfig().LLM_CONTEXT_WINDOW,
      targetContextRatio: getConfig().LLM_TARGET_CONTEXT_RATIO,
      maxRetries: getConfig().LLM_MAX_RETRIES,
      requestTimeoutMs: getConfig().LLM_REQUEST_TIMEOUT_MS,
      maxConcurrentBatches: getConfig().LLM_MAX_CONCURRENT_BATCHES,
      jobTtlMs: getConfig().IMPORT_JOB_TTL_MS,
    };
  },
};
