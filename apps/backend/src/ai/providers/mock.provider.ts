import type { LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';

import type { LLMProvider } from '../../providers/llm/types.js';

export class MockLLMProvider implements LLMProvider {
  readonly name = 'anthropic';
  readonly model: string;
  private readonly responses: Map<string, string>;
  private callCount = 0;

  constructor(options?: { model?: string; responses?: Record<string, string> }) {
    this.model = options?.model ?? 'mock-model';
    this.responses = new Map(Object.entries(options?.responses ?? {}));
  }

  setResponse(key: string, response: string): void {
    this.responses.set(key, response);
  }

  getCallCount(): number {
    return this.callCount;
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    this.callCount += 1;

    const defaultResponse =
      this.responses.get('default') ??
      JSON.stringify({
        rows: [],
      });

    const content = this.responses.get(request.prompt.slice(0, 50)) ?? defaultResponse;

    return {
      content,
      model: this.model,
      inputTokens: Math.ceil(request.prompt.length / 4),
      outputTokens: Math.ceil(content.length / 4),
      finishReason: 'stop',
    };
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens + outputTokens) * 0.000001;
  }
}
