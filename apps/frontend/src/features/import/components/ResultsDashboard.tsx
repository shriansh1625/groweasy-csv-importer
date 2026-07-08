'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Clock, DollarSign, Download, RefreshCw, SkipForward, Sparkles, Zap } from 'lucide-react';
import { Badge, Button, Card, SectionHeader, useToast } from '@groweasy/ui';
import type { ExtractionPipelineResult } from '@groweasy/shared';
import { useState } from 'react';

import { formatCurrency, formatDuration } from '@/services/csv-parser.service';
import { downloadExport } from '@/services/extraction.service';
import { CrmDataGrid, computeConfidenceAverage } from './CrmDataGrid';

interface ResultsDashboardProps {
  result: ExtractionPipelineResult;
  onRetryFailed?: () => void;
}

export function ResultsDashboard({ result, onRetryFailed }: ResultsDashboardProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { addToast } = useToast();
  const { metrics, records, warnings } = result;
  const confidenceAvg = computeConfidenceAverage(records);
  const hasRetryableRows = metrics.skippedRows > 0 || metrics.errors.length > 0;

  const summaryCards = [
    { label: 'Imported', value: String(metrics.successfulRows), icon: Sparkles, color: 'text-brand-600' },
    { label: 'Skipped', value: String(metrics.skippedRows), icon: SkipForward, color: 'text-amber-600' },
    { label: 'Warnings', value: String(warnings.length), icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Duration', value: formatDuration(metrics.processingDurationMs), icon: Clock, color: 'text-slate-600' },
    { label: 'Est. Cost', value: formatCurrency(metrics.estimatedCostUsd), icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Confidence', value: `${String(confidenceAvg)}%`, icon: Sparkles, color: 'text-brand-600' },
  ];

  const performanceCards = [
    metrics.rowsPerSecond !== undefined && { label: 'Throughput', value: `${String(metrics.rowsPerSecond)} rows/s`, icon: Zap },
    metrics.averageBatchLatencyMs !== undefined && { label: 'Avg Batch', value: formatDuration(metrics.averageBatchLatencyMs), icon: Clock },
    metrics.successPercent !== undefined && { label: 'Success', value: `${String(metrics.successPercent)}%`, icon: Sparkles },
    metrics.skippedPercent !== undefined && { label: 'Skipped %', value: `${String(metrics.skippedPercent)}%`, icon: SkipForward },
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Sparkles }>;

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  return (
    <motion.section {...motionProps}>
      <SectionHeader
        title="Import complete"
        description={`Processed ${String(metrics.totalRows)} rows with ${metrics.provider} · Prompt ${metrics.promptVersion}`}
        action={
          <div className="flex flex-wrap gap-2">
            {onRetryFailed && hasRetryableRows && (
              <Button variant="outline" size="sm" onClick={onRetryFailed}>
                <RefreshCw className="h-4 w-4" />
                Retry failed
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {performanceCards.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceCards.map((card) => (
            <Card key={card.label} padding="md" className="text-center">
              <card.icon className="mx-auto mb-2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="brand">{metrics.provider}</Badge>
        <Badge variant="info">{metrics.model}</Badge>
        <Badge variant="default">Prompt {metrics.promptVersion}</Badge>
        {metrics.retries > 0 && <Badge variant="warning">{String(metrics.retries)} retries</Badge>}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(['crm-csv', 'json', 'skipped-csv', 'warnings-csv', 'report-json'] as const).map((format) => (
          <Button
            key={format}
            variant="outline"
            size="sm"
            onClick={() => {
              void downloadExport(result.importId, format).catch(() => {
                addToast(`Failed to download ${format}`, 'error');
              });
            }}
          >
            <Download className="h-4 w-4" />
            {format.replace('-', ' ')}
          </Button>
        ))}
      </div>

      <SectionHeader title="CRM Records" description={`${String(records.length)} records extracted with confidence scores`} />
      <CrmDataGrid records={records} importId={result.importId} />

      {warnings.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Warnings" description={`${String(warnings.length)} items need review`} />
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

      <button
        type="button"
        onClick={() => setShowMetadata(!showMetadata)}
        className="mt-6 flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        aria-expanded={showMetadata}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${showMetadata ? 'rotate-180' : ''}`} />
        {showMetadata ? 'Hide' : 'Show'} metadata
      </button>

      {showMetadata && (
        <Card className="mt-4" padding="md">
          <pre className="overflow-auto text-xs text-slate-600 dark:text-slate-400">
            {JSON.stringify({ importId: result.importId, metrics, headerAnalysis: result.headerAnalysis }, null, 2)}
          </pre>
        </Card>
      )}
    </motion.section>
  );
}
