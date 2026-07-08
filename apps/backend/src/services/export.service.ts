import type { CrmRecord, ExtractionPipelineResult, ExportFormat } from '@groweasy/shared';
import { CRM_FIELD_NAMES } from '@groweasy/shared';

function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordsToCsv(records: CrmRecord[], fields = [...CRM_FIELD_NAMES]): string {
  const headers = fields;
  const lines = [headers.join(',')];

  for (const record of records) {
    lines.push(
      headers
        .map((f) => escapeCsvField(record[f].value ?? ''))
        .join(','),
    );
  }

  return lines.join('\n');
}

function recordsToJson(result: ExtractionPipelineResult): string {
  return JSON.stringify(result, null, 2);
}

function warningsToCsv(result: ExtractionPipelineResult): string {
  const lines = ['code,severity,message,field,rowIndex'];
  for (const w of result.warnings) {
    lines.push(
      [w.code, w.severity, w.message, w.field ?? '', w.rowIndex !== undefined ? String(w.rowIndex) : ''].map(escapeCsvField).join(','),
    );
  }
  return lines.join('\n');
}

function buildReport(result: ExtractionPipelineResult): string {
  return JSON.stringify(
    {
      importId: result.importId,
      summary: {
        totalRows: result.metrics.totalRows,
        successfulRows: result.metrics.successfulRows,
        skippedRows: result.metrics.skippedRows,
        retries: result.metrics.retries,
        durationMs: result.metrics.processingDurationMs,
        rowsPerSecond: result.metrics.rowsPerSecond,
        averageBatchLatencyMs: result.metrics.averageBatchLatencyMs,
        successPercent: result.metrics.successPercent,
        skippedPercent: result.metrics.skippedPercent,
        estimatedCostUsd: result.metrics.estimatedCostUsd,
        provider: result.metrics.provider,
        model: result.metrics.model,
        promptVersion: result.metrics.promptVersion,
      },
      warnings: result.warnings,
      headerAnalysis: result.headerAnalysis,
    },
    null,
    2,
  );
}

export function exportResult(result: ExtractionPipelineResult, format: ExportFormat): { content: string; mimeType: string; filename: string } {
  const base = result.importId;

  switch (format) {
    case 'crm-csv':
      return { content: recordsToCsv(result.records), mimeType: 'text/csv', filename: `${base}-crm.csv` };
    case 'json':
      return { content: recordsToJson(result), mimeType: 'application/json', filename: `${base}-results.json` };
    case 'skipped-csv': {
      const skipped = result.records.filter((r) => r.email.value === null && r.fullName.value === null);
      return { content: recordsToCsv(skipped), mimeType: 'text/csv', filename: `${base}-skipped.csv` };
    }
    case 'warnings-csv':
      return { content: warningsToCsv(result), mimeType: 'text/csv', filename: `${base}-warnings.csv` };
    case 'report-json':
      return { content: buildReport(result), mimeType: 'application/json', filename: `${base}-report.json` };
    default:
      return { content: recordsToCsv(result.records), mimeType: 'text/csv', filename: `${base}-crm.csv` };
  }
}
