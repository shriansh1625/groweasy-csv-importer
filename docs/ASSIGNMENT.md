# GrowEasy Assignment — Evaluation Criteria Mapping

This document maps the official GrowEasy internship assignment rubric to concrete implementation in this repository.

## AI Prompt Engineering

| Criterion | Implementation |
|-----------|----------------|
| Accurate field extraction | Versioned prompts (`apps/backend/src/ai/prompts/`), CRM field rules, few-shot examples |
| Intelligent field mapping | `HeaderAnalyzer` + `ColumnSemanticAnalyzer` — fuzzy alias matching with confidence scores |
| Messy datasets | `PreprocessingEngine` — dedupe rows/columns, normalize phones/emails/dates |
| Ambiguous columns | Confidence-based demotion in `column-semantic.analyzer.ts`; visible in preview via `POST /extract/analyze` |
| Prompt injection defense | `sanitizeCellValue()` + untrusted-data instructions in `PromptBuilder.ts` |
| JSON recovery | `RecoveryEngine` — repair malformed LLM JSON, partial re-extraction |
| Tests | `prompt.regression.test.ts`, `header.analyzer.test.ts`, 37+ demo CSV validation |

## Backend Quality

| Criterion | Implementation |
|-----------|----------------|
| API design | REST + async workflow: `POST /extract/analyze`, `/start`, `GET /status`, `/result`, `/events` (SSE), `/retry`, `/export` |
| Clean architecture | Controllers → Services → Pipeline → Providers; shared types in `@groweasy/shared` |
| Error handling | Structured `AppError` hierarchy, global error middleware, Zod request validation |
| Batch processing | Token-aware `BatchBuilder`, parallel execution via `ConcurrencyPool` |
| Maintainability | Monorepo packages, ADRs in `docs/ADR/`, 80+ automated tests |

## Frontend Quality

| Criterion | Implementation |
|-----------|----------------|
| Modern UI | Next.js 14, Tailwind, Framer Motion, `@groweasy/ui` design system |
| Responsive layout | Mobile-first grids, sticky table headers, horizontal scroll |
| Clean UX | 4-step workflow: upload → preview → confirm → results |
| CSV preview | Virtualized table, search, sort, **column mapping badges** from analyze API |
| Loading states | Dynamic imports, progress panel, spinners, toast notifications |
| Error handling | `ErrorState`, retry without re-upload, SSE + polling fallback |

## Code Quality

| Criterion | Implementation |
|-----------|----------------|
| Readability | ESLint + Prettier, feature-based folders, ADRs |
| Type safety | Strict TypeScript across monorepo; Zod schemas for CRM + API |
| Folder structure | `apps/` + `packages/` — documented in `docs/FolderStructure.md` |
| Reusability | Shared UI package, config package, LLM provider abstraction |
| Best practices | Husky pre-commit, CI pipeline, conventional commits |

## Overall Engineering

| Criterion | Implementation |
|-----------|----------------|
| Performance | Virtualized tables, parallel batches, extraction cache, 200-row stress CSV |
| Edge cases | BOM, quoted commas/newlines, duplicate headers, formula injection, tab/semicolon delimiters |
| Production readiness | Render + Vercel deploy, rate limiting, CORS, SSE heartbeats, health checks |

## Bonus Features Checklist

| Bonus | Status | Location |
|-------|--------|----------|
| Drag & Drop upload | ✅ | `packages/ui/src/DropZone.tsx` |
| Progress indicators | ✅ | SSE + `ImportProgressPanel.tsx` (batch, throughput, tokens) |
| Streaming / incremental | ✅ | SSE job events; batch-by-batch processing |
| Retry failed batches | ✅ | `RecoveryEngine`, `POST /extract/:id/retry`, UI retry button |
| Virtualized tables | ✅ | `CsvPreviewTable.tsx`, `CrmDataGrid.tsx` |
| Dark mode | ✅ | `ThemeToggle.tsx`, Tailwind `dark:` classes |
| Unit tests | ✅ | 80+ backend tests + frontend parser tests |
| Docker setup | ✅ | `docker-compose.yml`, `apps/*/Dockerfile` |
| Cloud deployment | ✅ | Vercel (frontend) + Render (backend) — see `docs/DEPLOY.md` |
| README | ✅ | Root `README.md` + this guide |

## Recommended Reviewer Demo (5 min)

1. Upload `demo/csvs/01-facebook-leads-standard.csv` — clean extraction
2. Upload `demo/csvs/08-broken-headers-typos.csv` — see column mapping badges (`Nmae` → Name)
3. Watch live progress during import
4. Export CRM CSV from results
5. Skim `apps/backend/src/ai/prompts/PromptBuilder.ts` for prompt engineering depth
