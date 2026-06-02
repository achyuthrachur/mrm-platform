import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getAvailableActions,
  applyTransition,
  applyFlag,
  applyUnflag,
  applyReviewAction,
} from './transitions';
import type { Finding } from '@/types';

const OPEN_FINDING: Finding = {
  id: 'MRF-TEST-001',
  modelId: 'CECL-2024-001',
  model: 'CRE PD',
  title: 'Test finding',
  sev: 'High',
  status: 'Open',
  type: 'Data Quality',
  openDate: '2026-01-01',
  dueDate: '2026-04-01',
  assignedTo: 'Sarah Chen',
  assignedRole: 'Model Owner',
  desc: 'Test description',
  remediation: 'Test remediation',
  validatorNote: '',
  age: 30,
};

describe('canTransition', () => {
  it('Open → In Remediation is valid', () => {
    expect(canTransition('Open', 'start-remediation')).toBe(true);
  });

  it('In Remediation → Closed is valid', () => {
    expect(canTransition('In Remediation', 'close')).toBe(true);
  });

  it('In Remediation → Open (reopen) is valid', () => {
    expect(canTransition('In Remediation', 'reopen')).toBe(true);
  });

  it('Closed is terminal — no transitions allowed', () => {
    expect(canTransition('Closed', 'start-remediation')).toBe(false);
    expect(canTransition('Closed', 'reopen')).toBe(false);
    expect(canTransition('Closed', 'close')).toBe(false);
  });

  it('Open → close is invalid (must go through In Remediation)', () => {
    expect(canTransition('Open', 'close')).toBe(false);
  });

  it('Open → reopen is invalid', () => {
    expect(canTransition('Open', 'reopen')).toBe(false);
  });
});

describe('getAvailableActions', () => {
  it('Open status has only start-remediation', () => {
    const actions = getAvailableActions('Open');
    expect(actions).toContain('start-remediation');
    expect(actions).not.toContain('close');
    expect(actions).not.toContain('reopen');
  });

  it('In Remediation has close and reopen', () => {
    const actions = getAvailableActions('In Remediation');
    expect(actions).toContain('close');
    expect(actions).toContain('reopen');
    expect(actions).not.toContain('start-remediation');
  });

  it('Closed has no available actions', () => {
    const actions = getAvailableActions('Closed');
    expect(actions).toHaveLength(0);
  });
});

describe('applyTransition', () => {
  it('transitions Open → In Remediation', () => {
    const result = applyTransition(OPEN_FINDING, 'start-remediation', 'Sarah Chen');
    expect(result.success).toBe(true);
    expect(result.updatedFinding?.status).toBe('In Remediation');
    expect(result.updatedFinding?.auditTrail?.length).toBe(1);
    expect(result.updatedFinding?.auditTrail?.[0].action).toContain('In Remediation');
  });

  it('rejects illegal transition', () => {
    const result = applyTransition(OPEN_FINDING, 'close', 'Sarah Chen');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('closing requires a note', () => {
    const inRem: Finding = { ...OPEN_FINDING, status: 'In Remediation' };
    const withoutNote = applyTransition(inRem, 'close', 'Marcus Williams');
    expect(withoutNote.success).toBe(false);

    const withNote = applyTransition(inRem, 'close', 'Marcus Williams', 'Issue resolved');
    expect(withNote.success).toBe(true);
    expect(withNote.updatedFinding?.status).toBe('Closed');
    expect(withNote.updatedFinding?.closedDate).toBeTruthy();
  });

  it('closed is terminal — transition fails', () => {
    const closed: Finding = { ...OPEN_FINDING, status: 'Closed' };
    const result = applyTransition(closed, 'start-remediation', 'Sarah Chen');
    expect(result.success).toBe(false);
  });

  it('appends audit entry with actor and action', () => {
    const result = applyTransition(OPEN_FINDING, 'start-remediation', 'Sarah Chen');
    const entry = result.updatedFinding?.auditTrail?.[0];
    expect(entry?.actor).toBe('Sarah Chen');
    expect(entry?.actorType).toBe('human');
    expect(entry?.action).toBeTruthy();
    expect(entry?.ts).toBeTruthy();
  });
});

describe('applyFlag / applyUnflag', () => {
  it('sets flaggedForReview and appends audit entry', () => {
    const flagged = applyFlag(OPEN_FINDING, 'Sarah Chen');
    expect(flagged.flaggedForReview).toBe(true);
    expect(flagged.auditTrail?.length).toBe(1);
    expect(flagged.auditTrail?.[0].action).toContain('Flag');
  });

  it('unflag clears flaggedForReview', () => {
    const flagged = applyFlag(OPEN_FINDING, 'Sarah Chen');
    const unflagged = applyUnflag(flagged, 'Marcus Williams');
    expect(unflagged.flaggedForReview).toBe(false);
    expect(unflagged.auditTrail?.length).toBe(2);
  });
});

describe('applyReviewAction', () => {
  it('approve clears the flag', () => {
    const flagged: Finding = { ...OPEN_FINDING, flaggedForReview: true };
    const reviewed = applyReviewAction(flagged, 'approve', 'Marcus Williams', 'Looks good');
    expect(reviewed.flaggedForReview).toBe(false);
    expect(reviewed.auditTrail?.some((e) => e.action.includes('approved'))).toBe(true);
  });

  it('request-changes keeps the flag', () => {
    const flagged: Finding = { ...OPEN_FINDING, flaggedForReview: true };
    const reviewed = applyReviewAction(flagged, 'request-changes', 'Marcus Williams');
    expect(reviewed.flaggedForReview).toBe(true);
  });

  it('escalate keeps the flag', () => {
    const flagged: Finding = { ...OPEN_FINDING, flaggedForReview: true };
    const reviewed = applyReviewAction(flagged, 'escalate', 'Marcus Williams', 'Needs committee');
    expect(reviewed.flaggedForReview).toBe(true);
    expect(reviewed.auditTrail?.some((e) => e.action.includes('escalated'))).toBe(true);
  });
});
