'use client';

import { Calendar, Users, FileText } from 'lucide-react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { MRM_COMMITTEE } from '@/lib/data/governance';

export function MRMCommittee() {
  return (
    <SurfaceCard title="MRM Committee" eyebrow="Model Risk Committee">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div
            className="flex items-center gap-2 rounded-md p-3"
            style={{ backgroundColor: 'var(--canvas)' }}
          >
            <Calendar
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--status-info)' }}
              aria-hidden="true"
            />
            <div>
              <p className="text-caption text-ink-muted">Next Meeting</p>
              <p className="text-small font-semibold text-ink">{MRM_COMMITTEE.date}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-md p-3 sm:col-span-2"
            style={{ backgroundColor: 'var(--canvas)' }}
          >
            <Users
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--status-info)' }}
              aria-hidden="true"
            />
            <div>
              <p className="text-caption text-ink-muted">Location</p>
              <p className="text-small font-semibold text-ink">{MRM_COMMITTEE.location}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Agenda Items
          </p>
          <ol className="list-none space-y-1.5">
            {MRM_COMMITTEE.agendaItems.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-small text-ink-secondary">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption font-bold"
                  style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
                >
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Last Meeting Summary
            </p>
          </div>
          <p className="text-small leading-relaxed text-ink-secondary">
            {MRM_COMMITTEE.lastMeetingSummary}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
