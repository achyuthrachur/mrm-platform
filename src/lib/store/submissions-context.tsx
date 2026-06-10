'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getSubmission, listSubmissions, saveSubmission, saveModel, saveDataset } from '@/lib/repo';
import { transition, auditEntry } from '@/lib/model-onboarding/transitions';
import { generateModelDatasets } from '@/lib/model-onboarding/data-gen';
import { getToday } from '@/lib/clock';
import type { ModelSubmission, OnboardingAction, Model, AuditEntry } from '@/types';

interface SubmissionsContextValue {
  submissions: ModelSubmission[];
  loading: boolean;
  /** Drafts owned by the current user */
  drafts: ModelSubmission[];
  /** Submissions awaiting MRM review */
  pending: ModelSubmission[];
  /** Returns a single submission by ID */
  getById: (id: string) => ModelSubmission | undefined;
  /** Create or update a draft */
  saveDraft: (submission: ModelSubmission) => Promise<void>;
  /** Submit a draft for MRM review */
  submitForReview: (id: string, actor: string) => Promise<void>;
  /** MRM: approve a submission */
  approve: (id: string, actor: string, note?: string) => Promise<void>;
  /** MRM: request changes */
  requestChanges: (id: string, actor: string, note: string) => Promise<void>;
  /** MRM: reject a submission */
  reject: (id: string, actor: string, note: string) => Promise<void>;
  /** Owner: resubmit after changes */
  resubmit: (id: string, actor: string) => Promise<void>;
  /** Retry failed data generation */
  retryDataGen: (id: string) => Promise<void>;
  /** Refresh from storage */
  refresh: () => Promise<void>;
}

const SubmissionsContext = createContext<SubmissionsContextValue>({
  submissions: [],
  loading: true,
  drafts: [],
  pending: [],
  getById: () => undefined,
  saveDraft: async () => {},
  submitForReview: async () => {},
  approve: async () => {},
  requestChanges: async () => {},
  reject: async () => {},
  resubmit: async () => {},
  retryDataGen: async () => {},
  refresh: async () => {},
});

function generateSubmissionId(): string {
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  return `SUB-${year}-${seq}`;
}

function generateModelId(category: string): string {
  const prefix = category
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 6);
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-3);
  return `${prefix}-${year}-${seq}`;
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<ModelSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await listSubmissions();
    setSubmissions(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function getById(id: string) {
    return submissions.find((s) => s.id === id);
  }

  async function applyTransition(
    id: string,
    action: OnboardingAction,
    actor: string,
    actorType: AuditEntry['actorType'],
    note?: string,
    extraUpdates?: Partial<ModelSubmission>
  ) {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) throw new Error(`Submission ${id} not found`);

    const nextStatus = transition(sub.status, action);
    const entry = auditEntry(action, actor, actorType, note);

    const updated: ModelSubmission = {
      ...sub,
      ...extraUpdates,
      status: nextStatus,
      auditTrail: [...sub.auditTrail, entry],
    };

    await saveSubmission(updated);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }

  async function saveDraft(submission: ModelSubmission) {
    // Assign IDs if new
    const sub: ModelSubmission = {
      ...submission,
      id: submission.id || generateSubmissionId(),
      modelId: submission.modelId || generateModelId(submission.model.cat ?? 'MDL'),
      auditTrail:
        submission.auditTrail.length === 0
          ? [auditEntry('submit', submission.model.owner ?? 'Unknown', 'human')]
          : submission.auditTrail,
    };
    // Ensure status is draft for new submissions
    if (sub.status === 'draft' && sub.auditTrail.length === 1) {
      sub.auditTrail = [
        {
          ts: new Date().toISOString(),
          actor: sub.model.owner ?? 'Unknown',
          actorType: 'human',
          action: 'Draft saved',
        },
      ];
    }

    await saveSubmission(sub);
    setSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.id === sub.id);
      return idx >= 0 ? prev.map((s) => (s.id === sub.id ? sub : s)) : [...prev, sub];
    });
  }

  async function submitForReview(id: string, actor: string) {
    await applyTransition(id, 'submit', actor, 'human', undefined, {
      submittedAt: new Date().toISOString(),
    });
  }

  async function approve(id: string, actor: string, note?: string) {
    const updated = await applyTransition(id, 'approve', actor, 'human', note, {
      reviewedAt: new Date().toISOString(),
      reviewedBy: actor,
      mrmNotes: note ?? '',
      dataGenStatus: 'generating',
      dataGenProgress: 0,
    });

    // Write the approved model to inventory immediately (PRD §5)
    const model: Model = buildApprovedModel(updated);
    await saveModel(model);

    // Start data generation (non-blocking)
    triggerDataGen(updated, model);
  }

  async function requestChanges(id: string, actor: string, note: string) {
    const sub = submissions.find((s) => s.id === id);
    const priorNotes = sub ? [...sub.priorNotes, sub.mrmNotes].filter(Boolean) : [];
    await applyTransition(id, 'request_changes', actor, 'human', note, {
      mrmNotes: note,
      priorNotes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: actor,
    });
  }

  async function reject(id: string, actor: string, note: string) {
    await applyTransition(id, 'reject', actor, 'human', note, {
      mrmNotes: note,
      reviewedAt: new Date().toISOString(),
      reviewedBy: actor,
    });
  }

  async function resubmit(id: string, actor: string) {
    await applyTransition(id, 'resubmit', actor, 'human', undefined, {
      submittedAt: new Date().toISOString(),
    });
  }

  async function retryDataGen(id: string) {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    const updated = await applyTransition(id, 'retry', 'system', 'system', undefined, {
      dataGenStatus: 'generating',
      dataGenProgress: 0,
    });
    const model = buildApprovedModel(updated);
    triggerDataGen(updated, model);
  }

  async function triggerDataGen(submission: ModelSubmission, model: Model) {
    const updateProgress = async (pct: number) => {
      const current = await getSubmission(submission.id);
      if (!current) return;
      const prog: ModelSubmission = { ...current, dataGenProgress: pct };
      await saveSubmission(prog);
      setSubmissions((prev) => prev.map((s) => (s.id === submission.id ? prog : s)));
    };

    try {
      const result = await generateModelDatasets(submission, async (pct) => {
        await updateProgress(pct);
      });

      // Save each dataset to storage
      for (const ds of result.datasets) {
        await saveDataset(submission.modelId, ds.testType, ds);
      }

      // Transition to ready
      const current = await getSubmission(submission.id);
      if (!current) return;
      const entry = auditEntry('data_gen_complete', 'system', 'system');
      const done: ModelSubmission = {
        ...current,
        status: 'ready',
        dataGenStatus: 'complete',
        dataGenProgress: 100,
        auditTrail: [...current.auditTrail, entry],
      };
      await saveSubmission(done);

      // Update model to mark ready
      const readyModel: Model = { ...model, status: 'Active — Monitoring' };
      await saveModel(readyModel);

      setSubmissions((prev) => prev.map((s) => (s.id === submission.id ? done : s)));
    } catch (err) {
      const current = await getSubmission(submission.id);
      if (!current) return;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const entry = auditEntry('data_gen_failed_action', 'system', 'system', msg);
      const failed: ModelSubmission = {
        ...current,
        status: 'data_gen_failed',
        dataGenStatus: 'failed',
        auditTrail: [...current.auditTrail, entry],
      };
      await saveSubmission(failed);
      setSubmissions((prev) => prev.map((s) => (s.id === submission.id ? failed : s)));
    }
  }

  function buildApprovedModel(submission: ModelSubmission): Model {
    const today = getToday();
    const m = submission.model;
    return {
      id: submission.modelId,
      name: m.name ?? 'Unnamed Model',
      cat: m.cat ?? '',
      sub: m.sub ?? '',
      tier: (m.tier ?? 2) as 1 | 2 | 3,
      owner: m.owner ?? '',
      ownerTitle: m.ownerTitle ?? 'Model Owner',
      status: 'Data Generating…',
      risk: (m.tier === 1 ? 'High' : m.tier === 3 ? 'Low' : 'Medium') as 'High' | 'Medium' | 'Low',
      valStatus: 'Pending Initial Validation',
      lastVal: '',
      nextVal: '',
      framework: m.framework ?? '',
      method: m.method ?? '',
      sources: m.sources ?? [],
      openFx: 0,
      totalFx: 0,
      desc: m.desc ?? '',
      limits: m.limits ?? '',
      dataLimits: m.dataLimits ?? '',
      monFreq: 'Quarterly',
      approvedBy: submission.reviewedBy ?? '',
      approvalDate: today,
      userDefined: true,
      selectedTests: submission.selectedTests,
    };
  }

  const drafts = submissions.filter(
    (s) => s.status === 'draft' || s.status === 'changes_requested'
  );
  const pending = submissions.filter((s) => s.status === 'awaiting_review');

  return (
    <SubmissionsContext.Provider
      value={{
        submissions,
        loading,
        drafts,
        pending,
        getById,
        saveDraft,
        submitForReview,
        approve,
        requestChanges,
        reject,
        resubmit,
        retryDataGen,
        refresh: load,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions(): SubmissionsContextValue {
  return useContext(SubmissionsContext);
}
