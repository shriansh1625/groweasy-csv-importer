const DATE_PATTERNS = [
  /^(\d{4})-(\d{2})-(\d{2})$/,
  /^(\d{2})\/(\d{2})\/(\d{4})$/,
  /^(\d{2})-(\d{2})-(\d{4})$/,
];

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  for (const pattern of DATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0] ?? null;
      }
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0] ?? null;
  }

  return null;
}

export function isValidDate(value: string): boolean {
  return normalizeDate(value) !== null;
}
