'use client';

import { Info, ShieldCheck } from 'lucide-react';
import { useRole } from '@/components/features/shell/RoleProvider';
import type { Model, Finding } from '@/types';

interface HITLBannerProps {
  models: Model[];
  findings: Finding[];
}

export function HITLBanner({ models, findings }: HITLBannerProps) {
  const { role } = useRole();

  const openFindings = findings.filter((f) => f.status === 'Open').length;
  const flaggedFindings = findings.filter((f) => f.flaggedForReview).length;
  const criticalFindings = findings.filter(
    (f) => f.sev === 'Critical' && f.status !== 'Closed'
  ).length;

  if (role === 'mrm') {
    return (
      <div
        className="flex items-start gap-3 rounded-card px-5 py-4"
        style={{
          backgroundColor: 'var(--status-info-bg)',
          border: '1px solid var(--status-info)',
        }}
        role="alert"
        aria-label="MRM Officer review dashboard"
      >
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: 'var(--status-info)' }}
          aria-hidden="true"
        />
        <div>
          <p className="text-small font-semibold text-ink">
            MRM Officer Dashboard — Heartland Commerce Bank
          </p>
          <p className="mt-0.5 text-small text-ink-secondary">
            Portfolio of {models.length} models under oversight.{' '}
            <span className="font-medium" style={{ color: 'var(--status-fail)' }}>
              {openFindings} open findings
            </span>{' '}
            {flaggedFindings > 0 && (
              <>
                ·{' '}
                <span className="font-medium" style={{ color: 'var(--status-warn)' }}>
                  {flaggedFindings} flagged for review
                </span>
              </>
            )}
            {criticalFindings > 0 && (
              <>
                {' '}
                ·{' '}
                <span className="font-medium" style={{ color: 'var(--status-fail)' }}>
                  {criticalFindings} critical
                </span>
              </>
            )}
            . Human-in-the-loop review is required before findings are closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3 rounded-card px-5 py-4"
      style={{
        backgroundColor: 'var(--status-warn-bg)',
        border: '1px solid var(--status-warn)',
      }}
      role="alert"
      aria-label="Model owner action required"
    >
      <Info
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: 'var(--status-warn)' }}
        aria-hidden="true"
      />
      <div>
        <p className="text-small font-semibold text-ink">
          Model Owner Dashboard — {models.length} model{models.length !== 1 ? 's' : ''} in your
          scope
        </p>
        <p className="mt-0.5 text-small text-ink-secondary">
          {openFindings > 0 ? (
            <>
              <span className="font-medium" style={{ color: 'var(--status-fail)' }}>
                {openFindings} open finding{openFindings !== 1 ? 's' : ''}
              </span>{' '}
              require your attention.{' '}
            </>
          ) : (
            'No open findings. '
          )}
          Tests showing warn or fail verdicts should be investigated and a remediation plan
          submitted to MRM for review.
        </p>
      </div>
    </div>
  );
}
