import { describe, expect, it } from 'vitest';

import { MetricsCollector } from './metrics.collector.js';

describe('MetricsCollector', () => {
  it('resets state between runs', () => {
    const collector = new MetricsCollector();

    collector.start('import_a', 'v1', 'anthropic', 'claude', 10);
    collector.recordBatch(100, 50, 0.01, 2);
    collector.recordSuccess(5);
    collector.recordSkipped(2);

    collector.start('import_b', 'v2', 'openai', 'gpt-4', 3);

    const metrics = collector.finalize();

    expect(metrics.importId).toBe('import_b');
    expect(metrics.promptVersion).toBe('v2');
    expect(metrics.provider).toBe('openai');
    expect(metrics.totalRows).toBe(3);
    expect(metrics.successfulRows).toBe(0);
    expect(metrics.skippedRows).toBe(0);
    expect(metrics.retries).toBe(0);
    expect(metrics.estimatedInputTokens).toBe(0);
    expect(metrics.estimatedCostUsd).toBe(0);
  });
});
