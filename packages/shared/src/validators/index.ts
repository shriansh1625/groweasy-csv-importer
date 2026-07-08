import { z } from 'zod';

import { ValidationError } from '../errors/index.js';

export function parseOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown,
  requestId?: string,
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(
      'Validation failed',
      { issues: result.error.flatten() },
      requestId,
    );
  }

  return result.data;
}

export function assertDefined<T>(
  value: T | null | undefined,
  message: string,
  requestId?: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(message, undefined, requestId);
  }
}

export function assertNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
  requestId?: string,
): asserts value is string {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`, { field: fieldName }, requestId);
  }
}
