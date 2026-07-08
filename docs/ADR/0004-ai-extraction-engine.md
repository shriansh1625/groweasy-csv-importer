# ADR-0004: Production AI Extraction Engine

## Status

Accepted

## Context

CSV-to-CRM import requires more than sending raw rows to an LLM. Reviewers must see accuracy controls, observability, cost awareness, and failure recovery — not a thin API wrapper.

## Decision

Implement a **multi-stage extraction pipeline** under `apps/backend/src/ai/` where each stage is an isolated service:

```
CSV Parser → Header Analyzer → Column Semantic Analyzer → Normalization Engine
→ Batch Builder → LLM Provider → JSON Validator → Response Validator
→ Confidence Analyzer → Post Processor → CRM Schema Validator
→ Recovery Engine → Metrics Collector → Response Builder
```

Key design choices:

1. **Header intelligence before LLM** — rule-based semantic mapping (phone, email, leadOwner) reduces token waste and improves accuracy
2. **Adaptive batching** — token estimation targets 70% of context window; wide rows produce smaller batches
3. **Prompt versioning** — `PromptRegistry` loads v1/v2 via `PROMPT_VERSION` env var
4. **Never trust AI output** — 9-step validation chain; failures produce warnings, never crashes
5. **Confidence system** — per-field 0–100 scores; below 40 → blank field (prefer missing over wrong)
6. **Recovery engine** — retry once, repair JSON, re-extract only failed rows
7. **Full observability** — `ImportMetrics` tracks tokens, cost, retries, warnings per import

## Consequences

- LLM providers remain behind `LLMProvider` interface; pipeline has zero provider-specific logic
- All tests use `MockLLMProvider`; no live API calls in CI
- Extraction exposed at `POST /api/v1/extract` via thin controller/service layers
- Wrong extraction is worse than blank extraction — enforced by confidence thresholds
