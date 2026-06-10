import type { ModelOnboardingStatus, OnboardingAction, AuditEntry } from '@/types';

const VALID: Record<
  ModelOnboardingStatus,
  Partial<Record<OnboardingAction, ModelOnboardingStatus>>
> = {
  draft: {
    submit: 'awaiting_review',
  },
  awaiting_review: {
    request_changes: 'changes_requested',
    approve: 'approved',
    reject: 'rejected',
  },
  changes_requested: {
    resubmit: 'awaiting_review',
  },
  approved: {
    data_gen_complete: 'ready',
    data_gen_failed_action: 'data_gen_failed',
  },
  ready: {},
  rejected: {},
  data_gen_failed: {
    retry: 'approved',
  },
};

/** Transition the onboarding status. Throws if the action is illegal from the current state. */
export function transition(
  current: ModelOnboardingStatus,
  action: OnboardingAction
): ModelOnboardingStatus {
  const next = VALID[current]?.[action];
  if (next === undefined) {
    throw new Error(
      `Illegal onboarding transition: cannot perform "${action}" from state "${current}"`
    );
  }
  return next;
}

/** Returns true if the action is valid from the current state. */
export function canTransition(current: ModelOnboardingStatus, action: OnboardingAction): boolean {
  return VALID[current]?.[action] !== undefined;
}

/** Returns all valid actions from the current state. */
export function validActions(current: ModelOnboardingStatus): OnboardingAction[] {
  return Object.keys(VALID[current] ?? {}) as OnboardingAction[];
}

/** Build an audit entry for a transition. */
export function auditEntry(
  action: OnboardingAction,
  actor: string,
  actorType: AuditEntry['actorType'],
  note?: string
): AuditEntry {
  const ACTION_LABELS: Record<OnboardingAction, string> = {
    submit: 'Submitted for MRM review',
    request_changes: `Changes requested${note ? `: ${note}` : ''}`,
    approve: 'Approved — data generation triggered',
    reject: `Rejected${note ? `: ${note}` : ''}`,
    resubmit: 'Resubmitted after changes',
    data_gen_complete: 'Synthetic datasets generated — model ready',
    data_gen_failed_action: `Data generation failed${note ? `: ${note}` : ''}`,
    retry: 'Data generation retry triggered',
  };

  return {
    ts: new Date().toISOString(),
    actor,
    actorType,
    action: ACTION_LABELS[action],
  };
}
