import { describe, expect, it } from 'vitest';

import { createLLMProvider, ClaudeProvider, OpenAIProvider, GeminiProvider } from './factory.js';

describe('createLLMProvider', () => {
  it('creates ClaudeProvider for anthropic', () => {
    const provider = createLLMProvider();
    expect(provider).toBeInstanceOf(ClaudeProvider);
    expect(provider.name).toBe('anthropic');
  });

  it('exports all provider classes', () => {
    expect(OpenAIProvider).toBeDefined();
    expect(GeminiProvider).toBeDefined();
  });
});

describe('ClaudeProvider', () => {
  it('estimates cost', () => {
    const provider = new ClaudeProvider({ apiKey: 'test', model: 'claude-sonnet-4-20250514' });
    const cost = provider.estimateCost(1000, 500);
    expect(cost).toBeGreaterThan(0);
  });
});
