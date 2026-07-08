import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './utils/cn.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
  children: ReactNode;
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status, label }: { status: 'online' | 'offline' | 'processing'; label: string }) {
  const colors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    processing: 'bg-brand-500 animate-pulse',
  };

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900">
      <span className={cn('h-2 w-2 rounded-full', colors[status])} aria-hidden="true" />
      {label}
    </span>
  );
}
