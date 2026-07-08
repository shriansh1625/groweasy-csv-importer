# ADR-0005: Enterprise Prompt Engineering

## Status

Accepted

## Context

The extraction engine's accuracy is primarily determined by prompt quality. A generic "extract CRM fields from CSV" instruction produces hallucinations, inconsistent enums, and unstructured output.

## Decision

Implement **modular prompt assembly** with single-responsibility files:

| Module | Responsibility |
|--------|----------------|
| `base.ts` | Engine identity, mission, deterministic behavior |
| `rules.ts` | Per-field definitions, semantic inference, ambiguity/multiple-value rules |
| `schema.ts` | Output contract, self-validation checklist |
| `examples.ts` | 18 few-shot examples (progressive difficulty) |
| `systemPrompt.ts` | Assembles system prompt from modules |
| `PromptBuilder.ts` | Assembles user prompt with column context + rows |
| `PromptRegistry.ts` | Version routing (v1, v2, experimental) |

Output contract enforced:
```json
{ "records": [], "skipped": [], "warnings": [], "metadata": {} }
```

## Key Principles

1. AI is a **deterministic extraction engine**, not an assistant
2. Wrong data > missing data → blank fields preferred over guesses
3. `crmStatus` and `dataSource` are strict enums — never invent values
4. Snake_case LLM output mapped to camelCase via `field-mapper.ts`
5. v2 uses 8 few-shot examples; experimental uses all 18

## Consequences

- Prompt changes require no application logic changes (PROMPT_VERSION env)
- Regression tests validate schema compliance without live API calls
- Legacy `{ rows: [] }` format still supported for backward compatibility
