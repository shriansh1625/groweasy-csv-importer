import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ExtractionPipeline } from '../ai/pipeline/extraction.pipeline.js';
import { DemoLLMProvider } from '../providers/llm/demo.provider.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = join(__dirname, '../../../../demo/csvs');
const REPORT_PATH = join(__dirname, '../../../../docs/DemoPerformanceReport.md');

interface PerfRow {
  file: string;
  sizeKb: string;
  rows: number;
  durationMs: number;
  avgBatchMs: string | number;
  tokens: number;
  costUsd: string;
  successRate: string;
  imported: number;
  skipped: number;
  warnings: number;
}

describe('Demo performance report', () => {
  it('generates performance report for all demo CSVs', async () => {
    const csvs = readdirSync(DEMO_DIR)
      .filter((f) => f.endsWith('.csv'))
      .sort();

    expect(csvs.length).toBeGreaterThanOrEqual(20);

    const results: PerfRow[] = [];

    for (const name of csvs) {
      const content = readFileSync(join(DEMO_DIR, name), 'utf8');
      const sizeBytes = Buffer.byteLength(content, 'utf8');
      const rowCount = Math.max(0, content.split('\n').filter((l) => l.trim()).length - 1);

      const pipeline = new ExtractionPipeline();
      const provider = new DemoLLMProvider();

      const start = performance.now();
      const result = await pipeline.execute(content, {
        llmProvider: provider,
        importId: `perf_${name.replace('.csv', '')}`,
      });
      const durationMs = Math.round(performance.now() - start);

      results.push({
        file: name,
        sizeKb: (sizeBytes / 1024).toFixed(1),
        rows: rowCount,
        durationMs,
        avgBatchMs: result.metrics.averageBatchLatencyMs ?? '—',
        tokens: result.metrics.estimatedInputTokens + result.metrics.estimatedOutputTokens,
        costUsd: result.metrics.estimatedCostUsd.toFixed(4),
        successRate: result.metrics.totalRows
          ? `${String(Math.round((result.metrics.successfulRows / result.metrics.totalRows) * 100))}%`
          : '—',
        imported: result.metrics.successfulRows,
        skipped: result.metrics.skippedRows,
        warnings: result.warnings.length,
      });
    }

    const lines = [
      '# Demo Performance Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      'Provider: **mock** (DemoLLMProvider — heuristic extraction, no API key required)',
      '',
      '| CSV File | Size (KB) | Rows | Time (ms) | Avg Batch (ms) | Tokens | Est. Cost | Success | Imported | Skipped | Warnings |',
      '|----------|-----------|------|-----------|----------------|--------|-----------|---------|----------|---------|----------|',
    ];

    for (const r of results) {
      lines.push(
        `| ${r.file} | ${r.sizeKb} | ${String(r.rows)} | ${String(r.durationMs)} | ${String(r.avgBatchMs)} | ${String(r.tokens)} | $${r.costUsd} | ${r.successRate} | ${String(r.imported)} | ${String(r.skipped)} | ${String(r.warnings)} |`,
      );
    }

    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Files tested:** ${String(results.length)}`);
    lines.push(`- **Total rows:** ${String(results.reduce((s, r) => s + r.rows, 0))}`);
    lines.push(`- **Total processing time:** ${String(results.reduce((s, r) => s + r.durationMs, 0))} ms`);
    lines.push(`- **Total estimated tokens:** ${String(results.reduce((s, r) => s + r.tokens, 0))}`);
    lines.push(
      `- **Total estimated cost:** $${results.reduce((s, r) => s + parseFloat(r.costUsd), 0).toFixed(4)}`,
    );
    lines.push('');
    lines.push('> Regenerate: `pnpm demo:report`');

    writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
    expect(results.length).toBeGreaterThanOrEqual(20);
  });
});
