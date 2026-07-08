# Folder Structure

## Root

```
groweasy-csv-importer/
├── apps/                   Application packages
├── packages/               Shared library packages
├── docs/                   Documentation
│   └── ADR/                Architecture Decision Records
├── scripts/                Operational scripts
├── .github/workflows/      CI/CD pipelines
├── .husky/                 Git hooks
├── package.json            Root workspace config
├── pnpm-workspace.yaml     Workspace definition
├── turbo.json              Build orchestration
├── tsconfig.base.json      Shared TypeScript config
├── eslint.config.js        Root ESLint (flat config)
├── .prettierrc             Code formatting
├── .editorconfig           Editor consistency
├── .env.example            Environment template
└── README.md
```

## apps/backend/src/

```
src/
├── ai/             Extraction pipeline (batching, prompts, validators, metrics)
├── config/         Re-exports validated config (no direct process.env)
├── routes/         Express route definitions
├── controllers/    Request → response translation
├── services/       Business logic orchestration
├── repositories/   Data access layer (health stub)
├── middleware/     HTTP middleware (errors, requestId, timing, rate limit)
├── security/       Upload sanitization and injection defenses
├── jobs/           In-memory import job store and SSE progress
├── types/          Backend-specific type definitions
├── utils/          Backend-specific utilities
├── providers/      External service integrations
│   └── llm/        LLM provider abstraction (Claude, OpenAI, Gemini)
├── logger/         Pino structured logging
├── app.ts          Express application factory
├── server.ts       Server bootstrap and lifecycle
└── index.ts        Entry point
```

## apps/frontend/src/

```
src/
├── app/            Next.js App Router pages and layouts
├── components/     Layout components (TopNav)
├── services/       API client functions
├── stores/         Zustand import workflow state
├── config/         Frontend configuration constants
├── features/       Feature-isolated modules
│   └── import/     CSV upload, preview, progress, results
└── styles/         Global CSS and Tailwind
```

## packages/shared/src/

```
src/
├── constants/      Application-wide constants
├── types/          Shared TypeScript interfaces
├── schemas/        Zod validation schemas
├── utils/          Pure utility functions
├── validators/     Validation helpers
├── errors/         Error class hierarchy
└── logger/         Logger interface (implementation in apps)
```

## packages/config/src/

```
src/
└── index.ts        Zod-validated env config with typed accessors
```

## packages/ui/src/

```
src/
├── Button.tsx      Shared button component
└── index.ts        Public exports
```

## Feature Isolation Pattern

When adding a new feature (e.g., CSV upload):

```
apps/frontend/src/features/csv-upload/
├── components/     UploadForm.tsx, ProgressBar.tsx
├── hooks/          useCsvUpload.ts
├── services/       csv-upload.service.ts
└── types/          csv-upload.types.ts

apps/backend/src/
├── routes/csv.routes.ts
├── controllers/csv.controller.ts
├── services/csv.service.ts
├── repositories/csv.repository.ts
└── validators/csv.validator.ts
```

Each feature touches exactly one file per layer. No cross-feature imports.
