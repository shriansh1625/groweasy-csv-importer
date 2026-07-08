'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  DropZone,
  SectionHeader,
  useToast,
} from '@groweasy/ui';

import {
  countCsvRows,
  formatBytes,
  parseCsvPreview,
} from '@/services/csv-parser.service';
import { useImportStore } from '@/stores/import.store';
import { PREVIEW_ROW_LIMIT, MAX_UPLOAD_SIZE_BYTES } from '@/config/app';

export function UploadSection() {
  const { phase, fileName, fileSize, preview, totalRowCount, setFile, clearFile } = useImportStore();
  const { addToast } = useToast();

  const handleContent = useCallback(
    (content: string, name: string, size: number) => {
      if (!content.trim()) return;
      const previewData = parseCsvPreview(content, PREVIEW_ROW_LIMIT);
      const totalRows = countCsvRows(content);
      setFile(name, size, content, previewData, totalRows);
    },
    [setFile],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        addToast(`File exceeds ${String(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))}MB limit`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        addToast('Failed to read file', 'error');
      };
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleContent(content, file.name, file.size);
      };
      reader.readAsText(file);
    },
    [handleContent, addToast],
  );

  if (phase !== 'idle' && fileName) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <FileSpreadsheet className="h-6 w-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{fileName}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {fileSize !== null ? formatBytes(fileSize) : ''} · {String(totalRowCount)} rows ·{' '}
                {String(preview?.headers.length ?? 0)} columns
              </p>
            </div>
          </div>
          {phase === 'ready' && (
            <div className="flex gap-2">
              <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-600 dark:hover:bg-slate-800">
                Replace
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
              <Button variant="ghost" size="sm" onClick={clearFile} aria-label="Remove file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {preview && preview.errors.length > 0 && (
          <Alert variant="warning" title="Parse warnings" className="mt-4">
            {preview.errors.slice(0, 3).join('; ')}
          </Alert>
        )}
      </Card>
    );
  }

  return (
    <section aria-labelledby="upload-heading">
      <SectionHeader
        id="upload-heading"
        title="Upload CSV"
        description="Drag and drop, browse, or paste your lead export to preview and import into CRM."
      />
      <DropZone onFileSelect={handleFile} onTextPaste={(text) => handleContent(text, 'pasted.csv', text.length)}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
            <Upload className="h-7 w-7 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Drop your CSV here or click to browse
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            CSV files up to 10MB · Paste with Ctrl+V
          </p>
        </motion.div>
      </DropZone>
    </section>
  );
}
