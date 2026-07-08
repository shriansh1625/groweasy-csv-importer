'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusChip, ThemeToggle } from '@groweasy/ui';

import { APP_NAME, GITHUB_URL } from '@/config/app';
import { fetchHealthStatus } from '@/services/extraction.service';

export function TopNav() {
  const [status, setStatus] = useState<'online' | 'offline' | 'processing'>('processing');

  useEffect(() => {
    fetchHealthStatus().then(setStatus).catch(() => setStatus('offline'));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-soft">
            G
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-50">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <StatusChip
            status={status === 'online' ? 'online' : status === 'offline' ? 'offline' : 'processing'}
            label={status === 'online' ? 'API Online' : status === 'offline' ? 'API Offline' : 'Checking...'}
          />
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
            aria-label="View on GitHub"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
