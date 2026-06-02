'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import { ApprovalPipeline } from '@/components/features/governance/ApprovalPipeline';
import { MRMCommittee } from '@/components/features/governance/MRMCommittee';
import { PolicyExceptions } from '@/components/features/governance/PolicyExceptions';
import { useFrequencyApprovals } from '@/lib/store/frequency-approvals-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function GovernancePage() {
  const { pending, approveRequest, rejectRequest } = useFrequencyApprovals();
  const { currentUser } = useRole();
  const { canApproveFrequency } = usePermissions();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  async function handleApprove(id: string) {
    await approveRequest(id, currentUser, reviewNotes[id]);
    toast.success('Frequency change approved — calendar will reflect new frequency');
  }

  async function handleReject(id: string) {
    await rejectRequest(id, currentUser, reviewNotes[id]);
    toast.success('Frequency change rejected — default frequency will remain');
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Oversight</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Governance</h1>
      </div>

      {pending.length > 0 && canApproveFrequency && (
        <SurfaceCard
          title={`Frequency Approval Requests (${pending.length})`}
          eyebrow="Pending MRM review"
        >
          <div className="space-y-3">
            {pending.map((req) => (
              <div
                key={req.id}
                className="space-y-3 rounded-md border p-4"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-small font-semibold text-ink">
                      {req.modelId} — {req.testType.replace(/-/g, ' ')}
                    </p>
                    <p className="mt-0.5 text-caption text-ink-muted">
                      Requested: {req.requestedFrequency} (default: {req.defaultFrequency})
                    </p>
                    <p className="text-small mt-1 text-ink-secondary">{req.justification}</p>
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
                    className="placeholder-ink-muted text-small w-full resize-none rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                    style={{ borderColor: 'var(--border-hairline)' }}
                    aria-label="Reviewer note"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleReject(req.id)}>
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
    </div>
  );
}
