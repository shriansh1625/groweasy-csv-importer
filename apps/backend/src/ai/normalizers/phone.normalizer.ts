export function normalizePhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, '');
  if (digits.length < 7) {
    return null;
  }

  if (digits.startsWith('+')) {
    return digits;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return digits.startsWith('1') && digits.length === 11 ? `+${digits}` : digits;
}

export function isValidPhone(value: string): boolean {
  return normalizePhone(value) !== null;
}
