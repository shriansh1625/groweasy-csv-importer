import { create } from 'zustand';

import type { ExtractionPipelineResult, HeaderAnalysisResult } from '@groweasy/shared';

import type { ParsedCsvPreview } from '@/services/csv-parser.service';

export type ImportPhase = 'idle' | 'ready' | 'processing' | 'complete' | 'error';

export interface ImportProgress {
  importId: string | null;
  stageLabel: string;
  rowsProcessed: number;
  rowsTotal: number;
  batchCurrent: number;
  batchTotal: number;
  estimatedTokens: number;
  estimatedCostUsd: number;
  provider: string;
  model: string;
  retries: number;
  rowsPerSecond?: number;
  averageBatchLatencyMs?: number;
  successPercent?: number;
  skippedPercent?: number;
}

interface ImportState {
  phase: ImportPhase;
  fileName: string | null;
  fileSize: number | null;
  csvContent: string | null;
  preview: ParsedCsvPreview | null;
  headerAnalysis: HeaderAnalysisResult | null;
  detectedDelimiter: string | null;
  totalRowCount: number;
  error: string | null;
  progress: ImportProgress;
  result: ExtractionPipelineResult | null;
  unsubscribe: (() => void) | null;

  setFile: (
    name: string,
    size: number,
    content: string,
    preview: ParsedCsvPreview,
    totalRows: number,
    analysis?: { headerAnalysis: HeaderAnalysisResult; delimiter: string },
  ) => void;
  clearFile: () => void;
  setPhase: (phase: ImportPhase) => void;
  setError: (error: string) => void;
  setProgress: (progress: Partial<ImportProgress>) => void;
  setResult: (result: ExtractionPipelineResult) => void;
  setUnsubscribe: (fn: (() => void) | null) => void;
  reset: () => void;
}

const initialProgress: ImportProgress = {
  importId: null,
  stageLabel: '',
  rowsProcessed: 0,
  rowsTotal: 0,
  batchCurrent: 0,
  batchTotal: 1,
  estimatedTokens: 0,
  estimatedCostUsd: 0,
  provider: '',
  model: '',
  retries: 0,
};

export const useImportStore = create<ImportState>((set, get) => ({
  phase: 'idle',
  fileName: null,
  fileSize: null,
  csvContent: null,
  preview: null,
  headerAnalysis: null,
  detectedDelimiter: null,
  totalRowCount: 0,
  error: null,
  progress: initialProgress,
  result: null,
  unsubscribe: null,

  setFile: (name, size, content, preview, totalRows, analysis) =>
    set({
      phase: 'ready',
      fileName: name,
      fileSize: size,
      csvContent: content,
      preview,
      headerAnalysis: analysis?.headerAnalysis ?? null,
      detectedDelimiter: analysis?.delimiter ?? preview.delimiter,
      totalRowCount: totalRows,
      error: null,
      result: null,
    }),

  clearFile: () => {
    get().unsubscribe?.();
    set({
      phase: 'idle',
      fileName: null,
      fileSize: null,
      csvContent: null,
      preview: null,
      headerAnalysis: null,
      detectedDelimiter: null,
      totalRowCount: 0,
      error: null,
      result: null,
      progress: initialProgress,
      unsubscribe: null,
    });
  },

  setPhase: (phase) => set({ phase }),
  setError: (error) => set({ phase: 'error', error }),
  setProgress: (progress) => set((s) => ({ progress: { ...s.progress, ...progress } })),
  setResult: (result) => set({ phase: 'complete', result }),
  setUnsubscribe: (fn) => set({ unsubscribe: fn }),

  reset: () => {
    get().unsubscribe?.();
    set({
      phase: 'idle',
      fileName: null,
      fileSize: null,
      csvContent: null,
      preview: null,
      headerAnalysis: null,
      detectedDelimiter: null,
      totalRowCount: 0,
      error: null,
      progress: initialProgress,
      result: null,
      unsubscribe: null,
    });
  },
}));
