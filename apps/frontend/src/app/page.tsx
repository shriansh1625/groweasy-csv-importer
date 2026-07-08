import { TopNav } from '@/components/layout/TopNav';
import { FeatureHighlights, HeroSection } from '@/features/import/components/HeroSection';
import { ImportWorkflow } from '@/features/import/components/ImportWorkflow';

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <HeroSection />
        <FeatureHighlights />
        <ImportWorkflow />
      </main>
      <footer className="border-t border-slate-200 py-6 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} GrowEasy · Secure AI-powered CRM import
          </p>
        </div>
      </footer>
    </>
  );
}
