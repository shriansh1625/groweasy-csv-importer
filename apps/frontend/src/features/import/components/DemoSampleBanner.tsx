'use client';

import { FileSpreadsheet } from 'lucide-react';
import { Card } from '@groweasy/ui';

const RECOMMENDED = [
  { file: '01-facebook-leads-standard.csv', label: 'Facebook Leads' },
  { file: '08-broken-headers-typos.csv', label: 'Broken Headers' },
  { file: '12-unicode-emoji.csv', label: 'Unicode & Emoji' },
  { file: '26-large-dataset-200-rows.csv', label: '200 Rows' },
];

export function DemoSampleBanner() {
  return (
    <Card padding="md" className="border-dashed border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
            <FileSpreadsheet className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Try a demo CSV</p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              26 sample files in <code className="rounded bg-white/80 px-1 py-0.5 dark:bg-slate-800">demo/csvs/</code>{' '}
              — no API key needed in mock mode
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDED.map((sample) => (
            <span
              key={sample.file}
              className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300"
              title={sample.file}
            >
              {sample.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
