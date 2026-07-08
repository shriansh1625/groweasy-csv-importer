import type { CrmFieldName, CrmRecord, RawExtractionRow, ValidationWarning } from '@groweasy/shared';
import {
  CRM_FIELD_NAMES,
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  rawExtractionResponseSchema,
} from '@groweasy/shared';

import { FieldValidator } from './field.validator.js';
import { normalizeLlmFields } from './field-mapper.js';
import { JsonValidator } from './json.validator.js';

export class CrmSchemaValidator {
  validateRecord(record: CrmRecord): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    for (const field of CRM_FIELD_NAMES) {
      const fieldData = record[field];
      if (fieldData.confidence > 0 && (fieldData.value === null || fieldData.value.trim().length === 0)) {
        warnings.push({
          code: 'CONFIDENCE_VALUE_MISMATCH',
          message: `Field ${field} has confidence ${String(fieldData.confidence)} but empty value`,
          field,
          severity: 'warning',
        });
      }
    }

    const hasContact =
      record.email.value !== null ||
      record.phone.value !== null ||
      record.fullName.value !== null;

    if (!hasContact) {
      warnings.push({
        code: 'MISSING_IDENTIFIER',
        message: 'Record has no name, email, or phone',
        severity: 'warning',
      });
    }

    return warnings;
  }
}

export interface ValidatedExtractionResponse {
  rows: RawExtractionRow[];
  warnings: ValidationWarning[];
  skippedCount: number;
}

export class ResponseValidator {
  private readonly jsonValidator = new JsonValidator();
  private readonly fieldValidator = new FieldValidator();
  private readonly crmValidator = new CrmSchemaValidator();

  validateRawResponse(content: string): ValidatedExtractionResponse {
    const warnings: ValidationWarning[] = [];

    let parseResult = this.jsonValidator.parse(content);
    warnings.push(...parseResult.warnings);

    if (!parseResult.success) {
      parseResult = this.jsonValidator.repair(content);
      warnings.push(...parseResult.warnings);
      if (parseResult.success) {
        warnings.push({
          code: 'JSON_REPAIRED',
          message: 'JSON was successfully repaired',
          severity: 'info',
        });
      } else {
        return { rows: [], warnings, skippedCount: 0 };
      }
    }

    const schemaResult = rawExtractionResponseSchema.safeParse(parseResult.data);
    if (!schemaResult.success) {
      warnings.push({
        code: 'SCHEMA_VALIDATION_ERROR',
        message: 'Response does not match extraction schema',
        severity: 'error',
      });
      return { rows: [], warnings, skippedCount: 0 };
    }

    const data = schemaResult.data;
    const isEnterpriseFormat = 'records' in data;
    const rawRows = isEnterpriseFormat ? data.records : data.rows;
    let skippedCount = 0;

    if (isEnterpriseFormat) {
      skippedCount = data.skipped.length;
      for (const skip of data.skipped) {
        warnings.push({
          code: 'ROW_SKIPPED',
          message: skip.reason,
          rowIndex: skip.rowIndex,
          severity: 'warning',
        });
      }
      for (const w of data.warnings) {
        const warning: ValidationWarning = {
          code: w.code,
          message: w.message,
          severity: 'warning',
        };
        if (w.rowIndex !== undefined) {
          warning.rowIndex = w.rowIndex;
        }
        if (w.field !== undefined) {
          warning.field = w.field;
        }
        warnings.push(warning);
      }
    }

    const validatedRows: RawExtractionRow[] = [];

    for (const row of rawRows) {
      const normalizedFields = normalizeLlmFields(row.fields);
      const rowWarnings: ValidationWarning[] = [];

      for (const [field, fieldData] of Object.entries(normalizedFields)) {
        rowWarnings.push(...this.fieldValidator.validateEnum(field as CrmFieldName, field));
        if (fieldData?.value !== null && fieldData?.value !== undefined) {
          rowWarnings.push(
            ...this.fieldValidator.validateField(field as CrmFieldName, fieldData.value),
          );
        }
      }

      if (normalizedFields.crmStatus?.value) {
        if (!(CRM_STATUS_VALUES as readonly string[]).includes(normalizedFields.crmStatus.value)) {
          rowWarnings.push({
            code: 'INVALID_CRM_STATUS',
            message: `Invalid crmStatus: ${normalizedFields.crmStatus.value}`,
            field: 'crmStatus',
            rowIndex: row.rowIndex,
            severity: 'warning',
          });
        }
      }

      if (normalizedFields.dataSource?.value) {
        if (!(DATA_SOURCE_VALUES as readonly string[]).includes(normalizedFields.dataSource.value)) {
          rowWarnings.push({
            code: 'INVALID_DATA_SOURCE',
            message: `Invalid dataSource: ${normalizedFields.dataSource.value}`,
            field: 'dataSource',
            rowIndex: row.rowIndex,
            severity: 'warning',
          });
        }
      }

      warnings.push(...rowWarnings.map((w) => ({ ...w, rowIndex: row.rowIndex })));
      validatedRows.push({
        rowIndex: row.rowIndex,
        fields: normalizedFields as RawExtractionRow['fields'],
      });
    }

    return { rows: validatedRows, warnings, skippedCount };
  }

  detectDuplicates(records: CrmRecord[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const emailSeen = new Map<string, number>();
    const phoneSeen = new Map<string, number>();

    records.forEach((record, index) => {
      if (record.email.value) {
        const existing = emailSeen.get(record.email.value);
        if (existing !== undefined) {
          warnings.push({
            code: 'DUPLICATE_EMAIL',
            message: `Duplicate email ${record.email.value} at rows ${String(existing)} and ${String(index)}`,
            field: 'email',
            rowIndex: index,
            severity: 'warning',
          });
        } else {
          emailSeen.set(record.email.value, index);
        }
      }

      if (record.phone.value) {
        const existing = phoneSeen.get(record.phone.value);
        if (existing !== undefined) {
          warnings.push({
            code: 'DUPLICATE_PHONE',
            message: `Duplicate phone ${record.phone.value} at rows ${String(existing)} and ${String(index)}`,
            field: 'phone',
            rowIndex: index,
            severity: 'warning',
          });
        } else {
          phoneSeen.set(record.phone.value, index);
        }
      }
    });

    return warnings;
  }

  validateCrmRecords(records: CrmRecord[]): ValidationWarning[] {
    return records.flatMap((record) => this.crmValidator.validateRecord(record));
  }
}
