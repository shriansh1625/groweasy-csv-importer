import { cn } from './utils/cn.js';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({ value, max = 100, label, showValue = true, size = 'md', className = '' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && (
            <span className="tabular-nums text-slate-500 dark:text-slate-400">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', heights[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500 ease-out',
            heights[size],
          )}
          style={{ width: `${String(pct)}%` }}
        />
      </div>
    </div>
  );
}
