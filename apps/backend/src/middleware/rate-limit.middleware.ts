import type { NextFunction, Request, Response } from 'express';

import { RateLimitError } from '@groweasy/shared';

import { config } from '@/config/index.js';

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

function clientKey(req: Request): string {
  const forwarded = req.header('x-forwarded-for');
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

export function rateLimitMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const { windowMs, maxRequests } = config.rateLimit;
  const key = clientKey(req);
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > maxRequests) {
    throw new RateLimitError('Too many requests', { retryAfterMs: bucket.resetAt - now }, req.requestId);
  }

  next();
}
