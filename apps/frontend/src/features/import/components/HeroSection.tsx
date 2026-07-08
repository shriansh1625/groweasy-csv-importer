'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Columns3, ShieldCheck } from 'lucide-react';

const capabilities = [
  {
    icon: Columns3,
    title: 'Smart column mapping',
    description: 'Automatically maps varied headers to standard CRM fields.',
  },
  {
    icon: ShieldCheck,
    title: 'Validated output',
    description: 'Confidence scoring flags uncertain fields for review.',
  },
  {
    icon: CheckCircle2,
    title: 'CRM-ready records',
    description: 'Exports structured data aligned with GrowEasy CRM format.',
  },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

  return (
    <section className="pb-8 pt-10 lg:pt-12" aria-labelledby="hero-heading">
      <motion.div {...motionProps} className="max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
          GrowEasy CRM Import
        </p>
        <h1
          id="hero-heading"
          className="text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl lg:text-5xl"
        >
          Turn any CSV into structured CRM leads
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-base text-slate-600 dark:text-slate-400 sm:text-lg">
          Import lead data from ad platforms, spreadsheets, and agency exports. AI extracts names, contact
          details, and CRM fields — even when column names are inconsistent.
        </p>
      </motion.div>
    </section>
  );
}

export function FeatureHighlights() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="pb-10" aria-label="Capabilities">
      <div className="grid gap-4 sm:grid-cols-3">
        {capabilities.map((item, i) => (
          <motion.div
            key={item.title}
            {...(prefersReducedMotion
              ? {}
              : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08 } })}
            className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
              <item.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
