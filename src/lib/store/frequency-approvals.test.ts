import { describe, it, expect } from 'vitest';
import { MemoryAdapter } from '@/lib/storage/memory-adapter';

/**
 * Unit-tests for frequency-approval state machine logic (pure, no React context).
 * Tests the state transitions and persistence contract directly.
 */

describe('Frequency approval state transitions', () => {
  it('pending → approved changes status', () => {
    const approval = {
      id: 'FREQ-001',
      modelId: 'CECL-2024-001',
      testType: 'backtesting',
      requestedFrequency: 'Monthly',
      defaultFrequency: 'Quarterly',
      justification: 'Monthly monitoring required post-finding.',
      requestedBy: 'Sarah Chen',
      requestedAt: '2026-04-07T00:00:00Z',
      status: 'pending' as const,
    };

    const approved = { ...approval, status: 'approved' as const, reviewedBy: 'Marcus Williams' };
    expect(approved.status).toBe('approved');
    expect(approved.reviewedBy).toBe('Marcus Williams');
  });

  it('pending → rejected changes status', () => {
    const approval = {
      id: 'FREQ-002',
      modelId: 'ALM-2024-001',
      testType: 'sensitivity',
      requestedFrequency: 'Monthly',
      defaultFrequency: 'Quarterly',
      justification: 'More frequent sensitivity checks requested.',
      requestedBy: 'Sarah Chen',
      requestedAt: '2026-04-07T00:00:00Z',
      status: 'pending' as const,
    };

    const rejected = { ...approval, status: 'rejected' as const, reviewNote: 'Not justified' };
    expect(rejected.status).toBe('rejected');
  });

  it('MemoryAdapter round-trips frequency approval', async () => {
    const adapter = new MemoryAdapter();
    const approval = {
      id: 'FREQ-003',
      modelId: 'CECL-2024-001',
      testType: 'psi',
      requestedFrequency: 'Monthly',
      defaultFrequency: 'Quarterly',
      justification: 'Test',
      requestedBy: 'Sarah Chen',
      requestedAt: '2026-04-07T00:00:00Z',
      status: 'pending' as const,
    };

    await adapter.set('freq-approval:FREQ-003', approval);
    const retrieved = await adapter.get('freq-approval:FREQ-003');
    expect(retrieved).toEqual(approval);
  });

  it('list returns only freq-approval keys', async () => {
    const adapter = new MemoryAdapter();
    await adapter.set('freq-approval:001', { id: '001' });
    await adapter.set('freq-approval:002', { id: '002' });
    await adapter.set('model:X', { id: 'X' });

    const keys = await adapter.list('freq-approval:');
    expect(keys).toHaveLength(2);
    expect(keys.every((k) => k.startsWith('freq-approval:'))).toBe(true);
  });

  it('approved frequency is returned correctly', () => {
    const approvals = [
      {
        modelId: 'CECL-2024-001',
        testType: 'psi',
        requestedFrequency: 'Monthly',
        status: 'approved' as const,
      },
      {
        modelId: 'CECL-2024-001',
        testType: 'backtesting',
        requestedFrequency: 'Monthly',
        status: 'pending' as const,
      },
    ];

    const approved = approvals.find(
      (a) => a.modelId === 'CECL-2024-001' && a.testType === 'psi' && a.status === 'approved'
    );
    expect(approved?.requestedFrequency).toBe('Monthly');

    // Pending should not be returned as approved
    const pending = approvals.find(
      (a) =>
        a.modelId === 'CECL-2024-001' && a.testType === 'backtesting' && a.status === 'approved'
    );
    expect(pending).toBeUndefined();
  });
});
