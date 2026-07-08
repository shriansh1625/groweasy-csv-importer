import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ExtractionPipeline } from '../ai/pipeline/extraction.pipeline.js';
import { DemoLLMProvider } from '../providers/llm/demo.provider.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = join(__dirname, '../../../../demo/csvs');

function loadDemoCsvs(): Array<{ name: string; content: string }> {
  const results: Array<{ name: string; content: string }> = [];

  function scan(dir: string, prefix = ''): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.csv')) {
        results.push({
          name: `${prefix}${entry.name}`,
          content: readFileSync(fullPath, 'utf8'),
        });
      }
    }
  }

  scan(DEMO_DIR);
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

describe('Demo CSV validation', () => {
  const csvs = loadDemoCsvs();

  expect(csvs.length).toBeGreaterThanOrEqual(30);

  for (const { name, content } of csvs) {
    it(`processes ${name} without crashing`, async () => {
      const pipeline = new ExtractionPipeline();
      const provider = new DemoLLMProvider();

      const result = await pipeline.execute(content, {
        llmProvider: provider,
        importId: `demo_${name}`,
      });

      expect(result.importId).toBeDefined();
      expect(result.metrics.totalRows).toBeGreaterThanOrEqual(0);
      expect(result.records).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.metrics.processingDurationMs).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('Demo CSV edge cases', () => {
  it('handles formula injection CSV safely', async () => {
    const content = readFileSync(join(DEMO_DIR, '17-formula-injection.csv'), 'utf8');
    const pipeline = new ExtractionPipeline();
    const result = await pipeline.execute(content, {
      llmProvider: new DemoLLMProvider(),
      importId: 'demo_formula',
    });

    expect(result.records.length).toBeGreaterThan(0);
    expect(result.metrics.successfulRows).toBeGreaterThan(0);
  });

  it('handles blank rows CSV with skips', async () => {
    const content = readFileSync(join(DEMO_DIR, '14-blank-rows.csv'), 'utf8');
    const pipeline = new ExtractionPipeline();
    const result = await pipeline.execute(content, {
      llmProvider: new DemoLLMProvider(),
      importId: 'demo_blank',
    });

    expect(result.metrics.totalRows).toBeGreaterThan(0);
  });

  it('handles large dataset within reasonable time', async () => {
    const content = readFileSync(join(DEMO_DIR, '26-large-dataset-200-rows.csv'), 'utf8');
    const pipeline = new ExtractionPipeline();
    const start = performance.now();
    const result = await pipeline.execute(content, {
      llmProvider: new DemoLLMProvider(),
      importId: 'demo_large',
    });
    const durationMs = performance.now() - start;

    expect(result.metrics.totalRows).toBe(200);
    expect(durationMs).toBeLessThan(30_000);
  });
});
