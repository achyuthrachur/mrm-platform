'use client';

import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { ModelSubmission } from '@/types';

interface DataGenProgressBadgeProps {
  submission?: ModelSubmission;
  onRetry?: () => void;
  className?: string;
}

export function DataGenProgressBadge({
  submission,
  onRetry,
  className,
}: DataGenProgressBadgeProps) {
  if (!submission) return null;

  const { dataGenStatus, dataGenProgress, status } = submission;

  if (status === 'ready') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-medium',
          className
        )}
        style={{ backgroundColor: 'var(--status-pass-bg)', color: 'var(--status-pass)' }}
      >
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Ready
      </span>
    );
  }

  if (status === 'data_gen_failed') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className="inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-medium"
          style={{ backgroundColor: 'var(--status-fail-bg)', color: 'var(--status-fail)' }}
        >
          <XCircle className="h-3 w-3" aria-hidden="true" />
          Data gen failed
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-caption text-ink-secondary hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            style={{ border: '1px solid var(--border-hairline)' }}
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Retry
          </button>
        )}
      </span>
    );
  }

  if (dataGenStatus === 'generating') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className="inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-medium"
          style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Generating…
        </span>
        {dataGenProgress !== undefined && dataGenProgress > 0 && (
          <span className="text-caption tabular-nums text-ink-muted">{dataGenProgress}%</span>
        )}
      </span>
    );
  }

  if (status === 'approved') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-medium',
          className
        )}
        style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Data generating…
      </span>
    );
  }

  return null;
}
