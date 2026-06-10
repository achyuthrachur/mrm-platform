'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { THRESHOLD_SCHEMA_BY_TYPE } from '@/lib/data/test-threshold-schema';
import type { ModelSubmission, ThresholdConfig } from '@/types';

interface MrmReviewPanelProps {
  submission: ModelSubmission;
  onApprove: (id: string, note?: string) => Promise<void>;
  onRequestChanges: (id: string, note: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
  onClose: () => void;
}

export function MrmReviewPanel({
  submission,
  onApprove,
  onRequestChanges,
  onReject,
  onClose,
}: MrmReviewPanelProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState<'approve' | 'changes' | 'reject' | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const { model, selectedTests, thresholdConfigs, priorNotes, auditTrail } = submission;

  const hasThresholdOverrides = thresholdConfigs.some((c) => c.overridesDefault);
  const freqOverrides = selectedTests.filter(
    (t) =>
      ({
        'source-to-model': 'Monthly',
        backtesting: 'Quarterly',
        benchmarking: 'Quarterly',
        sensitivity: 'Quarterly',
        stress: 'Semi-Annual',
        override: 'Quarterly',
        psi: 'Monthly',
        csi: 'Quarterly',
      })[t.testType] !== t.frequency
  );

  async function handleApprove() {
    if (hasThresholdOverrides && !note.trim()) {
      alert(
        'Please add a reviewer note acknowledging the non-standard thresholds before approving.'
      );
      return;
    }
    setLoading('approve');
    try {
      await onApprove(submission.id, note || undefined);
    } finally {
      setLoading(null);
    }
  }

  async function handleRequestChanges() {
    if (!note.trim()) {
      alert('A reviewer note is required when requesting changes.');
      return;
    }
    setLoading('changes');
    try {
      await onRequestChanges(submission.id, note);
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!note.trim()) {
      alert('A reviewer note is required when rejecting a submission.');
      return;
    }
    if (!window.confirm('Reject this submission? This action cannot be undone.')) return;
    setLoading('reject');
    try {
      await onReject(submission.id, note);
    } finally {
      setLoading(null);
    }
  }

  function ThresholdConfigDetail({ config }: { config: ThresholdConfig }) {
    const schema = THRESHOLD_SCHEMA_BY_TYPE[config.testType];
    if (!schema) return null;

    return (
      <div className="space-y-2">
        {schema.fields.map((field) => {
          const value = config.fields[field.key] ?? field.default;
          const isOverride = value !== field.default;
          return (
            <div key={field.key} className="flex items-center justify-between gap-4 text-body-sm">
              <span className="text-ink-secondary">{field.label}</span>
              <span
                className={cn('font-medium tabular-nums', isOverride && 'font-semibold')}
                style={{ color: isOverride ? 'var(--status-warn)' : 'var(--ink)' }}
              >
                {value} {field.unit}
                {isOverride && (
                  <span className="ml-1 text-caption" style={{ color: 'var(--status-warn)' }}>
                    (default: {field.default})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mrm-review-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className="relative flex h-full w-full max-w-4xl shadow-[var(--elev-4)]"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* ── Left column: submission detail ───────────────────────────── */}
        <div
          className="flex flex-1 flex-col overflow-hidden border-r"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
          >
            <div>
              <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Model Submission
              </p>
              <h2 id="mrm-review-title" className="text-h3 font-bold text-ink">
                {model.name ?? 'Unnamed Model'}
              </h2>
              <p className="text-body-sm text-ink-secondary">
                {submission.id} · {model.cat} · Tier {model.tier}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Prior round notes */}
            {priorNotes.length > 0 && (
              <div
                className="space-y-2 rounded-card border p-4"
                style={{
                  borderColor: 'var(--status-info)',
                  backgroundColor: 'var(--status-info-bg)',
                }}
              >
                <p className="text-body-sm font-semibold" style={{ color: 'var(--status-info)' }}>
                  Prior Review Notes (Resubmission)
                </p>
                {priorNotes.map((n, i) => (
                  <p key={i} className="text-body-sm text-ink-secondary">
                    Round {i + 1}: {n}
                  </p>
                ))}
              </div>
            )}

            {/* Model fields */}
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Model Details
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm">
                {[
                  ['Owner', model.owner],
                  ['Owner Title', model.ownerTitle],
                  ['Framework', model.framework],
                  ['Sub-category', model.sub || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-ink-muted">{label}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="mb-1 text-body-sm font-medium text-ink-secondary">Methodology</p>
              <p className="text-body-sm text-ink">{model.method}</p>
            </div>

            <div>
              <p className="mb-1 text-body-sm font-medium text-ink-secondary">Description</p>
              <p className="text-body-sm text-ink">{model.desc}</p>
            </div>

            {model.limits && (
              <div>
                <p className="mb-1 text-body-sm font-medium text-ink-secondary">
                  Known Limitations
                </p>
                <p className="text-body-sm text-ink">{model.limits}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink-secondary">
                Data Sources ({model.sources?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(model.sources ?? []).map((s) => (
                  <span
                    key={s}
                    className="rounded-chip border px-2 py-0.5 text-caption text-ink-secondary"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected tests */}
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Scheduled Tests
                {freqOverrides.length > 0 && (
                  <span
                    className="ml-2 rounded-chip px-2 py-0.5 text-caption font-medium normal-case tracking-normal"
                    style={{
                      backgroundColor: 'var(--status-warn-bg)',
                      color: 'var(--status-warn)',
                    }}
                  >
                    {freqOverrides.length} freq override{freqOverrides.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
              <div className="space-y-2">
                {selectedTests.map((t) => {
                  const defaultFreq =
                    (
                      {
                        'source-to-model': 'Monthly',
                        backtesting: 'Quarterly',
                        benchmarking: 'Quarterly',
                        sensitivity: 'Quarterly',
                        stress: 'Semi-Annual',
                        override: 'Quarterly',
                        psi: 'Monthly',
                        csi: 'Quarterly',
                      } as Record<string, string>
                    )[t.testType] ?? 'Quarterly';
                  const isFreqOverride = t.frequency !== defaultFreq;
                  const config = thresholdConfigs.find((c) => c.testType === t.testType);
                  const isExpanded = expandedTest === t.testType;

                  return (
                    <div
                      key={t.testType}
                      className="rounded-card border"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        onClick={() => setExpandedTest(isExpanded ? null : t.testType)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                        )}
                        <span className="flex-1 text-body-sm font-medium text-ink">
                          {t.testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span className="font-mono text-caption text-ink-muted">{t.srRef}</span>
                        <span
                          className="text-caption"
                          style={{
                            color: isFreqOverride ? 'var(--status-warn)' : 'var(--ink-muted)',
                          }}
                        >
                          {t.frequency}
                          {isFreqOverride && ' ⚠'}
                        </span>
                        {config?.overridesDefault && (
                          <span
                            className="rounded-chip px-2 py-0.5 text-caption font-medium"
                            style={{
                              backgroundColor: 'var(--status-warn-bg)',
                              color: 'var(--status-warn)',
                            }}
                          >
                            threshold override
                          </span>
                        )}
                      </button>
                      {isExpanded && config && (
                        <div
                          className="border-t px-4 pb-4 pt-3"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        >
                          <ThresholdConfigDetail config={config} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit trail */}
            {auditTrail.length > 0 && (
              <div>
                <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                  Audit Trail
                </p>
                <div className="space-y-2">
                  {auditTrail.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 text-body-sm">
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'var(--neutral-100)' }}
                      >
                        {entry.actorType === 'human' ? (
                          <User className="h-3 w-3 text-ink-muted" aria-hidden="true" />
                        ) : (
                          <Calendar className="h-3 w-3 text-ink-muted" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink">{entry.action}</p>
                        <p className="text-caption text-ink-muted">
                          {entry.actor} · {entry.ts.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: MRM actions ────────────────────────────────── */}
        <div className="flex w-80 shrink-0 flex-col" style={{ backgroundColor: 'var(--canvas)' }}>
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-hairline)' }}>
            <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
              MRM Decision
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              <span className="text-body-sm text-ink-secondary">
                Submitted{' '}
                {submission.submittedAt ? submission.submittedAt.slice(0, 10) : 'recently'}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {/* Flagged items callout */}
            {(hasThresholdOverrides || freqOverrides.length > 0) && (
              <div
                className="space-y-1 rounded-card border p-3"
                style={{
                  borderColor: 'var(--status-warn)',
                  backgroundColor: 'var(--status-warn-bg)',
                }}
              >
                <p
                  className="flex items-center gap-1.5 text-body-sm font-semibold"
                  style={{ color: 'var(--status-warn)' }}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Review required
                </p>
                {hasThresholdOverrides && (
                  <p className="text-caption text-ink-secondary">
                    Non-standard thresholds — note required to approve.
                  </p>
                )}
                {freqOverrides.length > 0 && (
                  <p className="text-caption text-ink-secondary">
                    {freqOverrides.length} non-default frequency
                    {freqOverrides.length > 1 ? 's' : ''}.
                  </p>
                )}
              </div>
            )}

            {/* Notes textarea */}
            <div>
              <label htmlFor="mrm-note" className="mb-1.5 block text-body-sm font-medium text-ink">
                Reviewer Notes
                {hasThresholdOverrides && (
                  <span className="ml-1 text-caption" style={{ color: 'var(--status-warn)' }}>
                    (required for Approve)
                  </span>
                )}
              </label>
              <textarea
                id="mrm-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                placeholder="Add notes for the model owner…"
                className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-start"
                loading={loading === 'approve'}
                onClick={handleApprove}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Approve
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                loading={loading === 'changes'}
                onClick={handleRequestChanges}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Request Changes
              </Button>
              <Button
                variant="danger"
                className="w-full justify-start"
                loading={loading === 'reject'}
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
            </div>

            <p className="text-caption text-ink-muted">
              Approve moves the model to inventory. Request Changes returns to owner. Reject
              permanently archives the submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
