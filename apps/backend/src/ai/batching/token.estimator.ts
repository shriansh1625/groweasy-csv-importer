import { buildSystemPrompt } from '../prompts/systemPrompt.js';

const CHARS_PER_TOKEN = 4;

export class TokenEstimator {
  estimateTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  estimateRowTokens(row: Record<string, string>, activeHeaders: string[]): number {
    const payload = activeHeaders
      .map((header) => `${header}:${row[header] ?? ''}`)
      .join('|');
    return this.estimateTokens(payload);
  }

  estimatePromptOverhead(): number {
    return this.estimateTokens(buildSystemPrompt('v2')) + 500;
  }

  estimateBatchTokens(
    rows: Record<string, string>[],
    activeHeaders: string[],
    promptTemplateSize: number,
  ): number {
    const overhead = this.estimatePromptOverhead() + promptTemplateSize;
    const rowTokens = rows.reduce(
      (sum, row) => sum + this.estimateRowTokens(row, activeHeaders),
      0,
    );
    const outputEstimate = rows.length * 150;
    return overhead + rowTokens + outputEstimate;
  }
}
