import type { CrmRecord } from '@groweasy/shared';

export class PostProcessor {
  process(records: CrmRecord[]): CrmRecord[] {
    return records.map((record) => this.processRecord(record));
  }

  private processRecord(record: CrmRecord): CrmRecord {
    const processed = { ...record };

    if (processed.fullName.value && !processed.firstName.value && !processed.lastName.value) {
      const parts = processed.fullName.value.split(' ');
      if (parts.length >= 2) {
        processed.firstName = {
          ...processed.firstName,
          value: parts[0] ?? null,
          confidence: Math.min(processed.fullName.confidence, 85),
          level: processed.fullName.level,
        };
        processed.lastName = {
          ...processed.lastName,
          value: parts.slice(1).join(' '),
          confidence: Math.min(processed.fullName.confidence, 85),
          level: processed.fullName.level,
        };
      }
    }

    for (const key of Object.keys(processed) as (keyof CrmRecord)[]) {
      const field = processed[key];
      if (field.level === 'blank') {
        processed[key] = { ...field, value: null, confidence: 0 };
      }
    }

    return processed;
  }
}
