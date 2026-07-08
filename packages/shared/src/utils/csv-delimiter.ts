export type CsvDelimiter = ',' | ';' | '\t' | '|';

const DELIMITER_CANDIDATES: CsvDelimiter[] = [',', ';', '\t', '|'];

/** Detect the most likely delimiter from the first non-empty line. */
export function detectCsvDelimiter(content: string): CsvDelimiter {
  const firstLine = content.split(/\r?\n/u).find((line) => line.trim().length > 0) ?? '';

  let best: CsvDelimiter = ',';
  let bestScore = 0;

  for (const delimiter of DELIMITER_CANDIDATES) {
    const score = firstLine.split(delimiter).length - 1;
    if (score > bestScore) {
      bestScore = score;
      best = delimiter;
    }
  }

  return best;
}

export function delimiterLabel(delimiter: CsvDelimiter): string {
  switch (delimiter) {
    case '\t':
      return 'Tab';
    case ';':
      return 'Semicolon';
    case '|':
      return 'Pipe';
    default:
      return 'Comma';
  }
}
