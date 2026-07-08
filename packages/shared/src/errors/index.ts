export interface AppErrorOptions {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
  requestId?: string;
  cause?: unknown;
}

function buildErrorOptions(
  base: Pick<AppErrorOptions, 'message' | 'code' | 'status'>,
  extras?: Partial<{
    details: Record<string, unknown> | undefined;
    requestId: string | undefined;
    cause: unknown;
  }>,
): AppErrorOptions {
  const options: AppErrorOptions = { ...base };

  if (extras?.details !== undefined) {
    options.details = extras.details;
  }
  if (extras?.requestId !== undefined) {
    options.requestId = extras.requestId;
  }
  if (extras?.cause !== undefined) {
    options.cause = extras.cause;
  }

  return options;
}

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown> | undefined;
  readonly timestamp: string;
  readonly requestId: string | undefined;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions(
        { message, code: 'VALIDATION_ERROR', status: 422 },
        { details, requestId },
      ),
    );
  }
}

export class CsvParseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions(
        { message, code: 'CSV_PARSE_ERROR', status: 422 },
        { details, requestId },
      ),
    );
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions(
        { message, code: 'AI_PROVIDER_ERROR', status: 502 },
        { details, requestId },
      ),
    );
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      buildErrorOptions({ message, code: 'CONFIGURATION_ERROR', status: 500 }, { details }),
    );
  }
}

export class UploadError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions({ message, code: 'UPLOAD_ERROR', status: 400 }, { details, requestId }),
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions({ message, code: 'RATE_LIMIT_ERROR', status: 429 }, { details, requestId }),
    );
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(
      buildErrorOptions({ message, code: 'NOT_FOUND', status: 404 }, { details, requestId }),
    );
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function normalizeError(error: unknown, requestId?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      buildErrorOptions(
        { message: error.message, code: 'INTERNAL_ERROR', status: 500 },
        { requestId, cause: error },
      ),
    );
  }

  return new AppError(
    buildErrorOptions(
      { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR', status: 500 },
      { requestId, details: { originalError: String(error) } },
    ),
  );
}
