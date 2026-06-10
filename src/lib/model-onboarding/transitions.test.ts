import { describe, it, expect } from 'vitest';
import { transition, canTransition, validActions, auditEntry } from './transitions';
import type { ModelOnboardingStatus } from '@/types';

describe('transitions — valid paths', () => {
  it('draft → submit → awaiting_review', () => {
    expect(transition('draft', 'submit')).toBe('awaiting_review');
  });

  it('awaiting_review → approve → approved', () => {
    expect(transition('awaiting_review', 'approve')).toBe('approved');
  });

  it('awaiting_review → request_changes → changes_requested', () => {
    expect(transition('awaiting_review', 'request_changes')).toBe('changes_requested');
  });

  it('awaiting_review → reject → rejected', () => {
    expect(transition('awaiting_review', 'reject')).toBe('rejected');
  });

  it('changes_requested → resubmit → awaiting_review', () => {
    expect(transition('changes_requested', 'resubmit')).toBe('awaiting_review');
  });

  it('approved → data_gen_complete → ready', () => {
    expect(transition('approved', 'data_gen_complete')).toBe('ready');
  });

  it('approved → data_gen_failed_action → data_gen_failed', () => {
    expect(transition('approved', 'data_gen_failed_action')).toBe('data_gen_failed');
  });

  it('data_gen_failed → retry → approved', () => {
    expect(transition('data_gen_failed', 'retry')).toBe('approved');
  });
});

describe('transitions — illegal transitions throw', () => {
  it('draft → approve throws', () => {
    expect(() => transition('draft', 'approve')).toThrow(/illegal/i);
  });

  it('ready → approve throws (terminal state)', () => {
    expect(() => transition('ready', 'approve')).toThrow(/illegal/i);
  });

  it('rejected → submit throws (terminal state)', () => {
    expect(() => transition('rejected', 'submit')).toThrow(/illegal/i);
  });

  it('rejected → approve throws (terminal state)', () => {
    expect(() => transition('rejected', 'approve')).toThrow(/illegal/i);
  });

  it('awaiting_review → submit throws (cannot re-submit while waiting)', () => {
    expect(() => transition('awaiting_review', 'submit')).toThrow(/illegal/i);
  });

  it('changes_requested → approve throws (must resubmit first)', () => {
    expect(() => transition('changes_requested', 'approve')).toThrow(/illegal/i);
  });

  it('draft → resubmit throws', () => {
    expect(() => transition('draft', 'resubmit')).toThrow(/illegal/i);
  });
});

describe('all 7 states reachable', () => {
  const ALL_STATES: ModelOnboardingStatus[] = [
    'draft',
    'awaiting_review',
    'changes_requested',
    'approved',
    'rejected',
    'ready',
    'data_gen_failed',
  ];

  it('covers all 7 states', () => {
    const reached = new Set<ModelOnboardingStatus>();

    // Draft is the start
    reached.add('draft');

    // draft → awaiting_review
    reached.add(transition('draft', 'submit'));

    // awaiting_review → approved
    reached.add(transition('awaiting_review', 'approve'));

    // approved → ready
    reached.add(transition('approved', 'data_gen_complete'));

    // awaiting_review → changes_requested
    reached.add(transition('awaiting_review', 'request_changes'));

    // awaiting_review → rejected
    reached.add(transition('awaiting_review', 'reject'));

    // approved → data_gen_failed
    reached.add(transition('approved', 'data_gen_failed_action'));

    expect([...reached].sort()).toEqual(ALL_STATES.sort());
  });
});

describe('canTransition', () => {
  it('returns true for valid actions', () => {
    expect(canTransition('draft', 'submit')).toBe(true);
    expect(canTransition('awaiting_review', 'approve')).toBe(true);
  });

  it('returns false for invalid actions', () => {
    expect(canTransition('rejected', 'approve')).toBe(false);
    expect(canTransition('ready', 'submit')).toBe(false);
  });
});

describe('validActions', () => {
  it('draft has only submit', () => {
    expect(validActions('draft')).toEqual(['submit']);
  });

  it('rejected has no actions (terminal)', () => {
    expect(validActions('rejected')).toEqual([]);
  });

  it('ready has no actions (terminal)', () => {
    expect(validActions('ready')).toEqual([]);
  });

  it('awaiting_review has three actions', () => {
    const actions = validActions('awaiting_review');
    expect(actions).toContain('approve');
    expect(actions).toContain('request_changes');
    expect(actions).toContain('reject');
    expect(actions).toHaveLength(3);
  });
});

describe('auditEntry', () => {
  it('builds correct entry for submit', () => {
    const entry = auditEntry('submit', 'Sarah Chen', 'human');
    expect(entry.actor).toBe('Sarah Chen');
    expect(entry.actorType).toBe('human');
    expect(entry.action).toMatch(/submitted/i);
    expect(entry.ts).toBeTruthy();
  });

  it('includes note in changes_requested', () => {
    const entry = auditEntry(
      'request_changes',
      'Marcus Williams',
      'human',
      'PSI threshold too low'
    );
    expect(entry.action).toContain('PSI threshold too low');
  });
});
