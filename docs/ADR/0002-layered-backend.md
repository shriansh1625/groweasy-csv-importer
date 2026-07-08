# ADR-0002: Layered Backend Architecture

## Status

Accepted

## Context

The backend must handle CSV processing, AI orchestration, file uploads, and API endpoints. Without clear boundaries, business logic tends to accumulate in route handlers, making testing and refactoring difficult.

## Decision

Implement a **strict layered architecture**:

```
Routes → Controllers → Services → Repositories
                              → Providers
```

Each layer has exactly one responsibility and may only depend on layers below it.

## Rationale

**Why controllers separate from services?**
Controllers deal with HTTP concerns (status codes, headers, request parsing). Services deal with business rules. Mixing them makes services untestable without spinning up Express.

**Why repositories even without a database?**
The repository pattern defines a data access contract. Starting with in-memory implementations means swapping to PostgreSQL later requires changing only the repository — zero service or controller changes.

**Why providers separate from services?**
LLM APIs, storage services, and email providers are external dependencies with different failure modes, retry logic, and cost tracking. Isolating them behind interfaces enables mocking in tests and swapping implementations via factory.

**Why middleware for cross-cutting concerns?**
Request ID generation, timing, error serialization, and rate limiting apply to every route. Middleware keeps these out of controllers.

## Layer Contracts

| Layer | Input | Output | Forbidden |
|-------|-------|--------|-----------|
| Route | HTTP request | Controller call | Business logic |
| Controller | Parsed request | HTTP response | Direct DB/API calls |
| Service | Domain input | Domain result | Express types |
| Repository | Query params | Typed data | Business rules |
| Provider | API request | API response | Business rules |

## Consequences

- New features add one file per layer (route, controller, service, repository)
- Unit tests mock at repository/provider boundaries
- Global error handler catches all unhandled exceptions
- Request lifecycle is fully traceable via `requestId`

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| MVC only (no repository) | Tightly couples services to database implementation |
| Hexagonal architecture (full ports/adapters) | Over-engineered for current scale; layered approach achieves same decoupling with less ceremony |
| Route handlers with inline logic | Fast initially but creates untestable, unmaintainable code within weeks |
