# Coding Standards

## TypeScript

- **Strict mode** enabled everywhere (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Prefer `type` imports: `import type { Foo } from './foo.js'`
- No `any` — use `unknown` and narrow with type guards
- No `console.log` — use the structured logger

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files | kebab-case or dot-separated | `health.service.ts`, `async-handler.ts` |
| Classes | PascalCase | `HealthService`, `ClaudeProvider` |
| Functions | camelCase | `createLLMProvider`, `parseOrThrow` |
| Constants | SCREAMING_SNAKE_CASE | `ERROR_CODES`, `LLM_PROVIDERS` |
| Interfaces | PascalCase, no `I` prefix | `LLMProvider`, `Logger` |
| Enums | Avoid — use `as const` objects | `LLM_PROVIDERS` |

## Import Order

Enforced by ESLint `import/order`:

1. Node built-ins
2. External packages
3. Internal packages (`@groweasy/*`)
4. Absolute imports (`@/*`)
5. Relative imports

Blank line between each group. Alphabetical within groups.

## Error Handling

- Throw typed errors extending `AppError`
- Never throw raw strings or generic `Error` in application code
- Controllers do not catch errors — the global middleware handles them
- Always include `requestId` when available

## Layer Rules (Backend)

```
Routes → Controllers → Services → Repositories
                              → Providers
```

- **Routes**: wire HTTP verbs to controller methods
- **Controllers**: extract request data, call service, format response
- **Services**: orchestrate business logic, no HTTP knowledge
- **Repositories**: data access only, return typed results
- **Providers**: external API integrations (LLM, storage, etc.)

## Frontend Rules

- Components are presentational — no fetch calls inside JSX files
- API calls live in `services/`
- Stateful logic lives in `hooks/` or `stores/`
- Feature code lives in `features/<feature-name>/`
- Shared UI in `packages/ui`, app-specific in `components/`

## Testing

- Unit tests colocated as `*.test.ts`
- Test behavior, not implementation details
- Mock at repository/provider boundaries, not internal functions
- Every shared utility and service should have at least one test

## Git Workflow

- Conventional Commits enforced: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Pre-commit: lint-staged runs ESLint + Prettier on staged files
- Commit-msg: commitlint validates message format

## Documentation

- Architecture decisions recorded as ADRs in `docs/ADR/`
- Public APIs documented with JSDoc where non-obvious
- README kept current with setup instructions
