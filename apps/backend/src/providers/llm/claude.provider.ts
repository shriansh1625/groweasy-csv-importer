import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import { BaseLLMProvider, type BaseProviderConfig } from './base.provider.js';

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
  model?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  stop_reason?: string;
}

export class ClaudeProvider extends BaseLLMProvider {
  readonly name = 'anthropic';

  constructor(options: BaseProviderConfig) {
    super(options);
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputRate = 3.0 / 1_000_000;
    const outputRate = 15.0 / 1_000_000;
    return inputTokens * inputRate + outputTokens * outputRate;
  }

  protected async executeRequest(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const response = await this.fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 8192,
        temperature: request.temperature ?? 0,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    });

    if (!response.ok) {
      const message = await this.parseErrorResponse(response);
      this.throwProviderError(message, response.status);
    }

    const body = (await response.json()) as AnthropicMessageResponse;
    const textBlock = body.content?.find((b) => b.type === 'text');
    const content = textBlock?.text ?? '';

    return {
      content,
      model: body.model ?? this.model,
      inputTokens: body.usage?.input_tokens ?? 0,
      outputTokens: body.usage?.output_tokens ?? 0,
      finishReason: body.stop_reason ?? 'stop',
    };
  }
}
