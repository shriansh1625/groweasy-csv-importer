'use client';

import { useCallback, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Copy, Download, Search } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@groweasy/ui';
import type { CrmRecord, FieldConfidence } from '@groweasy/shared';
import { CRM_FIELD_NAMES } from '@groweasy/shared';

const DISPLAY_FIELDS = ['fullName', 'email', 'phone', 'company', 'leadOwner', 'crmStatus', 'dataSource'] as const;

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function confidenceVariant(confidence: number): 'success' | 'warning' | 'error' | 'default' {
  if (confidence > 90) return 'success';
  if (confidence >= 70) return 'warning';
  if (confidence >= 40) return 'default';
  return 'error';
}

function FieldCell({ field }: { field: FieldConfidence }) {
  if (field.value === null || field.level === 'blank') {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="truncate">{field.value}</span>
      <Badge variant={confidenceVariant(field.confidence)}>{String(field.confidence)}</Badge>
    </div>
  );
}

export function CrmDataGrid({ records, importId }: { records: CrmRecord[]; importId?: string }) {
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const filtered = records.filter((record) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return DISPLAY_FIELDS.some((f) => record[f].value?.toLowerCase().includes(q));
  });

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const exportCsv = useCallback(() => {
    const headers = [...DISPLAY_FIELDS];
    const lines = [headers.join(',')];
    for (const record of filtered) {
      lines.push(headers.map((f) => escapeCsvCell(record[f].value ?? '')).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = importId ? `${importId}-crm-export.csv` : 'crm-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported successfully', 'success');
  }, [filtered, addToast]);

  const copyValue = (value: string) => {
    void navigator.clipboard.writeText(value);
    addToast('Copied to clipboard', 'info');
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search CRM records"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div ref={parentRef} className="max-h-[480px] overflow-auto" role="region" aria-label="CRM records table">
        <Table bare>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900">#</TableHead>
              {DISPLAY_FIELDS.map((f) => (
                <TableHead key={f}>{f.replace(/([A-Z])/g, ' $1').trim()}</TableHead>
              ))}
              <TableHead>Copy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody style={{ height: `${String(virtualizer.getTotalSize())}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const record = filtered[virtualRow.index];
              if (!record) return null;
              const primaryValue = record.email.value ?? record.fullName.value ?? '';
              return (
                <TableRow
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${String(virtualRow.size)}px`,
                    transform: `translateY(${String(virtualRow.start)}px)`,
                  }}
                >
                  <TableCell className="sticky left-0 z-10 bg-white font-mono text-xs dark:bg-slate-900">
                    {virtualRow.index + 1}
                  </TableCell>
                  {DISPLAY_FIELDS.map((f) => (
                    <TableCell key={f} className="max-w-[180px]">
                      <FieldCell field={record[f]} />
                    </TableCell>
                  ))}
                  <TableCell>
                    {primaryValue && (
                      <button
                        type="button"
                        onClick={() => copyValue(primaryValue)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        aria-label="Copy primary value"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export function computeConfidenceAverage(records: CrmRecord[]): number {
  let total = 0;
  let count = 0;
  for (const record of records) {
    for (const field of CRM_FIELD_NAMES) {
      if (record[field].value !== null && record[field].confidence > 0) {
        total += record[field].confidence;
        count += 1;
      }
    }
  }
  return count > 0 ? Math.round(total / count) : 0;
}
