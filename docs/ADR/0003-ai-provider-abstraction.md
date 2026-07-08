# ADR-0003: AI Provider Abstraction

## Status

Accepted

## Context

The CSV importer uses LLMs for data analysis, column mapping, and validation. The choice of LLM provider may change based on cost, performance, availability, or customer requirements. Hardcoding a single provider (e.g., Anthropic) would require rewriting business logic to switch.

## Decision

Implement an **LLM provider abstraction** with a factory pattern:

```typescript
interface LLMProvider {
  readonly name: string;
  readonly model: string;
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  estimateCost(inputTokens: number, outputTokens: number): number;
}
```

Provider selection via `process.env.LLM_PROVIDER` and `createLLMProvider()` factory.

Supported providers:
- `ClaudeProvider` (Anthropic)
- `OpenAIProvider` (OpenAI)
- `GeminiProvider` (Google)

## Rationale

**Why an interface, not a switch statement in services?**
Services depend on `LLMProvider`, not a specific implementation. The factory resolves the concrete provider at startup based on configuration. Adding a fourth provider requires one new class and one factory case — zero service changes.

**Why include cost estimation in the interface?**
Every AI call must log estimated cost for observability and billing. Each provider has different pricing; encapsulating cost logic in the provider keeps services provider-agnostic.

**Why environment-based selection?**
Different environments may use different providers (cheap model in dev, production model in prod). Environment variables are the standard 12-factor approach and integrate with the existing `@groweasy/config` validation.

**Why not use a third-party abstraction library?**
Libraries like LangChain add significant dependency weight and opinionated patterns. A thin interface with three implementations gives full control over retry logic, logging, and error handling.

## Logging Contract

Every AI request logs:
- `batchId` — correlates batched CSV rows
- `provider` — which LLM was used
- `model` — specific model identifier
- `inputTokens` / `outputTokens` — token usage
- `estimatedCostUsd` — cost from provider's estimateCost()
- `retryCount` — number of retries attempted
- `processingTimeMs` — wall-clock duration

## Consequences

- Switching providers is a config change, not a code change
- Each provider implements its own retry and rate-limit strategy
- Services receive a provider via dependency injection
- Provider implementations are independently testable with mocked API responses

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| Direct Anthropic SDK calls in services | Provider lock-in; every service file needs changes to switch |
| LangChain/LlamaIndex | Heavy dependency; abstracts away logging and cost tracking we need |
| Single provider with adapter | Doesn't support runtime provider selection per customer |
