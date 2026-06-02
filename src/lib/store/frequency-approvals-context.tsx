'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getStorageAdapter } from '@/lib/storage/factory';
import type { FrequencyApproval } from '@/types';
import { getToday } from '@/lib/clock';

interface FrequencyApprovalsContextValue {
  approvals: FrequencyApproval[];
  pending: FrequencyApproval[];
  submitRequest: (
    request: Omit<FrequencyApproval, 'id' | 'status' | 'requestedAt'>
  ) => Promise<FrequencyApproval>;
  approveRequest: (id: string, reviewedBy: string, note?: string) => Promise<void>;
  rejectRequest: (id: string, reviewedBy: string, note?: string) => Promise<void>;
  getApprovedFrequency: (modelId: string, testType: string) => string | null;
  hasPendingRequest: (modelId: string, testType: string) => boolean;
}

const FrequencyApprovalsContext = createContext<FrequencyApprovalsContextValue>({
  approvals: [],
  pending: [],
  submitRequest: async () => ({
    id: '',
    modelId: '',
    testType: 'backtesting',
    requestedFrequency: '',
    defaultFrequency: '',
    justification: '',
    requestedBy: '',
    requestedAt: '',
    status: 'pending',
  }),
  approveRequest: async () => {},
  rejectRequest: async () => {},
  getApprovedFrequency: () => null,
  hasPendingRequest: () => false,
});

let approvalCounter = 1;

export function FrequencyApprovalsProvider({ children }: { children: React.ReactNode }) {
  const [approvals, setApprovals] = useState<FrequencyApproval[]>([]);

  useEffect(() => {
    async function load() {
      const adapter = getStorageAdapter();
      const keys = await adapter.list('freq-approval:');
      const items = await Promise.all(keys.map((k) => adapter.get<FrequencyApproval>(k)));
      setApprovals(items.filter((i): i is FrequencyApproval => i !== null));
    }
    load();
  }, []);

  async function persist(approval: FrequencyApproval) {
    const adapter = getStorageAdapter();
    await adapter.set(`freq-approval:${approval.id}`, approval);
    setApprovals((prev) => {
      const idx = prev.findIndex((a) => a.id === approval.id);
      if (idx === -1) return [...prev, approval];
      const next = [...prev];
      next[idx] = approval;
      return next;
    });
  }

  async function submitRequest(
    request: Omit<FrequencyApproval, 'id' | 'status' | 'requestedAt'>
  ): Promise<FrequencyApproval> {
    const approval: FrequencyApproval = {
      ...request,
      id: `FREQ-${getToday().replace(/-/g, '')}-${String(approvalCounter++).padStart(3, '0')}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    await persist(approval);
    return approval;
  }

  async function approveRequest(id: string, reviewedBy: string, note?: string) {
    const existing = approvals.find((a) => a.id === id);
    if (!existing) return;
    await persist({
      ...existing,
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote: note,
    });
  }

  async function rejectRequest(id: string, reviewedBy: string, note?: string) {
    const existing = approvals.find((a) => a.id === id);
    if (!existing) return;
    await persist({
      ...existing,
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote: note,
    });
  }

  function getApprovedFrequency(modelId: string, testType: string): string | null {
    const approved = approvals.find(
      (a) => a.modelId === modelId && a.testType === testType && a.status === 'approved'
    );
    return approved?.requestedFrequency ?? null;
  }

  function hasPendingRequest(modelId: string, testType: string): boolean {
    return approvals.some(
      (a) => a.modelId === modelId && a.testType === testType && a.status === 'pending'
    );
  }

  const pending = approvals.filter((a) => a.status === 'pending');

  return (
    <FrequencyApprovalsContext.Provider
      value={{
        approvals,
        pending,
        submitRequest,
        approveRequest,
        rejectRequest,
        getApprovedFrequency,
        hasPendingRequest,
      }}
    >
      {children}
    </FrequencyApprovalsContext.Provider>
  );
}

export function useFrequencyApprovals(): FrequencyApprovalsContextValue {
  return useContext(FrequencyApprovalsContext);
}
