'use client';

import { User, Bot, Settings } from 'lucide-react';
import type { AuditEntry } from '@/types';

interface AuditTrailProps {
  entries: AuditEntry[];
}

const ACTOR_ICON = {
  human: User,
  ai: Bot,
  system: Settings,
};

const ACTOR_COLOR = {
  human: 'var(--status-info)',
  ai: 'var(--status-warn)',
  system: 'var(--ink-muted)',
};

export function AuditTrail({ entries }: AuditTrailProps) {
  if (entries.length === 0) {
    return <p className="text-small text-ink-muted">No audit entries yet.</p>;
  }

  return (
    <ol className="relative space-y-4 pl-6" aria-label="Audit trail timeline">
      {/* Vertical line */}
      <span
        className="absolute bottom-2 left-2.5 top-2 w-px"
        style={{ backgroundColor: 'var(--border-hairline)' }}
        aria-hidden="true"
      />

      {entries.map((entry, i) => {
        const Icon = ACTOR_ICON[entry.actorType];
        const color = ACTOR_COLOR[entry.actorType];
        const date = entry.ts.slice(0, 10);
        const time = entry.ts.slice(11, 16);

        return (
          <li key={i} className="relative flex gap-3">
            {/* Actor dot */}
            <span
              className="absolute -left-3.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--surface)', border: `2px solid ${color}` }}
              aria-hidden="true"
            >
              <Icon className="h-2.5 w-2.5" style={{ color }} aria-hidden="true" />
            </span>

            {/* Content */}
            <div
              className="min-w-0 flex-1 rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--canvas)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-small font-medium text-ink">{entry.action}</p>
                <span className="shrink-0 text-caption tabular-nums text-ink-muted">
                  {date} {time}
                </span>
              </div>
              <p className="mt-0.5 text-caption text-ink-muted">
                {entry.actor} <span className="capitalize">({entry.actorType})</span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
