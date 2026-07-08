import type { ReactNode } from 'react';

import { Button } from './Button.js';
import { Card } from './Card.js';
import { cn } from './utils/cn.js';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  children,
  className = '',
}: ErrorStateProps) {
  return (
    <Card
      className={cn('animate-shake border-red-200 dark:border-red-900/50', className)}
      padding="lg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{message}</p>
        {children && <div className="mt-4">{children}</div>}
        {onRetry && (
          <Button variant="outline" className="mt-6" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </Card>
  );
}
