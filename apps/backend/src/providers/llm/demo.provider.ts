import type { CrmFieldName, LLMCompletionRequest, LLMCompletionResponse } from '@groweasy/shared';
import { CRM_FIELD_NAMES, LLM_FIELD_ALIASES } from '@groweasy/shared';

import type { LLMProvider } from './types.js';

interface PromptPayload {
  rowsToProcess?: Record<string, string>[];
  columnSemantics?: Array<{ header: string; mapsTo: string; matchConfidence?: number }>;
}

const HEADER_GUESSES: Array<{ pattern: RegExp; field: CrmFieldName }> = [
  { pattern: /^(full[\s_]?name|name|contact[\s_]?name|lead[\s_]?name|nmae|nombre)$/i, field: 'fullName' },
  { pattern: /^first[\s_]?name$/i, field: 'firstName' },
  { pattern: /^last[\s_]?name$/i, field: 'lastName' },
  { pattern: /^(e[\s-]?mail|email[\s_]?address|emial|correo)$/i, field: 'email' },
  { pattern: /^(phone|mobile|cell|tel|telephone|phone[\s_]?number|phne|telefono|telefone)$/i, field: 'phone' },
  { pattern: /^(company|organization|business|employer|compny|empresa|empresa)$/i, field: 'company' },
  { pattern: /^(title|job[\s_]?title|role|position)$/i, field: 'title' },
  { pattern: /^(city|town)$/i, field: 'city' },
  { pattern: /^(state|province|region)$/i, field: 'state' },
  { pattern: /^(country|nation)$/i, field: 'country' },
  { pattern: /^(zip|zip[\s_]?code|postal|postcode)$/i, field: 'zipCode' },
  { pattern: /^(owner|lead[\s_]?owner|assigned[\s_]?to|sales[\s_]?rep)$/i, field: 'leadOwner' },
  { pattern: /^(source|lead[\s_]?source|campaign|utm[\s_]?source)$/i, field: 'source' },
  { pattern: /^(status|crm[\s_]?status|lead[\s_]?status|statu|estado)$/i, field: 'crmStatus' },
  { pattern: /^(data[\s_]?source|project|property)$/i, field: 'dataSource' },
  { pattern: /^(notes?|comments?|remarks?|notas)$/i, field: 'notes' },
];

function isCrmField(value: string): value is CrmFieldName {
  return (CRM_FIELD_NAMES as readonly string[]).includes(value);
}

function resolveField(header: string, semantic: string | undefined): CrmFieldName | null {
  if (semantic && semantic !== 'unknown' && isCrmField(semantic)) {
    return semantic;
  }

  const normalized = header.trim().toLowerCase().replace(/\s+/g, '_');
  const alias = LLM_FIELD_ALIASES[normalized];
  if (alias) return alias;

  for (const guess of HEADER_GUESSES) {
    if (guess.pattern.test(header.trim())) return guess.field;
  }

  return null;
}

function confidenceFor(field: CrmFieldName, semanticConfidence?: number): number {
  if (semanticConfidence !== undefined && semanticConfidence > 0) {
    return Math.min(98, Math.max(70, Math.round(semanticConfidence)));
  }
  return field === 'email' || field === 'phone' ? 88 : 82;
}

/**
 * Heuristic LLM provider for local demo and CI validation.
 * Parses the structured prompt payload and maps rows using column semantics.
 */
export class DemoLLMProvider implements LLMProvider {
  readonly name = 'anthropic';
  readonly model = 'demo-heuristic-v1';

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const content = this.buildResponse(request.prompt);
    return {
      content,
      model: this.model,
      inputTokens: Math.ceil(request.prompt.length / 4),
      outputTokens: Math.ceil(content.length / 4),
      finishReason: 'stop',
    };
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens + outputTokens) * 0.000001;
  }

  private buildResponse(prompt: string): string {
    let payload: PromptPayload;
    try {
      payload = JSON.parse(prompt) as PromptPayload;
    } catch {
      return JSON.stringify({ records: [], skipped: [], warnings: [], metadata: { mode: 'demo' } });
    }

    const rows = payload.rowsToProcess ?? [];
    const semantics = new Map(
      (payload.columnSemantics ?? []).map((col) => [col.header, col]),
    );

    const records: Array<{ rowIndex: number; fields: Record<string, { value: string; confidence: number }> }> =
      [];
    const skipped: Array<{ rowIndex: number; reason: string }> = [];

    for (const row of rows) {
      const rowIndex = Number.parseInt(row._rowIndex ?? '0', 10);
      const values = Object.entries(row).filter(([key]) => key !== '_rowIndex' && row[key]?.trim());

      if (values.length === 0) {
        skipped.push({ rowIndex, reason: 'Empty row' });
        continue;
      }

      const fields: Record<string, { value: string; confidence: number }> = {};

      for (const [header, value] of values) {
        const semantic = semantics.get(header);
        const field = resolveField(header, semantic?.mapsTo);
        if (!field || !value.trim()) continue;

        fields[field] = {
          value: value.trim(),
          confidence: confidenceFor(field, semantic?.matchConfidence),
        };
      }

      const hasIdentifier = fields.fullName || fields.email || fields.phone || fields.firstName;
      if (!hasIdentifier) {
        skipped.push({ rowIndex, reason: 'No identifiable contact fields' });
        continue;
      }

      records.push({ rowIndex, fields });
    }

    return JSON.stringify({
      records,
      skipped,
      warnings: [],
      metadata: { mode: 'demo', processedRows: records.length },
    });
  }
}
