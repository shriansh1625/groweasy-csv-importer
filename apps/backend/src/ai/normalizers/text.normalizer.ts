export function trimWhitespace(value: string): string {
  return value.trim();
}

export function collapseDuplicateSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeUnicode(value: string): string {
  return value.normalize('NFKC');
}

export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function normalizeText(value: string): string {
  return collapseDuplicateSpaces(normalizeUnicode(trimWhitespace(value)));
}

export function normalizeHeader(header: string): string {
  return normalizeText(header).toLowerCase();
}
