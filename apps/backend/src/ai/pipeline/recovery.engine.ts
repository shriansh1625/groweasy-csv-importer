import type { ExtractionBatch, RawExtractionRow, ValidationWarning } from '@groweasy/shared';

import type { LLMProvider } from '../../providers/llm/types.js';
import { PromptRegistry, type PromptVersion } from '../prompts/PromptRegistry.js';
import { ResponseValidator } from '../validators/response.validator.js';

export interface RecoveryResult {
  rows: RawExtractionRow[];
  warnings: ValidationWarning[];
  retries: number;
}

export class RecoveryEngine {
  private readonly responseValidator = new ResponseValidator();

  async extractWithRecovery(
    batch: ExtractionBatch,
    provider: LLMProvider,
    promptVersion: PromptVersion,
    maxRetries: number,
  ): Promise<RecoveryResult> {
    const warnings: ValidationWarning[] = [];
    let retries = 0;

    const template = PromptRegistry.get(promptVersion);
    const prompt = template.buildExtractionPrompt(batch.rows, batch.headerContext);

    let response = await provider.complete({
      prompt,
      systemPrompt: PromptRegistry.getSystemPrompt(promptVersion),
      temperature: 0,
    });

    let validation = this.responseValidator.validateRawResponse(response.content);

    if (validation.rows.length === 0 && maxRetries > 0) {
      retries += 1;
      warnings.push({
        code: 'EXTRACTION_RETRY',
        message: `Retrying batch ${batch.metadata.batchId} after invalid JSON`,
        severity: 'warning',
      });

      response = await provider.complete({
        prompt,
        systemPrompt: PromptRegistry.getSystemPrompt(promptVersion),
        temperature: 0,
      });

      validation = this.responseValidator.validateRawResponse(response.content);
    }

    warnings.push(...validation.warnings);

    if (validation.rows.length === 0) {
      warnings.push({
        code: 'BATCH_EXTRACTION_FAILED',
        message: `Batch ${batch.metadata.batchId} could not be extracted after recovery`,
        severity: 'error',
      });
      return { rows: [], warnings, retries };
    }

    const failedIndices = this.findFailedRowIndices(batch, validation.rows);

    if (failedIndices.length > 0 && failedIndices.length < batch.rows.length) {
      const failedRows = failedIndices
        .map((idx) => batch.rows[idx])
        .filter((row): row is Record<string, string> => row !== undefined);

      if (failedRows.length > 0) {
        retries += 1;
        warnings.push({
          code: 'PARTIAL_RE_EXTRACTION',
          message: `Re-extracting ${String(failedRows.length)} failed rows from batch ${batch.metadata.batchId}`,
          severity: 'info',
        });

        const rePrompt = template.buildExtractionPrompt(failedRows, batch.headerContext);
        const reResponse = await provider.complete({
          prompt: rePrompt,
          systemPrompt: PromptRegistry.getSystemPrompt(promptVersion),
          temperature: 0,
        });

        const reValidation = this.responseValidator.validateRawResponse(reResponse.content);
        warnings.push(...reValidation.warnings);

        const mergedRows = this.mergeRows(validation.rows, reValidation.rows, failedIndices);
        return { rows: mergedRows, warnings, retries };
      }
    }

    return { rows: validation.rows, warnings, retries };
  }

  private findFailedRowIndices(
    batch: ExtractionBatch,
    extractedRows: RawExtractionRow[],
  ): number[] {
    const extractedIndices = new Set(extractedRows.map((r) => r.rowIndex));
    return batch.metadata.rowIndices.filter((idx) => !extractedIndices.has(idx));
  }

  private mergeRows(
    successful: RawExtractionRow[],
    recovered: RawExtractionRow[],
    failedIndices: number[],
  ): RawExtractionRow[] {
    const merged = new Map<number, RawExtractionRow>();

    for (const row of successful) {
      merged.set(row.rowIndex, row);
    }

    for (let i = 0; i < recovered.length; i++) {
      const targetIndex = failedIndices[i];
      const recoveredRow = recovered[i];
      if (targetIndex !== undefined && recoveredRow) {
        merged.set(targetIndex, { ...recoveredRow, rowIndex: targetIndex });
      }
    }

    return [...merged.values()].sort((a, b) => a.rowIndex - b.rowIndex);
  }
}
