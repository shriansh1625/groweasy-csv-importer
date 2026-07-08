import type { ReactNode } from 'react';

import { cn } from './utils/cn.js';

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg',
          'bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          'dark:bg-slate-100 dark:text-slate-900',
        )}
      >
        {content}
      </span>
    </span>
  );
}

export function SectionHeader({
  id,
  title,
  description,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2
          id={id}
          className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
