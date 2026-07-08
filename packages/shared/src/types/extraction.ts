import type { LLMProviderName } from './index.js';

export type CrmFieldName =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'phoneCountryCode'
  | 'mobileWithoutCountryCode'
  | 'company'
  | 'title'
  | 'city'
  | 'state'
  | 'country'
  | 'zipCode'
  | 'leadOwner'
  | 'source'
  | 'crmStatus'
  | 'dataSource'
  | 'notes';

export type CrmStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

export type ConfidenceLevel = 'accept' | 'accept_with_warning' | 'flag' | 'blank';

export interface FieldConfidence {
  value: string | null;
  confidence: number;
  level: ConfidenceLevel;
  sourceColumn?: string;
  warnings?: string[];
}

export interface CrmRecord {
  firstName: FieldConfidence;
  lastName: FieldConfidence;
  fullName: FieldConfidence;
  email: FieldConfidence;
  phone: FieldConfidence;
  phoneCountryCode: FieldConfidence;
  mobileWithoutCountryCode: FieldConfidence;
  company: FieldConfidence;
  title: FieldConfidence;
  city: FieldConfidence;
  state: FieldConfidence;
  country: FieldConfidence;
  zipCode: FieldConfidence;
  leadOwner: FieldConfidence;
  source: FieldConfidence;
  crmStatus: FieldConfidence;
  dataSource: FieldConfidence;
  notes: FieldConfidence;
}

export type SemanticFieldType = CrmFieldName | 'unknown';

export interface ColumnSemanticMetadata {
  originalHeader: string;
  normalizedHeader: string;
  semanticType: SemanticFieldType;
  confidence: number;
  matchReason: string;
}

export interface HeaderAnalysisResult {
  columns: ColumnSemanticMetadata[];
  duplicateHeaders: string[];
  emptyColumns: string[];
  unusedColumns: string[];
}

export interface ParsedCsvData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  duplicateRowIndices: number[];
  duplicateHeaders?: string[];
}

export interface NormalizedCsvData extends ParsedCsvData {
  headerAnalysis: HeaderAnalysisResult;
  normalizedRows: Record<string, string>[];
}

export interface BatchMetadata {
  batchId: string;
  rowCount: number;
  estimatedTokens: number;
  estimatedCost: number;
  provider: LLMProviderName;
  model: string;
  rowIndices: number[];
}

export interface ExtractionBatch {
  metadata: BatchMetadata;
  rows: Record<string, string>[];
  headerContext: ColumnSemanticMetadata[];
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  rowIndex?: number;
  severity: 'info' | 'warning' | 'error';
}

export interface RawExtractionRow {
  rowIndex: number;
  fields: Partial<Record<CrmFieldName, { value: string | null; confidence?: number }>>;
}

export interface ImportMetrics {
  importId: string;
  promptVersion: string;
  model: string;
  provider: LLMProviderName;
  startTime: string;
  endTime: string;
  processingDurationMs: number;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  retries: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
  warnings: ValidationWarning[];
  errors: ValidationWarning[];
  rowsPerSecond?: number;
  averageBatchLatencyMs?: number;
  successPercent?: number;
  skippedPercent?: number;
}

export interface ExtractionPipelineResult {
  importId: string;
  records: CrmRecord[];
  metrics: ImportMetrics;
  headerAnalysis: HeaderAnalysisResult;
  warnings: ValidationWarning[];
}

export interface PipelineContext {
  importId: string;
  promptVersion: string;
  provider: LLMProviderName;
  model: string;
}
