'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getFindings, saveFinding } from '@/lib/repo';
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

  async function updateFinding(finding: Finding): Promise<void> {
    await saveFinding(finding);
    setFindings((prev) => prev.map((f) => (f.id === finding.id ? finding : f)));
  }

  async function createFinding(finding: Finding): Promise<void> {
    await saveFinding(finding);
    setFindings((prev) => [finding, ...prev]);
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
