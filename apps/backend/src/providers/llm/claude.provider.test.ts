import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { ClaudeProvider } from './claude.provider.js';

describe('ClaudeProvider', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parses successful API response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: '{"records":[]}' }],
        model: 'claude-sonnet-4-20250514',
        usage: { input_tokens: 100, output_tokens: 50 },
        stop_reason: 'end_turn',
      }),
    });

    const provider = new ClaudeProvider({ apiKey: 'test-key', model: 'claude-sonnet-4-20250514', maxRetries: 0 });
    const result = await provider.complete({ prompt: 'test', systemPrompt: 'system' });

    expect(result.content).toBe('{"records":[]}');
    expect(result.inputTokens).toBe(100);
    expect(result.outputTokens).toBe(50);
  });

  it('retries on rate limit', async () => {
    let calls = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      calls += 1;
      if (calls === 1) {
        return { ok: false, status: 429, statusText: 'Too Many Requests', json: async () => ({ error: { message: 'Rate limited' } }) };
      }
      return {
        ok: true,
        json: async () => ({
          content: [{ type: 'text', text: '{}' }],
          usage: { input_tokens: 10, output_tokens: 5 },
        }),
      };
    });

    const provider = new ClaudeProvider({ apiKey: 'test-key', model: 'claude-sonnet-4-20250514', maxRetries: 2, timeoutMs: 5000 });
    const result = await provider.complete({ prompt: 'test' });

    expect(calls).toBe(2);
    expect(result.content).toBe('{}');
  });
});
