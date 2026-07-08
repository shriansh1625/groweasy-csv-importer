import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import { BaseLLMProvider, type BaseProviderConfig } from './base.provider.js';

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';

  constructor(options: BaseProviderConfig) {
    super(options);
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputRate = 2.5 / 1_000_000;
    const outputRate = 10.0 / 1_000_000;
    return inputTokens * inputRate + outputTokens * outputRate;
  }

  protected async executeRequest(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const messages: Array<{ role: string; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 8192,
        temperature: request.temperature ?? 0,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const message = await this.parseErrorResponse(response);
      this.throwProviderError(message, response.status);
    }

    const body = (await response.json()) as OpenAIChatResponse;
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
