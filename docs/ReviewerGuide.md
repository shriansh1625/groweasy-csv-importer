# Reviewer Guide

**Time to first result: ~2 minutes.** This guide is written for a GrowEasy engineer evaluating this submission.

---

## Deployment

See [docs/DEPLOY.md](./DEPLOY.md) for Vercel + Render/Railway setup.

---

## Demo Video

Record a 2-minute walkthrough using [docs/DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

---

## 1. Run It (2 minutes)

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open **http://localhost:3000**

No API key needed — `.env.example` defaults to `LLM_PROVIDER=mock`.

Verify the API status chip in the top nav shows **API Online** (green).

---

## 2. Upload a Demo CSV (3 minutes)

Demo files live in `demo/csvs/`. Recommended first upload:

```
demo/csvs/01-facebook-leads-standard.csv
```

**Steps:**
1. Drag the file onto the upload zone (or click to browse)
2. Review the CSV preview table — sort columns, search rows
3. Click **Start AI Import**
4. Watch the live progress panel (SSE streaming)
5. Inspect the results dashboard — metrics, confidence scores, exports

---

## 3. Recommended Demo Sequence (10 minutes)

Upload these files in order to see the full range of capabilities:

| # | File | What to look for |
|---|------|-----------------|
| 1 | `01-facebook-leads-standard.csv` | Clean extraction, 5 records, high confidence |
| 2 | `08-broken-headers-typos.csv` | Header typos (Nmae, Emial) — **use real LLM for best results**; mock mode may skip |
| 3 | `12-unicode-emoji.csv` | Unicode names and emoji in notes |
| 4 | `17-formula-injection.csv` | Security — `=SUM()` cells handled safely |
| 5 | `14-blank-rows.csv` | Blank row skipping |
| 6 | `26-large-dataset-200-rows.csv` | 200 rows, batch progress, ~65ms processing |

---

## 4. What to Inspect in the Code

If you have 15 minutes to read code, prioritize these files:

### AI Pipeline (core assignment)
| File | Why |
|------|-----|
| `apps/backend/src/ai/pipeline/extraction.pipeline.ts` | Main orchestration — parse → analyze → batch → extract → validate |
| `apps/backend/src/ai/prompts/PromptBuilder.ts` | Structured prompt construction with few-shot examples |
| `apps/backend/src/ai/pipeline/recovery.engine.ts` | JSON repair, retry, partial re-extraction |
| `apps/backend/src/ai/extractors/header.analyzer.ts` | Column → CRM field semantic mapping |

### Architecture
| File | Why |
|------|-----|
| `apps/backend/src/providers/llm/factory.ts` | Multi-provider LLM abstraction |
| `apps/backend/src/jobs/import-job.store.ts` | SSE job store + progress events |
| `packages/shared/src/schemas/crm.ts` | CRM field definitions + Zod schemas |

### Frontend UX
| File | Why |
|------|-----|
| `apps/frontend/src/features/import/components/ImportWorkflow.tsx` | State machine: upload → preview → import → results |
| `apps/frontend/src/services/extraction.service.ts` | SSE client, API integration |

### Security
| File | Why |
|------|-----|
| `apps/backend/src/security/sanitizer.ts` | Formula injection + upload validation |
| `apps/backend/src/middleware/rate-limit.middleware.ts` | Rate limiting |

---

## 5. Run Tests

```bash
pnpm test                  # 80+ tests across monorepo
pnpm demo:validate         # All 26 demo CSVs — no crashes
pnpm demo:report           # Regenerate performance report
pnpm typecheck             # Strict TypeScript
pnpm build                 # Full production build
```

---

## 6. Expected Outputs

### `01-facebook-leads-standard.csv`
- **5 records** extracted
- Fields: fullName, email, phone mapped from Facebook columns
- Confidence scores 80–98%
- Zero warnings (clean data)

### `26-large-dataset-200-rows.csv`
- **200 records** extracted
- Multiple batches visible in progress panel
- Processing time ~65ms (mock mode)
- Export buttons produce downloadable CRM CSV

### `17-formula-injection.csv`
- **5 records** — formula cells sanitized, not executed
- No security errors or crashes

### `14-blank-rows.csv`
- **2 records** imported, **1 skipped** (blank row)
- Skipped rows visible in metrics

---

## 7. Interesting Engineering Decisions

1. **Mock provider for zero-friction review** — `LLM_PROVIDER=mock` runs heuristic extraction without API keys. Real LLM available by changing one env var.

2. **Versioned prompts** — Prompt v1/v2/experimental with regression tests. Prompt changes are testable, not ad-hoc strings.

3. **"Wrong data is worse than missing data"** — Confidence scoring blanks uncertain fields rather than guessing.

4. **SSE over polling** — Real-time progress via Server-Sent Events, not fake progress bars.

5. **Token-aware batching** — Rows batched to 70% of LLM context window, with parallel batch processing (max 3 concurrent).

6. **No database by design** — In-memory job store keeps deployment simple. Documented as intentional MVP boundary.

7. **Monorepo with shared types** — Frontend and backend share CRM schemas, error types, and API contracts via `@groweasy/shared`.

---

## 8. Known Limitations

| Limitation | Why |
|-----------|-----|
| In-memory jobs | Jobs lost on server restart — acceptable for demo/MVP |
| No authentication | Single-user tool; no multi-tenant isolation |
| Mock mode uses heuristics | Not real AI — switch to `anthropic`/`openai`/`gemini` for LLM extraction |
| Very broken headers (typos) | May skip rows when semantics can't infer — real LLM handles better |
| No frontend tests | Backend has 80+ tests; UI tested manually |

---

## 9. Switch to Real LLM (Optional)

To test with actual AI extraction:

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Restart `pnpm dev`. The same demo CSVs will now use Claude for extraction.

Estimated cost for all 26 demo files: **< $0.50** with Claude Sonnet.

---

## 10. Questions?

Check these docs:
- [README](../README.md) — full project overview
- [Architecture](./Architecture.md) — system design
- [Demo Performance Report](./DemoPerformanceReport.md) — benchmarks
- [Engineering Audit](./EngineeringAudit.md) — Phase 6 quality review
- [ADRs](./ADR/) — architecture decisions
