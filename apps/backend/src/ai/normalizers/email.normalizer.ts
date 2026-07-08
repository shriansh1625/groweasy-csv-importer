export function normalizeEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function isValidEmail(value: string): boolean {
  return normalizeEmail(value) !== null;
}
