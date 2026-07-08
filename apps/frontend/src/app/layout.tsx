import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppProviders } from '@/providers/AppProviders';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrowEasy CSV Importer — AI-Powered CRM Data Import',
  description: 'Transform arbitrary CSV exports into validated CRM records with enterprise AI extraction.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
