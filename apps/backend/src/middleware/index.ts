import type { NextFunction, Request, Response } from 'express';

import { isAppError, normalizeError, REQUEST_ID_HEADER } from '@groweasy/shared';
import { getLogger } from '@/logger/index.js';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId;
  const logger = getLogger().child({ requestId });

  const appError = isAppError(error) ? error : normalizeError(error, requestId);

  logger.error(
    {
      code: appError.code,
      status: appError.status,
      details: appError.details,
    },
    appError.message,
  );

  res.status(appError.status).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      requestId,
      timestamp: appError.timestamp,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId =
    (typeof incoming === 'string' ? incoming : incoming?.[0]) ?? crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
}

export function requestTimingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  res.on('finish', () => {
    const durationMs = Math.round(performance.now() - start);

    getLogger().logRequest({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
}

export { rateLimitMiddleware } from './rate-limit.middleware.js';
