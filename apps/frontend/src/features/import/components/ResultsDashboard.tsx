'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Download, RefreshCw, SkipForward, Users } from 'lucide-react';
import { Badge, Button, Card, SectionHeader, useToast } from '@groweasy/ui';
import type { ExtractionPipelineResult } from '@groweasy/shared';

import { formatDuration } from '@/services/csv-parser.service';
import { downloadExport } from '@/services/extraction.service';
import { CrmDataGrid, computeConfidenceAverage } from './CrmDataGrid';

interface ResultsDashboardProps {
  result: ExtractionPipelineResult;
  onRetryFailed?: () => void;
}

const EXPORT_LABELS: Record<'crm-csv' | 'json' | 'skipped-csv' | 'warnings-csv' | 'report-json', string> = {
  'crm-csv': 'Export CRM CSV',
  json: 'Export JSON',
  'skipped-csv': 'Skipped rows',
  'warnings-csv': 'Warnings',
  'report-json': 'Full report',
};

export function ResultsDashboard({ result, onRetryFailed }: ResultsDashboardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { addToast } = useToast();
  const { metrics, records, warnings } = result;
  const confidenceAvg = computeConfidenceAverage(records);
  const hasRetryableRows = metrics.skippedRows > 0 || metrics.errors.length > 0;

  const summaryCards = [
    { label: 'Records imported', value: String(metrics.successfulRows), icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Skipped', value: String(metrics.skippedRows), icon: SkipForward, color: 'text-amber-600' },
    { label: 'Needs review', value: String(warnings.length), icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Processing time', value: formatDuration(metrics.processingDurationMs), icon: Clock, color: 'text-slate-600' },
    { label: 'Avg. confidence', value: `${String(confidenceAvg)}%`, icon: Users, color: 'text-brand-600' },
  ];

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  return (
    <motion.section {...motionProps}>
      <SectionHeader
        title="Import complete"
        description={`${String(metrics.successfulRows)} of ${String(metrics.totalRows)} rows mapped to CRM records`}
        action={
          <div className="flex flex-wrap gap-2">
            {onRetryFailed && hasRetryableRows && (
              <Button variant="outline" size="sm" onClick={onRetryFailed}>
                <RefreshCw className="h-4 w-4" />
                Retry failed rows
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            {...(prefersReducedMotion
              ? {}
              : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } })}
          >
            <Card hover padding="md" className="text-center">
              <card.icon className={`mx-auto mb-2 h-5 w-5 ${card.color}`} aria-hidden="true" />
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{card.value}</p>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(['crm-csv', 'json', 'skipped-csv', 'warnings-csv'] as const).map((format) => (
          <Button
            key={format}
            variant="outline"
            size="sm"
            onClick={() => {
              void downloadExport(result.importId, format).catch(() => {
                addToast(`Failed to download ${EXPORT_LABELS[format]}`, 'error');
              });
            }}
          >
            <Download className="h-4 w-4" />
            {EXPORT_LABELS[format]}
          </Button>
        ))}
      </div>

      <SectionHeader
        title="CRM Records"
        description={`${String(records.length)} leads ready for review`}
      />
      <CrmDataGrid records={records} importId={result.importId} />

      {warnings.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Review items" description={`${String(warnings.length)} fields flagged for attention`} />
          <Card padding="md">
            <ul className="max-h-48 space-y-2 overflow-auto" role="list">
              {warnings.slice(0, 20).map((w, i) => (
                <li key={`${w.code}-${String(i)}`} className="flex items-start gap-2 text-sm">
                  <Badge variant={w.severity === 'error' ? 'error' : 'warning'}>{w.code}</Badge>
                  <span className="text-slate-600 dark:text-slate-400">{w.message}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </motion.section>
  );
}
