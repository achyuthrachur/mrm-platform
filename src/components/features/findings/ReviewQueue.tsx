'use client';

import { useState } from 'react';
import { CheckCircle2, MessageSquare, ArrowUpRight, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useFindings } from '@/lib/store/findings-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { applyReviewAction } from '@/lib/findings/transitions';
import type { Finding } from '@/types';
import Link from 'next/link';

interface ReviewQueueProps {
  findings: Finding[];
}

export function ReviewQueue({ findings }: ReviewQueueProps) {
  const flaggedFindings = findings.filter((f) => f.flaggedForReview);
  const { updateFinding } = useFindings();
  const { currentUser } = useRole();
  const { canReviewFindings } = usePermissions();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!canReviewFindings) {
    return (
      <SurfaceCard title="MRM Review Queue">
        <p className="text-small text-ink-muted">
          Review actions are available to MRM Officers only. Switch to MRM role to review flagged
          findings.
        </p>
      </SurfaceCard>
    );
  }

  if (flaggedFindings.length === 0) {
    return (
      <SurfaceCard title="MRM Review Queue">
        <div className="py-8 text-center">
          <CheckCircle2
            className="mx-auto mb-2 h-8 w-8"
            style={{ color: 'var(--status-pass)' }}
            aria-hidden="true"
          />
          <p className="text-small text-ink-muted">No items pending review.</p>
        </div>
      </SurfaceCard>
    );
  }

  async function handleReviewAction(
    finding: Finding,
    action: 'approve' | 'request-changes' | 'escalate'
  ) {
    const note = notes[finding.id] ?? '';
    const updated = applyReviewAction(finding, action, currentUser, note);
    await updateFinding(updated);
    setNotes((prev) => ({ ...prev, [finding.id]: '' }));
    toast.success(
      action === 'approve'
        ? 'Finding approved'
        : action === 'request-changes'
          ? 'Changes requested'
          : 'Escalated to committee'
    );
  }

  return (
    <SurfaceCard
      title="MRM Review Queue"
      eyebrow={`${flaggedFindings.length} item${flaggedFindings.length !== 1 ? 's' : ''} pending`}
    >
      <div className="space-y-3">
        {flaggedFindings.map((finding) => {
          const isExpanded = expanded === finding.id;
          return (
            <div
              key={finding.id}
              className="rounded-md border"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : finding.id)}
                className="flex w-full items-start gap-3 rounded-md p-4 text-left transition-colors hover:bg-[var(--canvas)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                aria-expanded={isExpanded}
              >
                <Flag
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: 'var(--status-warn)' }}
                  fill="currentColor"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-caption font-semibold"
                      style={{
                        backgroundColor:
                          finding.sev === 'Critical' || finding.sev === 'High'
                            ? 'var(--status-fail-bg)'
                            : 'var(--status-warn-bg)',
                        color:
                          finding.sev === 'Critical' || finding.sev === 'High'
                            ? 'var(--status-fail)'
                            : 'var(--status-warn)',
                      }}
                    >
                      {finding.sev}
                    </span>
                    <span className="text-caption text-ink-muted">{finding.status}</span>
                  </div>
                  <p className="text-small font-medium text-ink">{finding.title}</p>
                  <p className="mt-0.5 text-caption text-ink-muted">
                    {finding.id} · {finding.model} · Due {finding.dueDate}
                  </p>
                </div>
                <Link
                  href={`/findings/${finding.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  aria-label={`Open finding detail for ${finding.id}`}
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </button>

              {/* Expanded review panel */}
              {isExpanded && (
                <div
                  className="space-y-3 border-t px-4 pb-4 pt-3"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <p className="line-clamp-3 text-small text-ink-secondary">{finding.desc}</p>

                  <div>
                    <label
                      htmlFor={`review-note-${finding.id}`}
                      className="mb-1 block text-caption font-medium text-ink-muted"
                    >
                      Reviewer note (optional)
                    </label>
                    <textarea
                      id={`review-note-${finding.id}`}
                      value={notes[finding.id] ?? ''}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [finding.id]: e.target.value }))
                      }
                      placeholder="Add a note for the finding owner..."
                      className="placeholder-ink-muted w-full resize-none rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                      style={{ borderColor: 'var(--border-hairline)' }}
                      rows={2}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReviewAction(finding, 'approve')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReviewAction(finding, 'request-changes')}
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      Request Changes
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReviewAction(finding, 'escalate')}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      Escalate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
