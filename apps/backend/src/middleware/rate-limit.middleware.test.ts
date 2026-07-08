import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import { config } from '@/config/index.js';
import { rateLimitMiddleware } from './rate-limit.middleware.js';

function mockRequest(ip = '127.0.0.1'): Request {
  return { ip, header: () => undefined, requestId: 'req_test' } as Request;
}

function mockResponse(): Response {
  return {} as Response;
}

describe('rateLimitMiddleware', () => {
  it('allows requests under the limit', () => {
    const req = mockRequest(`client-${String(Math.random())}`);
    const next = vi.fn() as NextFunction;

    rateLimitMiddleware(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks requests over the limit', () => {
    const req = mockRequest('blocked-client');
    const next = vi.fn() as NextFunction;

    for (let i = 0; i < config.rateLimit.maxRequests; i += 1) {
      rateLimitMiddleware(req, mockResponse(), next);
    }

    expect(() => rateLimitMiddleware(req, mockResponse(), next)).toThrow('Too many requests');
  });
});
