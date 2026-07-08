# Architecture

## Overview

**groweasy-csv-importer** is a pnpm monorepo designed for long-term maintainability. Every package and application has a single, well-defined responsibility. Business logic is isolated from framework code, configuration is validated at startup, and cross-cutting concerns (logging, errors, types) are centralized.

## Monorepo Layout

```
groweasy-csv-importer/
├── apps/
│   ├── frontend/     Next.js 14 (App Router) — user interface
│   └── backend/      Express API — business orchestration
├── packages/
│   ├── shared/       Framework-agnostic types, errors, schemas, utils
│   ├── config/       Validated environment configuration (Zod)
│   └── ui/           Shared React components
├── docs/             Engineering documentation
├── scripts/          Operational scripts (doctor, clean)
└── .github/          CI/CD workflows
```

## Layered Backend

The backend follows strict separation of concerns:

| Layer | Responsibility | May depend on |
|-------|---------------|---------------|
| Routes | HTTP routing, middleware wiring | Controllers |
| Controllers | Request/response translation | Services |
| Services | Business logic orchestration | Repositories, Providers |
| Repositories | Data access abstraction | External stores |
| Providers | Third-party integrations (LLM) | Config |
| Middleware | Cross-cutting HTTP concerns | Logger, Errors |

**Controllers never contain business logic.**
**Services never import Express types.**
**Repositories isolate all data operations.**

## AI Provider Abstraction

LLM integrations are behind an `LLMProvider` interface. Switching providers requires only a change to `LLM_PROVIDER` in environment configuration — zero business logic changes.

```
createLLMProvider() → ClaudeProvider | OpenAIProvider | GeminiProvider
```

## Configuration Strategy

All environment variables are validated once at startup via `@groweasy/config` using Zod schemas. Applications never read `process.env` directly. Invalid configuration causes an immediate fail-fast crash with descriptive errors.

## Error System

A unified error hierarchy extends `AppError`. Every error carries `message`, `code`, `status`, `details`, `timestamp`, and optional `requestId`. The global error middleware serializes these consistently for API consumers.

## Logging

Structured logging via Pino. Every HTTP request logs `requestId`, `method`, `path`, `status`, and `durationMs`. Every AI request logs `batchId`, `provider`, `model`, token counts, cost estimate, retry count, and processing time.

## Frontend Architecture

Next.js 14 App Router with feature-based folder isolation. Components are presentational; services handle API calls; hooks encapsulate stateful logic; stores manage client state. Business logic never lives inside components.

## Build Orchestration

Turborepo manages task dependencies across packages. Shared packages build before dependents. CI runs lint, typecheck, build, and test in parallel where possible.

## Scalability Path

| Concern | Current | Future |
|---------|---------|--------|
| Data storage | In-memory repositories | PostgreSQL via repository swap |
| Job processing | Queue interface stub | BullMQ / Redis workers |
| LLM calls | Provider abstraction | Batch processing with retry |
| Frontend state | Store scaffolding | Zustand or TanStack Query |
| Deployment | Docker-ready structure | Container per app |

## Key Design Principles

1. **Fail fast** — invalid config crashes at startup, not at runtime
2. **Interface over implementation** — repositories, providers, queues are swappable
3. **Type safety end-to-end** — strict TypeScript, Zod validation, shared types
4. **No console.log** — structured logging everywhere
5. **Conventional commits** — enforced via Husky + Commitlint
