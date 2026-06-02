'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getFindings, saveFinding } from '@/lib/repo';
import { getModelsWithFxCounts, saveModel } from '@/lib/repo';
import type { Finding, AuditEntry } from '@/types';

interface FindingsContextValue {
  findings: Finding[];
  loading: boolean;
  getFinding: (id: string) => Finding | null;
  updateFinding: (finding: Finding) => Promise<void>;
  createFinding: (finding: Finding) => Promise<void>;
  appendAuditEntry: (findingId: string, entry: AuditEntry) => Promise<void>;
  refresh: () => Promise<void>;
}

const FindingsContext = createContext<FindingsContextValue>({
  findings: [],
  loading: true,
  getFinding: () => null,
  updateFinding: async () => {},
  createFinding: async () => {},
  appendAuditEntry: async () => {},
  refresh: async () => {},
});

export function FindingsProvider({ children }: { children: React.ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getFindings();
    setFindings(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function getFinding(id: string): Finding | null {
    return findings.find((f) => f.id === id) ?? null;
  }

  /** After any finding mutation that could change openFx, recompute model counts. */
  async function syncModelOpenFx() {
    const updated = await getModelsWithFxCounts();
    // Persist the updated openFx on each model that has changed
    for (const model of updated) {
      await saveModel(model);
    }
  }

  async function updateFinding(finding: Finding): Promise<void> {
    await saveFinding(finding);
    setFindings((prev) => prev.map((f) => (f.id === finding.id ? finding : f)));
    // Recompute openFx whenever status changes (e.g., Open→Closed decrements count)
    await syncModelOpenFx();
  }

  async function createFinding(finding: Finding): Promise<void> {
    await saveFinding(finding);
    setFindings((prev) => [finding, ...prev]);
    // New open finding increments the model's openFx
    await syncModelOpenFx();
  }

  async function appendAuditEntry(findingId: string, entry: AuditEntry): Promise<void> {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;
    const updated: Finding = {
      ...finding,
      auditTrail: [...(finding.auditTrail ?? []), entry],
    };
    await updateFinding(updated);
  }

  return (
    <FindingsContext.Provider
      value={{
        findings,
        loading,
        getFinding,
        updateFinding,
        createFinding,
        appendAuditEntry,
        refresh: load,
      }}
    >
      {children}
    </FindingsContext.Provider>
  );
}

export function useFindings(): FindingsContextValue {
  return useContext(FindingsContext);
}
