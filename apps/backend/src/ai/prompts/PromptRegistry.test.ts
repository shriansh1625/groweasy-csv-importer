import { describe, expect, it } from 'vitest';

import { PromptRegistry, promptBuilder } from './PromptRegistry.js';
import { FEW_SHOT_EXAMPLES, getExamplesForVersion } from './examples.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { CRM_FIELD_DEFINITIONS } from './rules.js';

describe('PromptRegistry', () => {
  it('lists v1, v2, and experimental versions', () => {
    expect(PromptRegistry.listVersions()).toEqual(['v1', 'v2', 'experimental']);
  });

  it('builds modular system prompt with all sections', () => {
    const system = buildSystemPrompt('v2');
    expect(system).toContain('CRM Extraction Engine');
    expect(system).toContain('OUTPUT CONTRACT');
    expect(system).toContain('GOOD_LEAD_FOLLOW_UP');
    expect(system).toContain('leads_on_demand');
    expect(system).toContain('Never fabricate');
    expect(system).not.toContain('```');
  });

  it('experimental system prompt adds stricter policy', () => {
    const experimental = buildSystemPrompt('experimental');
    expect(experimental).toContain('EXPERIMENTAL');
    expect(experimental.length).toBeGreaterThan(buildSystemPrompt('v2').length);
  });
});

describe('PromptBuilder', () => {
  const headerContext = [
    {
      originalHeader: 'Email',
      normalizedHeader: 'email',
      semanticType: 'email' as const,
      confidence: 95,
      matchReason: 'test',
    },
  ];

  it('builds v2 user prompt with enterprise payload shape', () => {
    const prompt = promptBuilder.build({
      rows: [{ Email: 'test@example.com' }],
      headerContext,
      version: 'v2',
    });

    const parsed = JSON.parse(prompt) as {
      task: string;
      promptVersion: string;
      rowsToProcess: unknown[];
      fewShotExamples: unknown[];
    };

    expect(parsed.task).toBe('crm_extraction');
    expect(parsed.promptVersion).toBe('v2');
    expect(parsed.rowsToProcess).toHaveLength(1);
    expect(parsed.fewShotExamples.length).toBeGreaterThanOrEqual(8);
  });

  it('includes all 18 examples for experimental version', () => {
    const prompt = promptBuilder.build({
      rows: [{ Email: 'a@b.com' }],
      headerContext,
      version: 'experimental',
    });
    const parsed = JSON.parse(prompt) as { fewShotExamples: unknown[] };
    expect(parsed.fewShotExamples).toHaveLength(FEW_SHOT_EXAMPLES.length);
  });
});

describe('Field definitions coverage', () => {
  it('defines all critical CRM fields', () => {
    const required = ['fullName', 'email', 'phone', 'leadOwner', 'crmStatus', 'dataSource', 'notes'];
    for (const field of required) {
      expect(CRM_FIELD_DEFINITIONS[field]).toBeDefined();
      expect(CRM_FIELD_DEFINITIONS[field]?.aliases.length).toBeGreaterThan(0);
    }
  });
});

describe('Few-shot examples', () => {
  it('has at least 15 examples with progressive difficulty', () => {
    expect(FEW_SHOT_EXAMPLES.length).toBeGreaterThanOrEqual(15);
    expect(FEW_SHOT_EXAMPLES.some((e) => e.difficulty === 'extreme')).toBe(true);
    expect(FEW_SHOT_EXAMPLES.some((e) => e.source.includes('Facebook'))).toBe(true);
  });

  it('v1 uses minimal examples for token efficiency', () => {
    expect(getExamplesForVersion('v1').length).toBe(3);
  });
});
