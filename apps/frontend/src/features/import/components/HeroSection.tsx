'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Extraction',
    description: 'Enterprise prompt engineering maps messy CSV columns to structured CRM fields with confidence scores.',
  },
  {
    icon: Shield,
    title: 'Accuracy First',
    description: 'Wrong data is worse than missing data. Low-confidence fields are flagged or left blank.',
  },
  {
    icon: Zap,
    title: 'Production Pipeline',
    description: 'Multi-stage extraction with header intelligence, adaptive batching, and full observability.',
  },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <section className="py-12 text-center lg:py-16" aria-labelledby="hero-heading">
      <motion.div {...motionProps}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          Production-grade CSV → CRM pipeline
        </div>

        <h1
          id="hero-heading"
          className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl"
        >
          Import CSV data into{' '}
          <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
            CRM records
          </span>{' '}
          with AI
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-400">
          Upload any CSV export — Facebook leads, Google Ads, Excel sheets, or agency CRMs. Our extraction engine
          transforms arbitrary data into validated CRM records.
        </p>
      </motion.div>
    </section>
  );
}

export function FeatureHighlights() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="pb-12" aria-label="Feature highlights">
      <div className="grid gap-6 sm:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            {...(prefersReducedMotion
              ? {}
              : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 + i * 0.1 } })}
            className="rounded-2xl border border-slate-200/80 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <feature.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
