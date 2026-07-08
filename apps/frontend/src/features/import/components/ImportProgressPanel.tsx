'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, Progress } from '@groweasy/ui';

import { useImportStore } from '@/stores/import.store';

export function ImportProgressPanel() {
  const progress = useImportStore((s) => s.progress);
  const prefersReducedMotion = useReducedMotion();

  const pct =
    progress.batchTotal > 0
      ? Math.round((progress.batchCurrent / progress.batchTotal) * 100)
      : progress.rowsTotal > 0
        ? Math.round((progress.rowsProcessed / progress.rowsTotal) * 100)
        : 5;

  const rowsRemaining = Math.max(0, progress.rowsTotal - progress.rowsProcessed);
  const estSecondsRemaining =
    progress.rowsPerSecond && progress.rowsPerSecond > 0
      ? Math.ceil(rowsRemaining / progress.rowsPerSecond)
      : undefined;

  return (
    <motion.div
      {...(prefersReducedMotion ? {} : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } })}
      aria-live="polite"
      aria-busy="true"
    >
      <Card className="border-brand-200 dark:border-brand-900/50">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Extracting CRM data</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{progress.stageLabel || 'Preparing...'}</p>
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>

        <Progress value={pct} label="Import progress" size="lg" className="mb-6" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Rows processed" value={`${String(progress.rowsProcessed)} / ${String(progress.rowsTotal)}`} />
          {estSecondsRemaining !== undefined ? (
            <Stat label="Rows remaining" value={String(rowsRemaining)} sub={`~${String(estSecondsRemaining)}s left`} />
          ) : (
            <Stat label="Rows remaining" value={String(rowsRemaining)} />
          )}
          <Stat label="Current stage" value={progress.stageLabel || 'Analyzing columns'} />
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
