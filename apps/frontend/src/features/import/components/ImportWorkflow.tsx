'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect } from 'react';
import { Button, ErrorState, LoadingState, useToast } from '@groweasy/ui';
import { ArrowRight, RefreshCw } from 'lucide-react';

import {
  fetchImportResult,
  mapJobProgressToStore,
  retryImport,
  startImport,
  subscribeToImportEvents,
} from '@/services/extraction.service';
import { useImportStore } from '@/stores/import.store';

import { SupportedSourcesBanner } from './SupportedSourcesBanner';
import { ImportProgressPanel } from './ImportProgressPanel';
import { UploadSection } from './UploadSection';

const CsvPreviewTable = dynamic(() => import('./CsvPreviewTable').then((m) => m.CsvPreviewTable), {
  loading: () => <LoadingState message="Loading preview..." />,
  ssr: false,
});

const ResultsDashboard = dynamic(() => import('./ResultsDashboard').then((m) => m.ResultsDashboard), {
  loading: () => <LoadingState message="Loading results..." />,
  ssr: false,
});

export function ImportWorkflow() {
  const {
    phase,
    csvContent,
    preview,
    progress,
    error,
    result,
    setPhase,
    setError,
    setProgress,
    setResult,
    setUnsubscribe,
    unsubscribe,
    reset,
  } = useImportStore();
  const { addToast } = useToast();

  useEffect(() => {
    return () => {
      unsubscribe?.();
    };
  }, [unsubscribe]);

  const handleProgressEvent = useCallback(
    (importId: string) => (event: import('@groweasy/shared').ImportProgressEvent) => {
      if (event.progress) {
        setProgress(mapJobProgressToStore(event.progress));
      }

      if (event.type === 'complete' && event.result) {
        setResult(event.result);
        addToast(`Successfully imported ${String(event.result.metrics.successfulRows)} records`, 'success');
      }

      if (event.type === 'error') {
        setError(event.error ?? 'Import failed');
        addToast(event.error ?? 'Import failed', 'error');
      }

      if (event.type === 'complete' && !event.result) {
        void fetchImportResult(importId)
          .then(setResult)
          .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch result'));
      }
    },
    [setProgress, setResult, setError, addToast],
  );

  const runImport = useCallback(async () => {
    if (!csvContent || !preview) return;

    unsubscribe?.();
    setPhase('processing');
    setProgress({ rowsTotal: preview.totalRows, rowsProcessed: 0, batchCurrent: 0, batchTotal: 0 });

    try {
      const { importId } = await startImport(csvContent);
      setProgress({ importId });

      const unsub = subscribeToImportEvents(importId, handleProgressEvent(importId), (err) => {
        setError(err.message);
      });
      setUnsubscribe(unsub);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setError(message);
      addToast(message, 'error');
    }
  }, [csvContent, preview, unsubscribe, setPhase, setProgress, setError, setResult, setUnsubscribe, handleProgressEvent, addToast]);

  const handleRetryFailed = useCallback(async () => {
    const importId = progress.importId ?? result?.importId;
    if (!importId) {
      void runImport();
      return;
    }

    unsubscribe?.();
    setPhase('processing');

    try {
      await retryImport(importId);
      const unsub = subscribeToImportEvents(importId, handleProgressEvent(importId), (err) => {
        setError(err.message);
      });
      setUnsubscribe(unsub);
      addToast('Retrying failed rows...', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Retry failed';
      setError(message);
      addToast(message, 'error');
    }
  }, [progress.importId, result, unsubscribe, setPhase, setError, setUnsubscribe, handleProgressEvent, runImport, addToast]);

  return (
    <div className="space-y-10">
      {phase === 'idle' && <SupportedSourcesBanner />}
      <UploadSection />

      {phase === 'ready' && preview && (
        <div className="space-y-8 animate-slide-up">
          <CsvPreviewTable />
          <div className="flex justify-center">
            <Button size="lg" onClick={() => void runImport()} className="min-w-[200px]">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
              Confirm import
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && <ImportProgressPanel />}

      {phase === 'error' && error && (
        <ErrorState
          title="Import failed"
          message={`${error} Your uploaded file is still available — you can retry without re-uploading.`}
          onRetry={() => void runImport()}
        />
      )}

      {phase === 'complete' && result && (
        <div className="space-y-8">
          <ResultsDashboard result={result} onRetryFailed={() => void handleRetryFailed()} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
