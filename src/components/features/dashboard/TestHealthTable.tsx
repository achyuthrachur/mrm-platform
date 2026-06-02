'use client';

import Link from 'next/link';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TierBadge } from '@/components/ui/TierBadge';
import { VerdictChip } from '@/components/ui/VerdictChip';
import type { Model, TestType, Verdict } from '@/types';
import { TEST_HISTORY } from '@/lib/data/test-history';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';

interface TestHealthTableProps {
  models: Model[];
}

function getLatestVerdict(modelId: string, testType: TestType): Verdict | null {
  const history = TEST_HISTORY.find((h) => h.modelId === modelId && h.testType === testType);
  if (!history || history.history.length === 0) return null;
  return history.history[history.history.length - 1].verdict;
}

export function TestHealthTable({ models }: TestHealthTableProps) {
  const modelsWithTests = models.filter((m) => m.selectedTests && m.selectedTests.length > 0);

  if (modelsWithTests.length === 0) {
    return (
      <SurfaceCard title="Test Health" eyebrow="Latest verdict per scheduled test">
        <p className="text-small text-ink-muted">No models with scheduled tests.</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard title="Test Health" eyebrow="Latest verdict per scheduled test">
      <div className="space-y-3">
        {modelsWithTests.map((model) => (
          <div
            key={model.id}
            className="flex items-start gap-4 border-t py-2"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {/* Model identity */}
            <div className="w-52 min-w-0 shrink-0">
              <div className="flex items-center gap-2">
                <TierBadge tier={model.tier} />
                <Link
                  href={`/inventory/${model.id}`}
                  className="truncate rounded text-small font-medium text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ink)]"
                  aria-label={`View ${model.name} detail`}
                >
                  {model.id}
                </Link>
              </div>
              <p className="mt-0.5 truncate text-caption text-ink-muted">{model.name}</p>
            </div>

            {/* Test chips */}
            <div className="flex flex-wrap gap-2">
              {(model.selectedTests ?? []).map((test) => {
                const verdict = getLatestVerdict(model.id, test.testType);
                return verdict ? (
                  <Link
                    key={test.testType}
                    href={`/workbench?model=${model.id}&test=${test.testType}`}
                    aria-label={`${TEST_LABELS[test.testType]}: ${verdict}`}
                    className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ink)]"
                  >
                    <VerdictChip verdict={verdict} size="sm" />
                  </Link>
                ) : (
                  <span
                    key={test.testType}
                    className="inline-flex items-center rounded px-2 py-0.5 text-caption"
                    style={{
                      backgroundColor: 'var(--canvas)',
                      color: 'var(--ink-muted)',
                      border: '1px dashed var(--border-hairline)',
                    }}
                    aria-label={`${TEST_LABELS[test.testType]}: not run`}
                    title={TEST_LABELS[test.testType]}
                  >
                    —
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
