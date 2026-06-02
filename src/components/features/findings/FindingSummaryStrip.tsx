'use client';

import type { Finding } from '@/types';

interface FindingSummaryStripProps {
  findings: Finding[];
}

export function FindingSummaryStrip({ findings }: FindingSummaryStripProps) {
  const open = findings.filter((f) => f.status === 'Open').length;
  const inRem = findings.filter((f) => f.status === 'In Remediation').length;
  const closed = findings.filter((f) => f.status === 'Closed').length;
  const critical = findings.filter((f) => f.sev === 'Critical' && f.status !== 'Closed').length;
  const high = findings.filter((f) => f.sev === 'High' && f.status !== 'Closed').length;
  const flagged = findings.filter((f) => f.flaggedForReview).length;

  const tiles = [
    { label: 'Open', value: open, color: 'var(--status-fail)' },
    { label: 'In Remediation', value: inRem, color: 'var(--status-warn)' },
    { label: 'Closed', value: closed, color: 'var(--status-pass)' },
    { label: 'Critical', value: critical, color: 'var(--status-fail)' },
    { label: 'High', value: high, color: 'var(--status-warn)' },
    { label: 'Flagged', value: flagged, color: 'var(--status-warn)' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Findings summary">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-card bg-surface p-3 text-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p
            className="text-h2 font-bold tabular-nums leading-none"
            style={{ color: tile.value > 0 ? tile.color : 'var(--ink-muted)' }}
          >
            {tile.value}
          </p>
          <p className="mt-1 text-caption text-ink-muted">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
