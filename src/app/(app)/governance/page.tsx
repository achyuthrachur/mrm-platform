'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import { ApprovalPipeline } from '@/components/features/governance/ApprovalPipeline';
import { MRMCommittee } from '@/components/features/governance/MRMCommittee';
import { PolicyExceptions } from '@/components/features/governance/PolicyExceptions';
import { MrmReviewPanel } from '@/components/features/governance/MrmReviewPanel';
import { useFrequencyApprovals } from '@/lib/store/frequency-approvals-context';
import { useSubmissions } from '@/lib/store/submissions-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { CheckCircle2, XCircle, ClipboardList, Inbox } from 'lucide-react';
import type { ModelSubmission } from '@/types';

type GovernanceTab = 'approvals' | 'models';

export default function GovernancePage() {
  const { pending: freqPending, approveRequest, rejectRequest } = useFrequencyApprovals();
  const { pending: modelPending, approve, requestChanges, reject } = useSubmissions();
  const { currentUser } = useRole();
  const { canApproveFrequency, canApproveModel } = usePermissions();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<GovernanceTab>('approvals');
  const [reviewingSubmission, setReviewingSubmission] = useState<ModelSubmission | null>(null);

  async function handleFreqApprove(id: string) {
    await approveRequest(id, currentUser, reviewNotes[id]);
    toast.success('Frequency change approved — calendar will reflect new frequency');
  }

  async function handleFreqReject(id: string) {
    await rejectRequest(id, currentUser, reviewNotes[id]);
    toast.success('Frequency change rejected — default frequency will remain');
  }

  async function handleModelApprove(id: string, note?: string) {
    await approve(id, currentUser, note);
    toast.success('Model approved — data generation triggered');
    setReviewingSubmission(null);
  }

  async function handleModelRequestChanges(id: string, note: string) {
    await requestChanges(id, currentUser, note);
    toast.success('Changes requested — model owner notified');
    setReviewingSubmission(null);
  }

  async function handleModelReject(id: string, note: string) {
    await reject(id, currentUser, note);
    toast.success('Submission rejected and archived');
    setReviewingSubmission(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Oversight</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Governance</h1>
      </div>

      {/* Tab strip — only show model tab to MRM */}
      {canApproveModel && (
        <div
          className="flex items-center gap-1 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
          role="tablist"
          aria-label="Governance sections"
        >
          {(
            [
              {
                id: 'approvals',
                label: 'Approvals',
                icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
                count: freqPending.length,
              },
              {
                id: 'models',
                label: 'Pending Model Review',
                icon: <Inbox className="h-4 w-4" aria-hidden="true" />,
                count: modelPending.length,
              },
            ] as { id: GovernanceTab; label: string; icon: React.ReactNode; count: number }[]
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? 'relative inline-flex items-center gap-2 px-4 py-3 text-body-sm font-semibold text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]'
                  : 'inline-flex items-center gap-2 px-4 py-3 text-body-sm text-ink-secondary hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]'
              }
              style={
                activeTab === tab.id
                  ? ({ '--tw-after-bg': 'var(--accent)' } as React.CSSProperties)
                  : {}
              }
            >
              <span className={activeTab === tab.id ? 'text-[var(--accent)]' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="min-w-[1.25rem] rounded-chip px-1.5 py-0.5 text-center text-caption font-semibold tabular-nums"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'var(--neutral-200)',
                    color: activeTab === tab.id ? 'white' : 'var(--ink-secondary)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Approvals tab ── */}
      {activeTab === 'approvals' && (
        <>
          {freqPending.length > 0 && canApproveFrequency && (
            <SurfaceCard
              title={`Frequency Approval Requests (${freqPending.length})`}
              eyebrow="Pending MRM review"
            >
              <div className="space-y-3">
                {freqPending.map((req) => (
                  <div
                    key={req.id}
                    className="space-y-3 rounded-card border p-4"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-body-sm font-semibold text-ink">
                          {req.modelId} — {req.testType.replace(/-/g, ' ')}
                        </p>
                        <p className="mt-0.5 text-caption text-ink-muted">
                          Requested: {req.requestedFrequency} (default: {req.defaultFrequency})
                        </p>
                        <p className="mt-1 text-body-sm text-ink-secondary">{req.justification}</p>
                        <p className="mt-0.5 text-caption text-ink-muted">
                          Submitted by {req.requestedBy} · {req.requestedAt.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <textarea
                        value={reviewNotes[req.id] ?? ''}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        placeholder="Reviewer note (optional)..."
                        rows={2}
                        className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                        style={{ borderColor: 'var(--border-hairline)' }}
                        aria-label="Reviewer note"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleFreqApprove(req.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleFreqReject(req.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}

          <ApprovalPipeline />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MRMCommittee />
            <PolicyExceptions />
          </div>
        </>
      )}

      {/* ── Model Review tab ── */}
      {activeTab === 'models' && canApproveModel && (
        <div>
          {modelPending.length === 0 ? (
            <SurfaceCard>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--neutral-100)' }}
                >
                  <Inbox className="h-6 w-6 text-ink-muted" aria-hidden="true" />
                </div>
                <p className="text-body font-medium text-ink">No submissions pending review</p>
                <p className="text-body-sm text-ink-secondary">
                  Model submissions from owners will appear here for approval.
                </p>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard
              title={`Pending Model Submissions (${modelPending.length})`}
              eyebrow="Awaiting MRM review"
            >
              <div className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
                {modelPending.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-4 px-1 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-semibold text-ink">
                        {sub.model.name ?? 'Unnamed Model'}
                      </p>
                      <p className="text-caption text-ink-muted">
                        {sub.id} · {sub.model.cat} · Tier {sub.model.tier}
                        {sub.priorNotes.length > 0 && (
                          <span
                            className="ml-2 rounded-chip px-1.5 py-0.5 text-caption"
                            style={{
                              backgroundColor: 'var(--status-info-bg)',
                              color: 'var(--status-info)',
                            }}
                          >
                            Resubmission
                          </span>
                        )}
                      </p>
                      <p className="text-caption text-ink-muted">
                        Owner: {sub.model.owner} · {sub.submittedAt?.slice(0, 10) ?? 'Unknown date'}
                      </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setReviewingSubmission(sub)}>
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}
        </div>
      )}

      {/* MRM Review Panel overlay */}
      {reviewingSubmission && (
        <MrmReviewPanel
          submission={reviewingSubmission}
          onApprove={handleModelApprove}
          onRequestChanges={handleModelRequestChanges}
          onReject={handleModelReject}
          onClose={() => setReviewingSubmission(null)}
        />
      )}
    </div>
  );
}
