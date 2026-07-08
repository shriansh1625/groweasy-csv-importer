import type { ExtractionPipelineResult } from '@groweasy/shared';

interface CacheEntry {
  result: ExtractionPipelineResult;
  createdAt: number;
  ttlMs: number;
}

export class ExtractionCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 3_600_000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get(importId: string): ExtractionPipelineResult | null {
    const entry = this.store.get(importId);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.store.delete(importId);
      return null;
    }

    return entry.result;
  }

  set(importId: string, result: ExtractionPipelineResult, ttlMs?: number): void {
    this.store.set(importId, {
      result,
      createdAt: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
    });
  }

  invalidate(importId: string): void {
    this.store.delete(importId);
  }

  clear(): void {
    this.store.clear();
  }
}
