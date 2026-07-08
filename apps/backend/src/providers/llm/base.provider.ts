import { AIProviderError } from '@groweasy/shared';
import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import type { LLMProvider, LLMProviderOptions } from './types.js';

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 529]);

export interface BaseProviderConfig extends LLMProviderOptions {
  timeoutMs?: number;
  baseUrl?: string;
}

export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  readonly model: string;

  protected readonly apiKey: string;
  protected readonly maxRetries: number;
  protected readonly timeoutMs: number;

  constructor(options: BaseProviderConfig) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.maxRetries = options.maxRetries ?? 3;
    this.timeoutMs = options.timeoutMs ?? 120_000;
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.executeRequest(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt >= this.maxRetries || !this.isRetryable(error)) {
          throw error;
        }

        const delayMs = Math.min(1000 * 2 ** attempt + Math.random() * 500, 30_000);
        await sleep(delayMs);
      }
    }

    throw lastError ?? new AIProviderError('LLM request failed after retries', { provider: this.name });
  }

  abstract estimateCost(inputTokens: number, outputTokens: number): number;

  protected abstract executeRequest(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;

  protected async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError(`Request timed out after ${String(this.timeoutMs)}ms`, {
          provider: this.name,
          model: this.model,
        });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  protected async parseErrorResponse(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: { message?: string }; message?: string };
      return body.error?.message ?? body.message ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  protected isRetryable(error: unknown): boolean {
    if (error instanceof AIProviderError) {
      const status = error.details?.['httpStatus'];
      if (typeof status === 'number') return RETRYABLE_STATUS.has(status);
    }
    if (error instanceof Error && error.name === 'AbortError') return true;
    return false;
  }

  protected throwProviderError(message: string, httpStatus: number, details?: Record<string, unknown>): never {
    throw new AIProviderError(message, {
      provider: this.name,
      model: this.model,
      httpStatus,
      ...details,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
