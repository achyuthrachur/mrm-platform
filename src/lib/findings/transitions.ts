/**
 * Findings status state machine.
 * Valid transitions:
 *   Open → In Remediation
 *   In Remediation → Closed (requires a closing note)
 *   In Remediation → Open  (reopen)
 * Closed is terminal — no further transitions allowed.
 */

import type { Finding, AuditEntry } from '@/types';
import { getToday } from '@/lib/clock';

export type FindingAction = 'start-remediation' | 'close' | 'reopen';

interface TransitionResult {
  success: boolean;
  updatedFinding?: Finding;
  error?: string;
}

const VALID_TRANSITIONS: Record<string, Finding['status']> = {
  'Open:start-remediation': 'In Remediation',
  'In Remediation:close': 'Closed',
  'In Remediation:reopen': 'Open',
};

function transitionKey(status: Finding['status'], action: FindingAction): string {
  return `${status}:${action}`;
}

export function canTransition(status: Finding['status'], action: FindingAction): boolean {
  return transitionKey(status, action) in VALID_TRANSITIONS;
}

export function getAvailableActions(status: Finding['status']): FindingAction[] {
  const actions: FindingAction[] = ['start-remediation', 'close', 'reopen'];
  return actions.filter((a) => canTransition(status, a));
}

export function applyTransition(
  finding: Finding,
  action: FindingAction,
  actor: string,
  closingNote?: string
): TransitionResult {
  if (!canTransition(finding.status, action)) {
    return {
      success: false,
      error: `Cannot transition from '${finding.status}' with action '${action}'.`,
    };
  }

  if (action === 'close' && !closingNote?.trim()) {
    return { success: false, error: 'A closing note is required to close a finding.' };
  }

  const newStatus = VALID_TRANSITIONS[transitionKey(finding.status, action)];

  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor,
    actorType: 'human',
    action: `Status changed: ${finding.status} → ${newStatus}${closingNote ? ` — ${closingNote}` : ''}`,
  };

  const updatedFinding: Finding = {
    ...finding,
    status: newStatus,
    auditTrail: [...(finding.auditTrail ?? []), auditEntry],
    ...(action === 'close'
      ? { closedDate: getToday(), validatorNote: closingNote ?? finding.validatorNote }
      : {}),
  };

  return { success: true, updatedFinding };
}

export function applyFlag(finding: Finding, actor: string): Finding {
  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor,
    actorType: 'human',
    action: 'Flagged for MRM review',
  };
  return {
    ...finding,
    flaggedForReview: true,
    auditTrail: [...(finding.auditTrail ?? []), auditEntry],
  };
}

export function applyUnflag(finding: Finding, actor: string): Finding {
  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor,
    actorType: 'human',
    action: 'Review flag cleared',
  };
  return {
    ...finding,
    flaggedForReview: false,
    auditTrail: [...(finding.auditTrail ?? []), auditEntry],
  };
}

export function applyReviewAction(
  finding: Finding,
  reviewAction: 'approve' | 'request-changes' | 'escalate',
  reviewer: string,
  note?: string
): Finding {
  const labels: Record<typeof reviewAction, string> = {
    approve: 'MRM approved — finding validated',
    'request-changes': 'MRM requested changes',
    escalate: 'MRM escalated to committee',
  };
  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor: reviewer,
    actorType: 'human',
    action: `${labels[reviewAction]}${note ? ` — ${note}` : ''}`,
  };
  return {
    ...finding,
    flaggedForReview: reviewAction !== 'approve',
    auditTrail: [...(finding.auditTrail ?? []), auditEntry],
  };
}

export function applyAssignment(
  finding: Finding,
  newAssignee: string,
  newRole: string,
  actor: string
): Finding {
  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor,
    actorType: 'human',
    action: `Reassigned to ${newAssignee} (${newRole})`,
  };
  return {
    ...finding,
    assignedTo: newAssignee,
    assignedRole: newRole,
    auditTrail: [...(finding.auditTrail ?? []), auditEntry],
  };
}
