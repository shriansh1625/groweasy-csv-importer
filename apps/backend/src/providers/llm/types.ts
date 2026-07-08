import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

export interface LLMProviderOptions {
  apiKey: string;
  model: string;
  maxRetries?: number;
}

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  estimateCost(inputTokens: number, outputTokens: number): number;
}

export interface LLMProviderFactoryOptions {
  provider: string;
}
