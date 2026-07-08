import { describe, expect, it } from 'vitest';

import { MockLLMProvider } from '../providers/mock.provider.js';

import { BatchBuilder } from './batch.builder.js';

describe('BatchBuilder', () => {
  const mockProvider = new MockLLMProvider();
  const headerContext = [
    {
      originalHeader: 'Email',
      normalizedHeader: 'email',
      semanticType: 'email' as const,
      confidence: 95,
      matchReason: 'test',
    },
  ];

  it('creates batches within token limits', () => {
    const builder = new BatchBuilder();
    const rows = Array.from({ length: 100 }, (_, i) => ({
      Email: `user${String(i)}@test.com`,
    }));

    const batches = builder.buildBatches(rows, headerContext, {
      contextWindow: 10_000,
      targetContextRatio: 0.7,
      provider: 'anthropic',
      model: 'test-model',
      promptVersion: 'v2',
      llmProvider: mockProvider,
    });

    expect(batches.length).toBeGreaterThan(1);
    for (const batch of batches) {
      expect(batch.metadata.batchId).toMatch(/^batch_/);
      expect(batch.metadata.estimatedTokens).toBeLessThanOrEqual(7000);
      expect(batch.metadata.estimatedCost).toBeGreaterThan(0);
    }
  });

  it('reduces batch size for wide rows', () => {
    const builder = new BatchBuilder();
    const wideRow: Record<string, string> = {};
    for (let i = 0; i < 50; i++) {
      wideRow[`field_${String(i)}`] = 'x'.repeat(100);
    }

    const batches = builder.buildBatches([wideRow, wideRow, wideRow], headerContext, {
      contextWindow: 5_000,
      targetContextRatio: 0.7,
      provider: 'anthropic',
      model: 'test-model',
      promptVersion: 'v2',
      llmProvider: mockProvider,
    });

    expect(batches.length).toBeGreaterThanOrEqual(1);
    expect(batches[0]?.metadata.rowCount).toBeLessThanOrEqual(3);
  });
});
