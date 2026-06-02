'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import { POLICY_EXCEPTIONS, type PolicyException } from '@/lib/data/governance';

const STATUS_COLOR: Record<PolicyException['status'], string> = {
  Active: 'var(--status-pass)',
  Expired: 'var(--status-fail)',
  'Pending Renewal': 'var(--status-warn)',
};

export function PolicyExceptions() {
  const [exceptions, setExceptions] = useState(POLICY_EXCEPTIONS);

  function handleRenew(id: string) {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'Active' as const,
              expiryDate: new Date(
                new Date(e.expiryDate).setFullYear(new Date(e.expiryDate).getFullYear() + 1)
              )
                .toISOString()
                .slice(0, 10),
            }
          : e
      )
    );
    toast.success('Policy exception renewed for 12 months');
  }

  return (
    <SurfaceCard title="Policy Exception Log" eyebrow="Active Exceptions">
      <div className="space-y-3">
        {exceptions.map((exc) => (
          <div
            key={exc.id}
            className="space-y-2 rounded-md border p-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="font-mono text-caption text-ink-muted">{exc.id}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-caption font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLOR[exc.status]}20`,
                      color: STATUS_COLOR[exc.status],
                    }}
                  >
                    {exc.status}
                  </span>
                </div>
                <p className="text-small font-semibold text-ink">{exc.title}</p>
                <p className="mt-0.5 text-caption text-ink-muted">
                  {exc.modelName} · Approved by {exc.approvedBy} · Expires {exc.expiryDate}
                </p>
              </div>
              {exc.status !== 'Active' && (
                <Button variant="secondary" size="sm" onClick={() => handleRenew(exc.id)}>
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Renew
                </Button>
              )}
            </div>
            <p className="text-small text-ink-secondary">{exc.rationale}</p>
          </div>
        ))}
        {exceptions.length === 0 && (
          <p className="text-small text-ink-muted">No active policy exceptions.</p>
        )}
      </div>
    </SurfaceCard>
  );
}
