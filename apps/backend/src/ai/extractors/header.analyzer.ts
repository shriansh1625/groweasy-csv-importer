import type { ColumnSemanticMetadata, CrmFieldName, HeaderAnalysisResult } from '@groweasy/shared';

import { normalizeHeader } from '../normalizers/text.normalizer.js';

interface SemanticPattern {
  field: CrmFieldName;
  patterns: RegExp[];
  weight: number;
}

const SEMANTIC_PATTERNS: SemanticPattern[] = [
  { field: 'email', patterns: [/e-?mail/, /\bmail\b/, /email.?address/], weight: 95 },
  { field: 'phone', patterns: [/phone/, /mobile/, /contact.?number/, /whatsapp/, /\btel\b/, /cell/], weight: 90 },
  { field: 'fullName', patterns: [/^name$/, /full.?name/, /contact.?name/, /customer.?name/], weight: 92 },
  { field: 'firstName', patterns: [/first.?name/, /given.?name/, /\bfname\b/], weight: 95 },
  { field: 'lastName', patterns: [/last.?name/, /surname/, /family.?name/, /\blname\b/], weight: 95 },
  { field: 'company', patterns: [/company/, /organization/, /business/, /employer/, /firm/], weight: 90 },
  { field: 'title', patterns: [/title/, /job.?title/, /position/, /role/], weight: 88 },
  { field: 'city', patterns: [/^city$/, /town/, /municipality/], weight: 90 },
  { field: 'state', patterns: [/state/, /province/, /region/], weight: 88 },
  { field: 'country', patterns: [/country/, /nation/], weight: 90 },
  { field: 'zipCode', patterns: [/zip/, /postal/, /post.?code/, /pincode/], weight: 90 },
  { field: 'leadOwner', patterns: [/sales.?rep/, /owner/, /assigned/, /account.?manager/, /agent/, /relationship.?manager/], weight: 88 },
  { field: 'crmStatus', patterns: [/status/, /disposition/, /pipeline/, /stage/, /lead.?status/], weight: 88 },
  { field: 'dataSource', patterns: [/data.?source/, /project/, /property/, /campaign/], weight: 85 },
  { field: 'source', patterns: [/source/, /lead.?source/, /channel/, /origin/], weight: 85 },
  { field: 'notes', patterns: [/notes?/, /comments?/, /description/, /remarks/], weight: 80 },
];

export class HeaderAnalyzer {
  analyze(headers: string[]): HeaderAnalysisResult {
    const columns: ColumnSemanticMetadata[] = [];
    const normalizedSeen = new Map<string, string>();
    const duplicateHeaders: string[] = [];
    const emptyColumns: string[] = [];

    for (const header of headers) {
      const normalized = normalizeHeader(header);

      if (header.trim().length === 0) {
        emptyColumns.push(header);
        continue;
      }

      if (normalizedSeen.has(normalized)) {
        duplicateHeaders.push(header);
      } else {
        normalizedSeen.set(normalized, header);
      }

      const match = this.matchSemanticType(normalized);
      columns.push({
        originalHeader: header,
        normalizedHeader: normalized,
        semanticType: match.field,
        confidence: match.confidence,
        matchReason: match.reason,
      });
    }

    const unusedColumns = columns
      .filter((col) => col.semanticType === 'unknown')
      .map((col) => col.originalHeader);

    return { columns, duplicateHeaders, emptyColumns, unusedColumns };
  }

  private matchSemanticType(normalizedHeader: string): {
    field: CrmFieldName | 'unknown';
    confidence: number;
    reason: string;
  } {
    let bestMatch: { field: CrmFieldName | 'unknown'; confidence: number; reason: string } = {
      field: 'unknown',
      confidence: 0,
      reason: 'No semantic match found',
    };

    for (const pattern of SEMANTIC_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(normalizedHeader)) {
          const confidence = pattern.weight;
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              field: pattern.field,
              confidence,
              reason: `Matched pattern ${regex.source} → ${pattern.field}`,
            };
          }
        }
      }
    }

    return bestMatch;
  }
}
