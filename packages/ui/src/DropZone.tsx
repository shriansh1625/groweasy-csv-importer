'use client';

import type { DragEvent, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';

import { cn } from './utils/cn.js';

export interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onTextPaste?: (text: string) => void;
  accept?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function DropZone({
  onFileSelect,
  onTextPaste,
  accept = '.csv,text/csv',
  disabled = false,
  children,
  className = '',
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: DragEvent, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(dragging);
  }, [disabled]);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [disabled, onFileSelect],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text');
      if (text && onTextPaste) {
        onTextPaste(text);
      }
    },
    [onTextPaste],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file"
      aria-disabled={disabled}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => handleDrag(e, true)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
        'border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/30',
        'dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-brand-600 dark:hover:bg-brand-950/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        isDragging && 'scale-[1.01] border-brand-500 bg-brand-50 shadow-glow dark:bg-brand-950/30',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      {children}
    </div>
  );
}
