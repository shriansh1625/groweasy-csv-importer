'use client';

import { Building2, Globe, Megaphone, Table2 } from 'lucide-react';
import { Card } from '@groweasy/ui';

const SOURCES = [
  { icon: Megaphone, label: 'Facebook Lead Ads' },
  { icon: Globe, label: 'Google Ads' },
  { icon: Table2, label: 'Excel & Sheets' },
  { icon: Building2, label: 'CRM Exports' },
];

export function SupportedSourcesBanner() {
  return (
    <Card padding="md" className="border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Works with any lead export format
          </p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            Upload CSVs from ad platforms, spreadsheets, or CRM systems — column names do not need to match.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((source) => (
            <span
              key={source.label}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <source.icon className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              {source.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
