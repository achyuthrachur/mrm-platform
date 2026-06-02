'use client';

import { create } from 'zustand';
import { saveRun, getRunHistory } from '@/lib/repo';
import type { TestRun, TestResult, TestType } from '@/types';
import { getToday } from '@/lib/clock';

interface RunStoreState {
  runsByModelTest: Map<string, TestRun[]>;
  currentRun: TestRun | null;
  isRunning: boolean;

  runTest: (params: {
    modelId: string;
    testType: TestType;
    result: TestResult;
    runBy: string;
  }) => Promise<TestRun>;

  getLatestRun: (modelId: string, testType: TestType) => TestRun | null;
  getRunHistory: (modelId: string, testType?: TestType) => TestRun[];
  loadRunHistory: (modelId: string) => Promise<void>;
  clearCurrentRun: () => void;
}

function runKey(modelId: string, testType: TestType): string {
  return `${modelId}:${testType}`;
}

let runCounter = 1;
function generateRunId(): string {
  return `run-${getToday().replace(/-/g, '')}-${String(runCounter++).padStart(4, '0')}`;
}

export const useRunStore = create<RunStoreState>((set, get) => ({
  runsByModelTest: new Map(),
  currentRun: null,
  isRunning: false,

  async runTest({ modelId, testType, result, runBy }) {
    set({ isRunning: true });

    const run: TestRun = {
      id: generateRunId(),
      modelId,
      testType,
      result,
      runAt: new Date().toISOString(),
      runBy,
      runByType: 'human',
    };

    await saveRun(run);

    set((state) => {
      const key = runKey(modelId, testType);
      const existing = state.runsByModelTest.get(key) ?? [];
      const updated = new Map(state.runsByModelTest);
      updated.set(key, [run, ...existing]);
      return { runsByModelTest: updated, currentRun: run, isRunning: false };
    });

    return run;
  },

  getLatestRun(modelId, testType) {
    const key = runKey(modelId, testType);
    const runs = get().runsByModelTest.get(key) ?? [];
    return runs[0] ?? null;
  },

  getRunHistory(modelId, testType) {
    if (testType) {
      const key = runKey(modelId, testType);
      return get().runsByModelTest.get(key) ?? [];
    }
    const all: TestRun[] = [];
    for (const [k, runs] of get().runsByModelTest) {
      if (k.startsWith(modelId + ':')) all.push(...runs);
    }
    return all.sort((a, b) => b.runAt.localeCompare(a.runAt));
  },

  async loadRunHistory(modelId) {
    const runs = await getRunHistory(modelId);
    set((state) => {
      const updated = new Map(state.runsByModelTest);
      for (const run of runs) {
        const key = runKey(run.modelId, run.testType);
        const existing = updated.get(key) ?? [];
        if (!existing.find((r) => r.id === run.id)) {
          existing.push(run);
          updated.set(
            key,
            existing.sort((a, b) => b.runAt.localeCompare(a.runAt))
          );
        }
      }
      return { runsByModelTest: updated };
    });
  },

  clearCurrentRun() {
    set({ currentRun: null });
  },
}));
