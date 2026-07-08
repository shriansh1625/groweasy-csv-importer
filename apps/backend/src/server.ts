import { createServer, type Server } from 'node:http';

import { bootstrapConfig, config } from '@/config/index.js';
import { getLogger } from '@/logger/index.js';

import { createApp } from './app.js';

export function startServer(): Server {
  bootstrapConfig();

  const logger = getLogger();
  const app = createApp();

  const server = createServer(app);

  // Long-running imports + SSE streams (Render/Railway proxy timeouts)
  server.requestTimeout = 0;
  server.headersTimeout = 660_000;
  server.keepAliveTimeout = 660_000;
  server.timeout = 660_000;

  server.listen(config.server.port, config.server.host, () => {
    logger.info(
      {
        port: config.server.port,
        host: config.server.host,
        env: config.app.env,
        llmProvider: config.llm.provider,
      },
      'Server started',
    );
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });

  return server;
}
