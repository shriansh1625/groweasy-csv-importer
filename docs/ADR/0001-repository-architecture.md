# ADR-0001: Repository Architecture

## Status

Accepted

## Context

GrowEasy CSV Importer needs to support a web frontend, API backend, shared business types, and multiple AI provider integrations. The team needs a structure that scales with feature growth without requiring major refactors.

## Decision

Adopt a **pnpm monorepo** with Turborepo orchestration:

- `apps/frontend` — Next.js 14 App Router
- `apps/backend` — Express TypeScript API
- `packages/shared` — framework-agnostic shared code
- `packages/config` — validated environment configuration
- `packages/ui` — shared React components

## Rationale

**Why monorepo over polyrepo?**
Shared types, errors, and schemas must stay in sync between frontend and backend. A monorepo eliminates version drift and enables atomic cross-package changes.

**Why pnpm over npm/yarn?**
pnpm's content-addressable storage reduces disk usage and enforces strict dependency boundaries via symlinks. Workspace protocol (`workspace:*`) makes internal package references explicit.

**Why Turborepo?**
Task caching and dependency-aware builds mean CI only rebuilds what changed. `dependsOn: ["^build"]` ensures shared packages compile before apps.

**Why separate `packages/config`?**
Environment validation is a cross-cutting concern. Isolating it prevents both apps from duplicating Zod schemas and ensures a single source of truth for configuration shape.

## Consequences

- All packages share `tsconfig.base.json` for consistent compiler settings
- Internal dependencies use `workspace:*` protocol
- Root scripts delegate to Turbo for parallel execution
- New packages can be added without restructuring existing apps

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| Single-package repo | Frontend and backend have different build tools, deploy targets, and runtime environments |
| Nx monorepo | Higher complexity for initial setup; Turborepo sufficient for current scale |
| Lerna | Less active maintenance; pnpm workspaces + Turbo is the modern standard |
