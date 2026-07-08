import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import { BaseLLMProvider, type BaseProviderConfig } from './base.provider.js';

interface OpenRouterChatResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export interface OpenRouterProviderConfig extends BaseProviderConfig {
  baseUrl?: string;
  appName?: string;
  siteUrl?: string;
}

export class OpenRouterProvider extends BaseLLMProvider {
  readonly name = 'openrouter';
  private readonly baseUrl: string;
  private readonly appName: string;
  private readonly siteUrl?: string;

  constructor(options: OpenRouterProviderConfig) {
    super(options);
    this.baseUrl = (options.baseUrl ?? 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    this.appName = options.appName ?? 'Civic Seva';
    if (options.siteUrl !== undefined) {
      this.siteUrl = options.siteUrl;
    }
  }

  /** Qwen free tier — nominal cost for metrics only */
  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens + outputTokens) * 0.0000001;
  }

  protected async executeRequest(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const messages: Array<{ role: string; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'X-Title': this.appName,
    };

    if (this.siteUrl) {
      headers['HTTP-Referer'] = this.siteUrl;
    }

    const response = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 8192,
        temperature: request.temperature ?? 0,
        messages,
      }),
    });

    if (!response.ok) {
      const message = await this.parseErrorResponse(response);
      this.throwProviderError(message, response.status);
    }

    const body = (await response.json()) as OpenRouterChatResponse;
    const content = body.choices?.[0]?.message?.content ?? '';

    return {
      content,
      model: body.model ?? this.model,
      inputTokens: body.usage?.prompt_tokens ?? 0,
      outputTokens: body.usage?.completion_tokens ?? 0,
      finishReason: body.choices?.[0]?.finish_reason ?? 'stop',
    };
  }
}
