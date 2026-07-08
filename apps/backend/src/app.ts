import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from '@/config/index.js';
import {
  errorHandler,
  notFoundHandler,
  rateLimitMiddleware,
  requestIdMiddleware,
  requestTimingMiddleware,
} from '@/middleware/index.js';
import { createApiRouter } from '@/routes/index.js';

function isOriginAllowed(origin: string, allowed: string): boolean {
  if (allowed === '*') return true;
  if (allowed === origin) return true;
  if (allowed.startsWith('*.')) {
    return origin.endsWith(allowed.slice(1));
  }
  return false;
}

function createCorsOptions(): cors.CorsOptions {
  const allowedOrigins = config.server.corsOrigins;

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.some((allowed) => isOriginAllowed(origin, allowed));
      callback(null, isAllowed);
    },
    credentials: true,
    exposedHeaders: ['X-Request-Id'],
  };
}

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: `${String(config.upload.maxSizeMb)}mb` }));
  app.use(requestIdMiddleware);
  app.use(requestTimingMiddleware);
  app.use('/api/v1', rateLimitMiddleware);

  app.use('/api/v1', createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
