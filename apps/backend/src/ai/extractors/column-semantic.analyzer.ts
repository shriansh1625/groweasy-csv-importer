import type { ColumnSemanticMetadata, HeaderAnalysisResult } from '@groweasy/shared';

export class ColumnSemanticAnalyzer {
  enrich(analysis: HeaderAnalysisResult): HeaderAnalysisResult {
    const resolvedColumns = this.resolveConflicts(analysis.columns);

    return {
      ...analysis,
      columns: resolvedColumns,
      unusedColumns: resolvedColumns
        .filter((col) => col.semanticType === 'unknown')
        .map((col) => col.originalHeader),
    };
  }

  private resolveConflicts(columns: ColumnSemanticMetadata[]): ColumnSemanticMetadata[] {
    const fieldOwners = new Map<string, ColumnSemanticMetadata>();

    for (const col of columns) {
      if (col.semanticType === 'unknown') {
        continue;
      }

      const existing = fieldOwners.get(col.semanticType);
      if (!existing || col.confidence > existing.confidence) {
        if (existing) {
          existing.semanticType = 'unknown';
          existing.confidence = 0;
          existing.matchReason = `Demoted: higher confidence match for ${col.semanticType}`;
        }
        fieldOwners.set(col.semanticType, col);
      } else {
        col.semanticType = 'unknown';
        col.confidence = 0;
        col.matchReason = `Conflict: ${col.semanticType} already mapped with higher confidence`;
      }
    }

    return columns;
  }

  getActiveColumns(columns: ColumnSemanticMetadata[]): ColumnSemanticMetadata[] {
    return columns.filter((col) => col.semanticType !== 'unknown' && col.confidence >= 70);
  }
}
