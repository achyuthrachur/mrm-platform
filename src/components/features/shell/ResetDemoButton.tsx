'use client';

import { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { resetDemoData } from '@/lib/storage/reset';
import { Button } from '@/components/ui/Button';

export function ResetDemoButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleReset() {
    setIsResetting(true);
    try {
      await resetDemoData();
      toast.success('Demo data reset — reload the page to see the fresh state');
      setShowConfirm(false);
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error('Reset failed');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        aria-label="Reset demo data"
      >
        Reset demo
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConfirm(false)}
            aria-hidden="true"
          />
          <div
            className="relative mx-4 w-full max-w-sm rounded-card p-6 shadow-card-lg"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="mb-3 flex items-center gap-3">
              <AlertTriangle
                className="h-5 w-5 shrink-0"
                style={{ color: 'var(--status-warn)' }}
                aria-hidden="true"
              />
              <h2 id="reset-dialog-title" className="text-h3 font-semibold text-ink">
                Reset Demo Data?
              </h2>
            </div>
            <p className="mb-5 text-small text-ink-secondary">
              This will delete all user-created models, findings, runs, and flag state — restoring
              the app to its seeded state. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isResetting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReset} loading={isResetting}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset Demo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
