'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  CheckCheck,
  Minus,
  XCircle,
} from 'lucide-react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useFrequencyApprovals } from '@/lib/store/frequency-approvals-context';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';
import type { MonitoringCalendarEntry, TestHistoryEntry } from '@/types';

interface MonitoringCalendarProps {
  modelId: string;
  entries: MonitoringCalendarEntry[];
}

const STATUS_ICON = {
  Current: CheckCircle2,
  Due: Clock,
  Overdue: AlertTriangle,
};

const STATUS_COLOR = {
  Current: 'var(--status-pass)',
  Due: 'var(--status-warn)',
  Overdue: 'var(--status-fail)',
};

function HistoryDot({ entry }: { entry: TestHistoryEntry }) {
  const Icon =
    entry.verdict === 'pass' ? CheckCheck : entry.verdict === 'warn' ? AlertTriangle : XCircle;
  const color =
    entry.verdict === 'pass'
      ? 'var(--status-pass)'
      : entry.verdict === 'warn'
        ? 'var(--status-warn)'
        : 'var(--status-fail)';
  return (
    <span
      title={`${entry.period}: ${entry.verdict}`}
      aria-label={`${entry.period}: ${entry.verdict}`}
    >
      <Icon className="h-3 w-3 shrink-0" style={{ color }} aria-hidden="true" />
    </span>
  );
}

export function MonitoringCalendar({ modelId, entries }: MonitoringCalendarProps) {
  const { getApprovedFrequency, hasPendingRequest } = useFrequencyApprovals();

  if (entries.length === 0) {
    return (
      <SurfaceCard title="Monitoring Calendar">
        <p className="text-small text-ink-muted">No scheduled tests for this model.</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard title="Monitoring Calendar" noPadding>
      <div className="overflow-auto">
        <table className="w-full text-small text-ink" aria-label="Monitoring calendar">
          <thead
            className="sticky top-0 bg-surface"
            style={{ borderBottom: '1px solid var(--border-hairline)' }}
          >
            <tr>
              {[
                'Test',
                'SR Ref',
                'Frequency',
                'Threshold',
                'Last Run',
                'Next Due',
                'Status',
                'History',
                '',
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-left text-caption font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const StatusIcon = STATUS_ICON[entry.status];
              const statusColor = STATUS_COLOR[entry.status];
              const approvedFreq = getApprovedFrequency(modelId, entry.testType);
              const isPending = hasPendingRequest(modelId, entry.testType);
              const displayFreq = approvedFreq ?? entry.frequency;

              return (
                <tr
                  key={entry.testType}
                  className="border-t transition-colors hover:bg-[var(--canvas)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                    {TEST_LABELS[entry.testType]}
                  </td>
                  <td className="px-4 py-3 font-mono text-caption text-ink-muted">{entry.srRef}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                    {displayFreq}
                    {isPending && (
                      <span
                        className="ml-1.5 rounded px-1.5 py-0.5 text-caption"
                        style={{
                          backgroundColor: 'var(--status-warn-bg)',
                          color: 'var(--status-warn)',
                        }}
                      >
                        pending change
                      </span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-secondary">
                    {entry.thresholdText}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">
                    {entry.lastRun ?? '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{entry.nextDue}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-small font-medium"
                      style={{ color: statusColor }}
                    >
                      <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {entry.historyDots.length === 0 ? (
                        <Minus className="h-3 w-3 text-ink-muted" aria-hidden="true" />
                      ) : (
                        entry.historyDots
                          .slice(-5)
                          .map((dot, j) => <HistoryDot key={j} entry={dot} />)
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/workbench?model=${modelId}&test=${entry.testType}`}
                      className="inline-flex items-center gap-1 rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                      aria-label={`Run ${TEST_LABELS[entry.testType]} in workbench`}
                    >
                      Run
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
