import pino from 'pino';

import { config } from '@/config/index.js';
import type { AILogContext, Logger, LogContext, LogLevel, RequestLogContext } from '@groweasy/shared';

class PinoLogger implements Logger {
  private readonly pino: pino.Logger;

  constructor(context: LogContext = {}) {
    this.pino = pino({
      level: config.logging.level,
      ...(config.app.isDevelopment
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
          }
        : {}),
    }).child(context);
  }

  fatal(context: LogContext, message: string): void {
    this.pino.fatal(context, message);
  }

  error(context: LogContext, message: string): void {
    this.pino.error(context, message);
  }

  warn(context: LogContext, message: string): void {
    this.pino.warn(context, message);
  }

  info(context: LogContext, message: string): void {
    this.pino.info(context, message);
  }

  debug(context: LogContext, message: string): void {
    this.pino.debug(context, message);
  }

  trace(context: LogContext, message: string): void {
    this.pino.trace(context, message);
  }

  child(context: LogContext): Logger {
    return new PinoLogger({ ...context });
  }

  logRequest(context: RequestLogContext): void {
    this.pino.info(
      {
        requestId: context.requestId,
        method: context.method,
        path: context.path,
        status: context.status,
        durationMs: context.durationMs,
      },
      'HTTP request completed',
    );
  }

  logAIRequest(context: AILogContext): void {
    this.pino.info(
      {
        batchId: context.batchId,
        provider: context.provider,
        model: context.model,
        inputTokens: context.inputTokens,
        outputTokens: context.outputTokens,
        estimatedCostUsd: context.estimatedCostUsd,
        retryCount: context.retryCount,
        processingTimeMs: context.processingTimeMs,
      },
      'AI request completed',
    );
  }
}

let rootLogger: Logger | undefined;

export function createLogger(context: LogContext = {}): Logger {
  return new PinoLogger(context);
}

export function getLogger(): Logger {
  if (!rootLogger) {
    rootLogger = createLogger({ service: 'backend' });
  }
  return rootLogger;
}

export function setLogLevel(level: LogLevel): void {
  // Re-create root logger on level change during tests
  rootLogger = createLogger({ service: 'backend', level });
}

export type { AILogContext, Logger, LogContext, LogLevel, RequestLogContext } from '@groweasy/shared';
