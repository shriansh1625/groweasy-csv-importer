import type { CrmFieldName, ValidationWarning } from '@groweasy/shared';
import { CRM_FIELD_NAMES, CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '@groweasy/shared';

import { isValidDate } from '../normalizers/date.normalizer.js';
import { isValidEmail } from '../normalizers/email.normalizer.js';
import { isValidPhone } from '../normalizers/phone.normalizer.js';

export class FieldValidator {
  validateField(field: CrmFieldName, value: string | null): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (value === null || value.trim().length === 0) {
      return warnings;
    }

    switch (field) {
      case 'email':
        if (!isValidEmail(value)) {
          warnings.push({
            code: 'INVALID_EMAIL',
            message: `Invalid email format: ${value}`,
            field,
            severity: 'warning',
          });
        }
        break;
      case 'phone':
        if (!isValidPhone(value)) {
          warnings.push({
            code: 'INVALID_PHONE',
            message: `Invalid phone format: ${value}`,
            field,
            severity: 'warning',
          });
        }
        break;
      default:
        break;
    }

    if (field === 'crmStatus' && value !== null) {
      if (!(CRM_STATUS_VALUES as readonly string[]).includes(value)) {
        warnings.push({
          code: 'INVALID_CRM_STATUS',
          message: `crmStatus must be one of: ${CRM_STATUS_VALUES.join(', ')}`,
          field,
          severity: 'warning',
        });
      }
    }

    if (field === 'dataSource' && value !== null) {
      if (!(DATA_SOURCE_VALUES as readonly string[]).includes(value)) {
        warnings.push({
          code: 'INVALID_DATA_SOURCE',
          message: `dataSource must be one of: ${DATA_SOURCE_VALUES.join(', ')}`,
          field,
          severity: 'warning',
        });
      }
    }

    return warnings;
  }

  validateEnum(field: CrmFieldName, value: unknown): ValidationWarning[] {
    if (!CRM_FIELD_NAMES.includes(field as CrmFieldName)) {
      return [
        {
          code: 'INVALID_FIELD_NAME',
          message: `Unknown CRM field: ${field}`,
          field,
          severity: 'error',
        },
      ];
    }
    return [];
  }

  validateDate(value: string | null): ValidationWarning[] {
    if (value === null || value.trim().length === 0) {
      return [];
    }
    if (!isValidDate(value)) {
      return [
        {
          code: 'INVALID_DATE',
          message: `Invalid date format: ${value}`,
          severity: 'warning',
        },
      ];
    }
    return [];
  }
}
