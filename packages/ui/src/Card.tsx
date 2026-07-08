import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './utils/cn.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, hover = false, padding = 'md', className = '', ...props }: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-soft',
        'dark:border-slate-800 dark:bg-slate-900/80 dark:backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',
        paddingClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-50', className)}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)}>{children}</p>;
}
