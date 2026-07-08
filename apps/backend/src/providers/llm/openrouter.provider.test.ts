import { describe, expect, it } from 'vitest';

import { OpenRouterProvider } from './openrouter.provider.js';

describe('OpenRouterProvider', () => {
  it('estimates nominal cost', () => {
    const provider = new OpenRouterProvider({
      apiKey: 'test',
      model: 'qwen/qwen-2.5-7b-instruct',
    });
    const cost = provider.estimateCost(1000, 500);
    expect(cost).toBeGreaterThan(0);
    expect(provider.name).toBe('openrouter');
  });
});
