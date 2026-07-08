import { describe, expect, it } from 'vitest';

import { MockLLMProvider } from '../providers/mock.provider.js';

import { RecoveryEngine } from './recovery.engine.js';

describe('RecoveryEngine', () => {
  it('retries on invalid JSON and succeeds on second attempt', async () => {
    const provider = new MockLLMProvider();
    let callCount = 0;

    const originalComplete = provider.complete.bind(provider);
    provider.complete = async (request) => {
      callCount += 1;
      if (callCount === 1) {
        return {
          content: 'not valid json',
          model: 'test',
          inputTokens: 100,
          outputTokens: 50,
          finishReason: 'stop',
        };
      }
      return originalComplete(request);
    };

    provider.setResponse(
      'default',
      JSON.stringify({
        records: [{ rowIndex: 0, fields: { email: { value: 'a@b.com', confidence: 95 } } }],
        skipped: [],
        warnings: [],
        metadata: {},
      }),
    );

    const engine = new RecoveryEngine();
    const result = await engine.extractWithRecovery(
      {
        metadata: {
          batchId: 'batch_test',
          rowCount: 1,
          estimatedTokens: 100,
          estimatedCost: 0.001,
          provider: 'anthropic',
          model: 'test',
          rowIndices: [0],
        },
        rows: [{ Email: 'a@b.com' }],
        headerContext: [],
      },
      provider,
      'v2',
      1,
    );

    expect(result.retries).toBeGreaterThanOrEqual(1);
    expect(result.rows).toHaveLength(1);
  });
});
