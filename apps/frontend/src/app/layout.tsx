import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppProviders } from '@/providers/AppProviders';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrowEasy Import — CRM Lead Import',
  description: 'Import lead data from any CSV export into structured GrowEasy CRM records.',
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
