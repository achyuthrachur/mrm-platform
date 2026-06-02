'use client';

import { useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import { VerdictChip } from '@/components/ui/VerdictChip';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useRunStore } from '@/lib/store/run-store';
import type { TestType, TestRun } from '@/types';

interface RunHistoryProps {
  modelId: string;
  testType: TestType;
  selectedRunId?: string;
  onSelectRun?: (run: TestRun) => void;
}

function keyMetric(run: TestRun): string {
  const m = run.result.metrics[0];
  if (!m) return run.result.verdict;
  return `${m.label}: ${m.value}`;
}

export function RunHistory({ modelId, testType, selectedRunId, onSelectRun }: RunHistoryProps) {
  const { getRunHistory, loadRunHistory } = useRunStore();

  useEffect(() => {
    loadRunHistory(modelId);
  }, [modelId, loadRunHistory]);

  const history = getRunHistory(modelId, testType);

  if (history.length === 0) {
    return (
      <SurfaceCard title="Run History" eyebrow={`${modelId} · ${testType}`}>
        <p className="py-4 text-center text-small text-ink-muted">No runs yet.</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard title="Run History" eyebrow={`${modelId} · ${testType}`} noPadding>
      <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-hairline)' }}>
        <p className="text-caption text-ink-muted">
          {history.length} run{history.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ul className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
        {history.map((run) => {
          const isSelected = run.id === selectedRunId;
          return (
            <li key={run.id}>
              <button
                onClick={() => onSelectRun?.(run)}
                className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                  isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'
                }`}
                style={
                  isSelected
                    ? { borderLeft: '3px solid var(--accent)' }
                    : { borderLeft: '3px solid transparent' }
                }
                aria-pressed={isSelected}
                aria-label={`Run from ${run.runAt}: ${run.result.verdict}`}
              >
                <VerdictChip verdict={run.result.verdict} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-medium text-ink">{keyMetric(run)}</p>
                  <div className="mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-caption text-ink-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {run.runAt.slice(0, 16).replace('T', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-caption text-ink-muted">
                      <User className="h-3 w-3" aria-hidden="true" />
                      {run.runBy}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </SurfaceCard>
  );
}
