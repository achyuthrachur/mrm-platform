'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Flag } from 'lucide-react';
import { useFindings } from '@/lib/store/findings-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import {
  DataTableShell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/DataTableShell';
import {
  FindingsFilters,
  type FindingFilterValue,
} from '@/components/features/findings/FindingsFilters';
import { FindingSummaryStrip } from '@/components/features/findings/FindingSummaryStrip';
import { ReviewQueue } from '@/components/features/findings/ReviewQueue';
import type { Finding } from '@/types';

type Tab = 'findings' | 'review';

function severityColor(sev: Finding['sev']): string {
  if (sev === 'Critical' || sev === 'High') return 'var(--status-fail)';
  if (sev === 'Medium') return 'var(--status-warn)';
  return 'var(--status-pass)';
}

function statusColor(status: Finding['status']): string {
  if (status === 'Open') return 'var(--status-fail)';
  if (status === 'In Remediation') return 'var(--status-warn)';
  return 'var(--status-pass)';
}

export default function FindingsPage() {
  const { findings, loading } = useFindings();
  const { role } = useRole();
  const { canViewAllModels } = usePermissions();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FindingFilterValue>('All');
  const [activeTab, setActiveTab] = useState<Tab>('findings');

  const scopedFindings = canViewAllModels
    ? findings
    : findings.filter((f) =>
        ['CECL-2024-001', 'ALM-2024-001', 'CECL-2024-002', 'CECL-2024-003'].includes(f.modelId)
      );

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'Open':
        return scopedFindings.filter((f) => f.status === 'Open');
      case 'In Remediation':
        return scopedFindings.filter((f) => f.status === 'In Remediation');
      case 'Closed':
        return scopedFindings.filter((f) => f.status === 'Closed');
      case 'Critical':
        return scopedFindings.filter((f) => f.sev === 'Critical' && f.status !== 'Closed');
      case 'High':
        return scopedFindings.filter((f) => f.sev === 'High' && f.status !== 'Closed');
      case 'Flagged':
        return scopedFindings.filter((f) => f.flaggedForReview);
      default:
        return scopedFindings;
    }
  }, [scopedFindings, activeFilter]);

  const filterCounts: Partial<Record<FindingFilterValue, number>> = {
    All: scopedFindings.length,
    Open: scopedFindings.filter((f) => f.status === 'Open').length,
    'In Remediation': scopedFindings.filter((f) => f.status === 'In Remediation').length,
    Closed: scopedFindings.filter((f) => f.status === 'Closed').length,
    Critical: scopedFindings.filter((f) => f.sev === 'Critical' && f.status !== 'Closed').length,
    High: scopedFindings.filter((f) => f.sev === 'High' && f.status !== 'Closed').length,
    Flagged: scopedFindings.filter((f) => f.flaggedForReview).length,
  };

  const flaggedCount = filterCounts.Flagged ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Risk</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Findings Tracker</h1>
        </div>
        {flaggedCount > 0 && role === 'mrm' && (
          <button
            onClick={() => setActiveTab('review')}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-small font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
          >
            <Flag className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
            {flaggedCount} pending review
          </button>
        )}
      </div>

      <FindingSummaryStrip findings={scopedFindings} />

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
        {(['findings', ...(role === 'mrm' ? ['review'] : [])] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 px-4 py-2 text-small font-medium capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              activeTab === tab
                ? 'border-[var(--accent)] text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {tab === 'review'
              ? `Review Queue${flaggedCount > 0 ? ` (${flaggedCount})` : ''}`
              : 'All Findings'}
          </button>
        ))}
      </div>

      {activeTab === 'review' ? (
        <ReviewQueue findings={scopedFindings} />
      ) : (
        <SurfaceCard noPadding>
          <div className="px-6 pb-4 pt-5">
            <FindingsFilters
              active={activeFilter}
              onChange={setActiveFilter}
              counts={filterCounts}
            />
            <p className="mt-3 text-caption text-ink-muted">
              {loading
                ? 'Loading…'
                : `${filtered.length} finding${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-small text-ink-muted">Loading findings…</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <AlertTriangle
                className="mx-auto mb-2 h-8 w-8"
                style={{ color: 'var(--ink-muted)' }}
                aria-hidden="true"
              />
              <p className="text-small text-ink-muted">No findings match the current filter.</p>
            </div>
          ) : (
            <DataTableShell caption="Findings list">
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>ID</DataTableHeaderCell>
                  <DataTableHeaderCell>Title</DataTableHeaderCell>
                  <DataTableHeaderCell>Model</DataTableHeaderCell>
                  <DataTableHeaderCell>Severity</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Due</DataTableHeaderCell>
                  <DataTableHeaderCell>Assigned To</DataTableHeaderCell>
                  <DataTableHeaderCell> </DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {filtered.map((f) => (
                  <DataTableRow key={f.id} onClick={() => router.push(`/findings/${f.id}`)}>
                    <DataTableCell>
                      <span className="font-mono text-small font-medium text-ink">{f.id}</span>
                      {f.flaggedForReview && (
                        <Flag
                          className="ml-1.5 inline h-3 w-3"
                          style={{ color: 'var(--status-warn)' }}
                          fill="currentColor"
                          aria-label="Flagged for review"
                        />
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <Link
                        href={`/findings/${f.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded text-small font-medium text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                      >
                        {f.title.length > 60 ? f.title.slice(0, 58) + '…' : f.title}
                      </Link>
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-small text-ink-secondary">{f.model}</span>
                    </DataTableCell>
                    <DataTableCell>
                      <span
                        className="text-small font-semibold"
                        style={{ color: severityColor(f.sev) }}
                      >
                        {f.sev}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <span
                        className="text-small font-medium"
                        style={{ color: statusColor(f.status) }}
                      >
                        {f.status}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-small tabular-nums text-ink-secondary">
                        {f.dueDate}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-small text-ink-secondary">{f.assignedTo}</span>
                    </DataTableCell>
                    <DataTableCell>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTableShell>
          )}
        </SurfaceCard>
      )}
    </div>
  );
}
