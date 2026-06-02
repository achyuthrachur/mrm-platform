'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import { POLICY_EXCEPTIONS, type PolicyException } from '@/lib/data/governance';
import { getStorageAdapter } from '@/lib/storage/factory';

const STATUS_COLOR: Record<PolicyException['status'], string> = {
  Active: 'var(--status-pass)',
  Expired: 'var(--status-fail)',
  'Pending Renewal': 'var(--status-warn)',
};

export function PolicyExceptions() {
  const [exceptions, setExceptions] = useState<PolicyException[]>([]);

  useEffect(() => {
    async function load() {
      const adapter = getStorageAdapter();
      const keys = await adapter.list('policy-exception:');
      if (keys.length === 0) {
        // First load — seed defaults into storage
        for (const e of POLICY_EXCEPTIONS) {
          await adapter.set(`policy-exception:${e.id}`, e);
        }
        setExceptions(POLICY_EXCEPTIONS);
      } else {
        const items = await Promise.all(keys.map((k) => adapter.get<PolicyException>(k)));
        setExceptions(items.filter((i): i is PolicyException => i !== null));
      }
    }
    load();
  }, []);

  async function handleRenew(id: string) {
    const adapter = getStorageAdapter();
    const renewed = exceptions.find((e) => e.id === id);
    if (!renewed) return;

    const updated: PolicyException = {
      ...renewed,
      status: 'Active',
      expiryDate: new Date(
        new Date(renewed.expiryDate).setFullYear(new Date(renewed.expiryDate).getFullYear() + 1)
      )
        .toISOString()
        .slice(0, 10),
    };

    await adapter.set(`policy-exception:${id}`, updated);
    setExceptions((prev) => prev.map((e) => (e.id === id ? updated : e)));
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
          <p className="text-small text-ink-muted">Loading exceptions…</p>
        )}
      </div>
    </SurfaceCard>
  );
}
