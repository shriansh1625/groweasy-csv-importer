import type { ValidationWarning } from '@groweasy/shared';

export interface JsonParseResult {
  success: boolean;
  data: unknown;
  warnings: ValidationWarning[];
}

export class JsonValidator {
  parse(content: string): JsonParseResult {
    const warnings: ValidationWarning[] = [];
    const trimmed = content.trim();

    const jsonMatch = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
    const jsonString = jsonMatch?.[1]?.trim() ?? trimmed;

    try {
      const data = JSON.parse(jsonString) as unknown;
      return { success: true, data, warnings };
    } catch (error) {
      warnings.push({
        code: 'JSON_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to parse JSON',
        severity: 'error',
      });
      return { success: false, data: null, warnings };
    }
  }

  repair(content: string): JsonParseResult {
    let repaired = content.trim();

    const jsonMatch = /```(?:json)?\s*([\s\S]*?)```/.exec(repaired);
    if (jsonMatch?.[1]) {
      repaired = jsonMatch[1].trim();
    }

    repaired = repaired
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/'/g, '"');

    const openBraces = (repaired.match(/{/g) ?? []).length;
    const closeBraces = (repaired.match(/}/g) ?? []).length;
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }

    const openBrackets = (repaired.match(/\[/g) ?? []).length;
    const closeBrackets = (repaired.match(/]/g) ?? []).length;
    if (openBrackets > closeBrackets) {
      repaired += ']'.repeat(openBrackets - closeBrackets);
    }

    return this.parse(repaired);
  }
}
