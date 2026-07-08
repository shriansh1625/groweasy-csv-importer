'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusChip, ThemeToggle } from '@groweasy/ui';

import { APP_NAME } from '@/config/app';
import { fetchHealthStatus } from '@/services/extraction.service';

export function TopNav() {
  const [status, setStatus] = useState<'online' | 'offline' | 'processing'>('processing');

  useEffect(() => {
    fetchHealthStatus().then(setStatus).catch(() => setStatus('offline'));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-sm">
            G
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-50">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <StatusChip
            status={status === 'online' ? 'online' : status === 'offline' ? 'offline' : 'processing'}
            label={status === 'online' ? 'Connected' : status === 'offline' ? 'Unavailable' : 'Connecting...'}
          />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
