'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { Badge, Card, Input, SectionHeader, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@groweasy/ui';

import { CRM_FIELD_LABELS } from '@/services/csv-parser.service';
import { useImportStore } from '@/stores/import.store';

type SortDir = 'asc' | 'desc';

function mappingForHeader(
  header: string,
  headerAnalysis: ReturnType<typeof useImportStore.getState>['headerAnalysis'],
) {
  const column = headerAnalysis?.columns.find((c) => c.originalHeader === header);
  if (!column || column.semanticType === 'unknown') return null;
  return {
    label: CRM_FIELD_LABELS[column.semanticType] ?? column.semanticType,
    confidence: column.confidence,
  };
}

function CsvPreviewTableInner() {
  const preview = useImportStore((s) => s.preview);
  const headerAnalysis = useImportStore((s) => s.headerAnalysis);
  const detectedDelimiter = useImportStore((s) => s.detectedDelimiter);
  const totalRowCount = useImportStore((s) => s.totalRowCount);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredRows = useMemo(() => {
    if (!preview) return [];
    let rows = preview.rows;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => Object.values(row).some((v) => v?.toLowerCase().includes(q)));
    }

    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [preview, search, sortCol, sortDir]);

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  if (!preview || preview.headers.length === 0) return null;

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const mappedCount =
    headerAnalysis?.columns.filter((c) => c.semanticType !== 'unknown').length ?? 0;

  return (
    <section aria-labelledby="preview-heading" className="animate-slide-up">
      <SectionHeader
        id="preview-heading"
        title="Data preview"
        description={`Review ${String(totalRowCount)} rows before import${detectedDelimiter ? ` · ${detectedDelimiter} delimiter` : ''}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{String(preview.headers.length)} columns</Badge>
            {headerAnalysis && (
              <Badge variant="brand">{String(mappedCount)} mapped to CRM</Badge>
            )}
          </div>
        }
      />

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              placeholder="Search rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search CSV preview"
            />
          </div>
        </div>

        <div ref={parentRef} className="max-h-[400px] overflow-auto" role="region" aria-label="CSV data preview table">
          <Table bare>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900">#</TableHead>
                {preview.headers.map((header) => {
                  const mapping = mappingForHeader(header, headerAnalysis);
                  return (
                    <TableHead key={header} className="min-w-[140px]">
                      <button
                        type="button"
                        onClick={() => toggleSort(header)}
                        className="flex w-full flex-col items-start gap-1 text-left hover:text-brand-600"
                        aria-label={`Sort by ${header}`}
                      >
                        <span className="truncate font-medium">{header}</span>
                        {mapping && (
                          <Badge variant={mapping.confidence >= 80 ? 'success' : 'warning'} className="text-[10px]">
                            → {mapping.label} ({String(mapping.confidence)}%)
                          </Badge>
                        )}
                        {sortCol === header && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody
              style={{ height: `${String(virtualizer.getTotalSize())}px`, position: 'relative' }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = filteredRows[virtualRow.index];
                if (!row) return null;
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
                    {preview.headers.map((header) => (
                      <TableCell key={header} className="max-w-[200px] truncate font-mono text-xs">
                        {row[header] ?? ''}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  );
}

export const CsvPreviewTable = memo(CsvPreviewTableInner);
