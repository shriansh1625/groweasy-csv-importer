import { buildBasePrompt } from './base.js';
import { buildRulesPrompt } from './rules.js';
import { buildSchemaPrompt, buildSelfValidationPrompt } from './schema.js';

export type PromptVersion = 'v1' | 'v2' | 'experimental';

export function buildSystemPrompt(version: PromptVersion = 'v2'): string {
  const sections = [buildBasePrompt(), buildRulesPrompt(), buildSchemaPrompt(), buildSelfValidationPrompt()];

  if (version === 'experimental') {
    sections.push(
      'EXPERIMENTAL: Apply stricter blank-field policy. Require confidence >= 92 for accept without warning.',
    );
  }

  return sections.join('\n\n---\n\n');
}

/** @deprecated Use buildSystemPrompt() */
export const SYSTEM_PROMPT = buildSystemPrompt('v2');
