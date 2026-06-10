'use client';

import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataGenProgressBadge } from '@/components/ui/DataGenProgressBadge';
import type { ModelSubmission } from '@/types';

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; colorVar: string; bgVar: string }
> = {
  draft: {
    label: 'Draft',
    icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--ink-secondary)',
    bgVar: 'var(--neutral-100)',
  },
  awaiting_review: {
    label: 'Awaiting Review',
    icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-info)',
    bgVar: 'var(--status-info-bg)',
  },
  changes_requested: {
    label: 'Changes Requested',
    icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-warn)',
    bgVar: 'var(--status-warn-bg)',
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-pass)',
    bgVar: 'var(--status-pass-bg)',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-fail)',
    bgVar: 'var(--status-fail-bg)',
  },
  ready: {
    label: 'Ready',
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-pass)',
    bgVar: 'var(--status-pass-bg)',
  },
  data_gen_failed: {
    label: 'Data Gen Failed',
    icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
    colorVar: 'var(--status-fail)',
    bgVar: 'var(--status-fail-bg)',
  },
};

interface SubmissionStatusCardProps {
  submission: ModelSubmission;
  onRevise?: (submission: ModelSubmission) => void;
  onRetry?: (submissionId: string) => void;
}

export function SubmissionStatusCard({ submission, onRevise, onRetry }: SubmissionStatusCardProps) {
  const { model, status, mrmNotes, submittedAt } = submission;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const modelName = model.name ?? 'Unnamed Model';

  return (
    <div
      className="rounded-card border p-4 transition-shadow hover:shadow-[var(--elev-2)]"
      style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-body-sm font-semibold text-ink">{modelName}</span>
            <span className="font-mono text-caption text-ink-muted">{submission.modelId}</span>
          </div>
          <p className="text-caption text-ink-muted">
            {model.cat} · Tier {model.tier}
            {submittedAt && ` · Submitted ${submittedAt.slice(0, 10)}`}
          </p>
        </div>

        {/* Status chip */}
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-chip px-2.5 py-1 text-caption font-medium"
          style={{ backgroundColor: cfg.bgVar, color: cfg.colorVar }}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Data gen progress */}
      {(status === 'approved' || status === 'ready' || status === 'data_gen_failed') && (
        <div className="mt-2">
          <DataGenProgressBadge
            submission={submission}
            onRetry={
              status === 'data_gen_failed' && onRetry ? () => onRetry(submission.id) : undefined
            }
          />
        </div>
      )}

      {/* MRM notes for changes_requested */}
      {status === 'changes_requested' && mrmNotes && (
        <div
          className="mt-3 rounded-card border p-3"
          style={{
            borderColor: 'var(--status-warn)',
            backgroundColor: 'var(--status-warn-bg)',
          }}
        >
          <p className="mb-1 text-caption font-semibold" style={{ color: 'var(--status-warn)' }}>
            MRM Notes
          </p>
          <p className="text-body-sm text-ink-secondary">{mrmNotes}</p>
        </div>
      )}

      {/* Rejection note */}
      {status === 'rejected' && mrmNotes && (
        <div
          className="mt-3 rounded-card border p-3"
          style={{
            borderColor: 'var(--status-fail)',
            backgroundColor: 'var(--status-fail-bg)',
          }}
        >
          <p className="mb-1 text-caption font-semibold" style={{ color: 'var(--status-fail)' }}>
            Rejection Reason
          </p>
          <p className="text-body-sm text-ink-secondary">{mrmNotes}</p>
        </div>
      )}

      {/* Actions */}
      {(status === 'draft' || status === 'changes_requested') && onRevise && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRevise(submission)}
            className="gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {status === 'changes_requested' ? 'Revise & Resubmit' : 'Continue Draft'}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
