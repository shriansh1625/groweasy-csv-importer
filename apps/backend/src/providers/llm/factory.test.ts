import { describe, expect, it } from 'vitest';

import { loadConfig, resetConfig } from '@groweasy/config';

import { createLLMProvider, ClaudeProvider, DemoLLMProvider, OpenAIProvider, GeminiProvider } from './factory.js';

describe('createLLMProvider', () => {
  it('creates ClaudeProvider for anthropic', () => {
    const provider = createLLMProvider();
    expect(provider).toBeInstanceOf(ClaudeProvider);
    expect(provider.name).toBe('anthropic');
  });

  it('falls back to demo LLM when openrouter key is missing', () => {
    const previousProvider = process.env.LLM_PROVIDER;
    const previousKey = process.env.OPENROUTER_API_KEY;

    process.env.LLM_PROVIDER = 'openrouter';
    delete process.env.OPENROUTER_API_KEY;
    resetConfig();
    loadConfig({ force: true });

    const provider = createLLMProvider();
    expect(provider).toBeInstanceOf(DemoLLMProvider);

    process.env.LLM_PROVIDER = previousProvider;
    if (previousKey !== undefined) {
      process.env.OPENROUTER_API_KEY = previousKey;
    } else {
      delete process.env.OPENROUTER_API_KEY;
    }
    resetConfig();
    loadConfig({ force: true });
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
