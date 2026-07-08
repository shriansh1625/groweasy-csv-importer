import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import { BaseLLMProvider, type BaseProviderConfig } from './base.provider.js';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

export class GeminiProvider extends BaseLLMProvider {
  readonly name = 'gemini';

  constructor(options: BaseProviderConfig) {
    super(options);
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputRate = 0.1 / 1_000_000;
    const outputRate = 0.4 / 1_000_000;
    return inputTokens * inputRate + outputTokens * outputRate;
  }

  protected async executeRequest(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;

    const parts: Array<{ text: string }> = [];
    if (request.systemPrompt) {
      parts.push({ text: request.systemPrompt });
    }
    parts.push({ text: request.prompt });

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: request.temperature ?? 0,
          maxOutputTokens: request.maxTokens ?? 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const message = await this.parseErrorResponse(response);
      this.throwProviderError(message, response.status);
    }

    const body = (await response.json()) as GeminiResponse;
    const content = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';

    return {
      content,
      model: this.model,
      inputTokens: body.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: body.usageMetadata?.candidatesTokenCount ?? 0,
      finishReason: body.candidates?.[0]?.finishReason ?? 'stop',
    };
  }
}
