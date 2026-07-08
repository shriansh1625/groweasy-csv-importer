import { TopNav } from '@/components/layout/TopNav';
import { FeatureHighlights, HeroSection } from '@/features/import/components/HeroSection';
import { ImportWorkflow } from '@/features/import/components/ImportWorkflow';

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <HeroSection />
        <FeatureHighlights />
        <ImportWorkflow />
      </main>
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">GrowEasy CSV Importer</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Demo CSVs in <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">demo/csvs/</code> · Reviewer
            guide in <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">docs/ReviewerGuide.md</code>
          </p>
        </div>
      </footer>
    </>
  );
}
