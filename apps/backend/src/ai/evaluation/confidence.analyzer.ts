import type {
  ColumnSemanticMetadata,
  ConfidenceLevel,
  CrmFieldName,
  CrmRecord,
  FieldConfidence,
  RawExtractionRow,
} from '@groweasy/shared';
import { CRM_FIELD_NAMES } from '@groweasy/shared';

import { NormalizationEngine } from '../normalizers/preprocessing.engine.js';
import { isValidEmail } from '../normalizers/email.normalizer.js';
import { isValidPhone } from '../normalizers/phone.normalizer.js';

export class ConfidenceAnalyzer {
  private readonly normalizer = new NormalizationEngine();

  analyzeRow(
    rawRow: RawExtractionRow,
    headerContext: ColumnSemanticMetadata[],
  ): CrmRecord {
    const record = this.createEmptyRecord();

    for (const field of CRM_FIELD_NAMES) {
      const rawField = rawRow.fields[field];
      const headerMatch = headerContext.find((col) => col.semanticType === field);

      if (!rawField) {
        record[field] = this.buildField(null, 0, 'blank', headerMatch?.originalHeader);
        continue;
      }

      const normalized = this.normalizer.normalizeCrmFieldValue(field, rawField.value);
      let confidence = rawField.confidence ?? this.calculateHeuristicConfidence(field, normalized, headerMatch);

      confidence = this.adjustConfidenceForValidation(field, normalized, confidence);

      const level = this.confidenceToLevel(confidence);
      const finalValue = level === 'blank' ? null : normalized;

      record[field] = this.buildField(finalValue, confidence, level, headerMatch?.originalHeader);
    }

    return record;
  }

  private calculateHeuristicConfidence(
    field: CrmFieldName,
    value: string | null,
    headerMatch: ColumnSemanticMetadata | undefined,
  ): number {
    if (value === null) {
      return 0;
    }

    let confidence = 50;

    if (headerMatch && headerMatch.semanticType === field) {
      confidence = Math.max(confidence, headerMatch.confidence);
    }

    if (field === 'email' && isValidEmail(value)) {
      confidence = Math.max(confidence, 95);
    }

    if (field === 'phone' && isValidPhone(value)) {
      confidence = Math.max(confidence, 90);
    }

    if (value.length > 1) {
      confidence = Math.min(confidence + 10, 100);
    }

    return Math.min(confidence, 100);
  }

  private adjustConfidenceForValidation(
    field: CrmFieldName,
    value: string | null,
    confidence: number,
  ): number {
    if (value === null) {
      return 0;
    }

    if (field === 'email' && !isValidEmail(value)) {
      return Math.min(confidence, 35);
    }

    if (field === 'phone' && !isValidPhone(value)) {
      return Math.min(confidence, 35);
    }

    return confidence;
  }

  confidenceToLevel(confidence: number): ConfidenceLevel {
    if (confidence > 90) {
      return 'accept';
    }
    if (confidence >= 70) {
      return 'accept_with_warning';
    }
    if (confidence >= 40) {
      return 'flag';
    }
    return 'blank';
  }

  private buildField(
    value: string | null,
    confidence: number,
    level: ConfidenceLevel,
    sourceColumn?: string,
  ): FieldConfidence {
    const field: FieldConfidence = { value, confidence, level };
    if (sourceColumn !== undefined) {
      field.sourceColumn = sourceColumn;
    }
    if (level === 'accept_with_warning' || level === 'flag') {
      field.warnings = [`Confidence ${String(confidence)} requires review`];
    }
    return field;
  }

  private createEmptyRecord(): CrmRecord {
    const emptyField = (): FieldConfidence => ({
      value: null,
      confidence: 0,
      level: 'blank',
    });

    return {
      firstName: emptyField(),
      lastName: emptyField(),
      fullName: emptyField(),
      email: emptyField(),
      phone: emptyField(),
      phoneCountryCode: emptyField(),
      mobileWithoutCountryCode: emptyField(),
      company: emptyField(),
      title: emptyField(),
      city: emptyField(),
      state: emptyField(),
      country: emptyField(),
      zipCode: emptyField(),
      leadOwner: emptyField(),
      source: emptyField(),
      crmStatus: emptyField(),
      dataSource: emptyField(),
      notes: emptyField(),
    };
  }
}
