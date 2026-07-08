import { describe, expect, it } from 'vitest';

import { generateId, calculateTotalPages } from './utils/index.js';
import { ValidationError, isAppError } from './errors/index.js';

describe('shared utilities', () => {
  it('generates unique ids with prefix', () => {
    const id = generateId('req');
    expect(id.startsWith('req_')).toBe(true);
  });

  it('calculates total pages', () => {
    expect(calculateTotalPages(100, 50)).toBe(2);
    expect(calculateTotalPages(101, 50)).toBe(3);
  });
});

describe('error hierarchy', () => {
  it('identifies AppError instances', () => {
    const error = new ValidationError('Invalid input');
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(422);
    expect(error.timestamp).toBeDefined();
  });
});
