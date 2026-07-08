import type { CSSProperties, ReactNode } from 'react';

import { cn } from './utils/cn.js';

export interface TableProps {
  children: ReactNode;
  className?: string;
  /** Skip outer scroll wrapper — use when parent handles scrolling (e.g. virtualized rows). */
  bare?: boolean;
}

export function Table({ children, className = '', bare = false }: TableProps) {
  const table = <table className="w-full min-w-full caption-bottom text-sm">{children}</table>;
  if (bare) return table;
  return (
    <div className={cn('w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-800', className)}>
      {table}
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800', className)} style={style}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <tr
      className={cn('transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50', className)}
      style={style}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 align-middle text-slate-700 dark:text-slate-300', className)}>{children}</td>
  );
}
