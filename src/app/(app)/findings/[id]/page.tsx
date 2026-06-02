'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useFindings } from '@/lib/store/findings-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import { AuditTrail } from '@/components/features/findings/AuditTrail';
import { FlagButton } from '@/components/features/findings/FlagButton';
import {
  getAvailableActions,
  applyTransition,
  type FindingAction,
} from '@/lib/findings/transitions';

interface FindingDetailPageProps {
  params: Promise<{ id: string }>;
}

const ACTION_LABELS: Record<FindingAction, string> = {
  'start-remediation': 'Start Remediation',
  close: 'Close Finding',
  reopen: 'Reopen',
};

const SEV_COLOR = (sev: string) =>
  sev === 'Critical' || sev === 'High'
    ? 'var(--status-fail)'
    : sev === 'Medium'
      ? 'var(--status-warn)'
      : 'var(--status-pass)';

const STATUS_COLOR = (status: string) =>
  status === 'Open'
    ? 'var(--status-fail)'
    : status === 'In Remediation'
      ? 'var(--status-warn)'
      : 'var(--status-pass)';

export default function FindingDetailPage({ params }: FindingDetailPageProps) {
  const { id } = use(params);
  const { getFinding, updateFinding, loading } = useFindings();
  const { currentUser } = useRole();
  const [closingNote, setClosingNote] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const finding = getFinding(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
        <div className="h-48 animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="space-y-4">
        <Link
          href="/findings"
          className="inline-flex items-center gap-1.5 text-small text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Findings Tracker
        </Link>
        <SurfaceCard>
          <p className="text-ink-secondary">Finding not found: {id}</p>
        </SurfaceCard>
      </div>
    );
  }

  async function handleTransition(action: FindingAction) {
    if (!finding) return;
    if (action === 'close' && !closingNote.trim()) {
      toast.error('A closing note is required to close a finding.');
      return;
    }

    setIsTransitioning(true);
    try {
      const result = applyTransition(finding, action, currentUser, closingNote);
      if (!result.success || !result.updatedFinding) {
        toast.error(result.error ?? 'Transition failed');
        return;
      }
      await updateFinding(result.updatedFinding);
      setClosingNote('');
      toast.success(
        action === 'close'
          ? 'Finding closed'
          : action === 'reopen'
            ? 'Finding reopened'
            : 'Remediation started'
      );
    } finally {
      setIsTransitioning(false);
    }
  }

  const availableActions = getAvailableActions(finding.status);

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 rounded text-small text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Findings Tracker
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-caption font-semibold"
              style={{
                backgroundColor: `${SEV_COLOR(finding.sev)}20`,
                color: SEV_COLOR(finding.sev),
              }}
            >
              {finding.sev}
            </span>
            <span
              className="text-small font-medium"
              style={{ color: STATUS_COLOR(finding.status) }}
            >
              {finding.status}
            </span>
            {finding.flaggedForReview && (
              <span
                className="rounded px-1.5 py-0.5 text-caption font-medium"
                style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
              >
                Flagged for Review
              </span>
            )}
          </div>
          <h1 className="text-h1 font-bold text-ink">{finding.title}</h1>
          <p className="mt-1 font-mono text-small text-ink-muted">{finding.id}</p>
        </div>
        <FlagButton findingId={finding.id} isFlagged={!!finding.flaggedForReview} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ── Left: metadata + description ── */}
        <div className="space-y-4 md:col-span-2">
          <SurfaceCard title="Details">
            <dl className="space-y-3">
              {[
                { label: 'Model', value: finding.model },
                { label: 'Model ID', value: finding.modelId },
                { label: 'Type', value: finding.type },
                { label: 'Open Date', value: finding.openDate },
                { label: 'Due Date', value: finding.dueDate },
                { label: 'Age', value: `${finding.age} days` },
                { label: 'Assigned To', value: `${finding.assignedTo} (${finding.assignedRole})` },
                ...(finding.closedDate
                  ? [{ label: 'Closed Date', value: finding.closedDate }]
                  : []),
                ...(finding.sourceRunId
                  ? [
                      {
                        label: 'Source Run',
                        value: finding.sourceRunId,
                        link: `/workbench`,
                      },
                    ]
                  : []),
              ].map(({ label, value, link }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-32 shrink-0 text-small text-ink-muted">{label}</dt>
                  <dd className="text-small font-medium text-ink">
                    {link ? (
                      <Link
                        href={link}
                        className="flex items-center gap-1 rounded text-[var(--status-info)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                      >
                        {value}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>

          <SurfaceCard title="Description">
            <p className="text-small leading-relaxed text-ink-secondary">{finding.desc}</p>
          </SurfaceCard>

          <SurfaceCard title="Remediation Plan">
            <p className="text-small leading-relaxed text-ink-secondary">{finding.remediation}</p>
          </SurfaceCard>

          {finding.validatorNote && (
            <SurfaceCard title="Validator Note" eyebrow="MRM">
              <p className="text-small leading-relaxed text-ink-secondary">
                {finding.validatorNote}
              </p>
            </SurfaceCard>
          )}
        </div>

        {/* ── Right: actions + audit trail ── */}
        <div className="space-y-4">
          {/* Status transitions */}
          {availableActions.length > 0 && (
            <SurfaceCard title="Actions">
              <div className="space-y-3">
                {availableActions.includes('close') && (
                  <div>
                    <label
                      className="mb-1.5 block text-caption font-medium text-ink-muted"
                      htmlFor="closing-note"
                    >
                      Closing note (required)
                    </label>
                    <textarea
                      id="closing-note"
                      value={closingNote}
                      onChange={(e) => setClosingNote(e.target.value)}
                      placeholder="Describe how this was resolved..."
                      rows={2}
                      className="placeholder-ink-muted w-full resize-none rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>
                )}
                {availableActions.map((action) => (
                  <Button
                    key={action}
                    variant={
                      action === 'close' ? 'primary' : action === 'reopen' ? 'secondary' : 'primary'
                    }
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleTransition(action)}
                    loading={isTransitioning}
                    disabled={isTransitioning}
                  >
                    {ACTION_LABELS[action]}
                  </Button>
                ))}
              </div>
            </SurfaceCard>
          )}

          {/* Audit trail */}
          <SurfaceCard title="Audit Trail">
            <AuditTrail entries={finding.auditTrail ?? []} />
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
