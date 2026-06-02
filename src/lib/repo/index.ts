import { MODELS } from '@/lib/data/models';
import { FINDINGS } from '@/lib/data/findings';
import { getMonitoringCalendar } from '@/lib/data/monitoring-calendar';
import { TEST_HISTORY } from '@/lib/data/test-history';
import { getStorageAdapter } from '@/lib/storage/factory';
import { getDatasetById } from '@/lib/data/datasets';
import type { Model, Finding, MonitoringCalendarEntry, TestRun, Dataset } from '@/types';

/**
 * Data-access layer — async, no React.
 * Merges seed data with persisted overrides from the StorageAdapter.
 */

export async function getModels(): Promise<Model[]> {
  const adapter = getStorageAdapter();
  const overrides = await adapter.list('model:');
  if (overrides.length === 0) return MODELS;

  const overrideValues = await Promise.all(overrides.map((k) => adapter.get<Model>(k)));
  const overrideMap = new Map<string, Model>(
    overrides
      .map((k, i) => [k.slice('model:'.length), overrideValues[i]])
      .filter((entry): entry is [string, Model] => entry[1] !== null)
  );

  // Merge: seed models updated by persisted overrides, plus any new user-defined models
  const seedMap = new Map(MODELS.map((m) => [m.id, m]));
  const result: Model[] = MODELS.map((m) => overrideMap.get(m.id) ?? m);

  for (const [id, model] of overrideMap) {
    if (!seedMap.has(id)) result.push(model);
  }

  return result;
}

export async function getModel(id: string): Promise<Model | null> {
  const adapter = getStorageAdapter();
  const override = await adapter.get<Model>(`model:${id}`);
  if (override) return override;
  return MODELS.find((m) => m.id === id) ?? null;
}

/** Models the current user (owner) is assigned to. In demo: Sarah Chen's models. */
export async function getUserModels(userId = 'Sarah Chen'): Promise<Model[]> {
  const models = await getModels();
  return models.filter((m) => m.owner === userId);
}

export async function getFindings(): Promise<Finding[]> {
  const adapter = getStorageAdapter();
  const overrides = await adapter.list('finding:');
  if (overrides.length === 0) return FINDINGS;

  const overrideValues = await Promise.all(overrides.map((k) => adapter.get<Finding>(k)));
  const overrideMap = new Map<string, Finding>(
    overrides
      .map((k, i) => [k.slice('finding:'.length), overrideValues[i]])
      .filter((entry): entry is [string, Finding] => entry[1] !== null)
  );

  const seedMap = new Map(FINDINGS.map((f) => [f.id, f]));
  const result: Finding[] = FINDINGS.map((f) => overrideMap.get(f.id) ?? f);

  for (const [id, finding] of overrideMap) {
    if (!seedMap.has(id)) result.push(finding);
  }

  return result;
}

export async function getFinding(id: string): Promise<Finding | null> {
  const adapter = getStorageAdapter();
  const override = await adapter.get<Finding>(`finding:${id}`);
  if (override) return override;
  return FINDINGS.find((f) => f.id === id) ?? null;
}

export async function saveFinding(finding: Finding): Promise<void> {
  const adapter = getStorageAdapter();
  await adapter.set(`finding:${finding.id}`, finding);
}

export async function saveModel(model: Model): Promise<void> {
  const adapter = getStorageAdapter();
  await adapter.set(`model:${model.id}`, model);
}

export async function getRunHistory(modelId: string): Promise<TestRun[]> {
  const adapter = getStorageAdapter();
  const keys = await adapter.list(`run:${modelId}:`);
  const runs = await Promise.all(keys.map((k) => adapter.get<TestRun>(k)));
  return runs
    .filter((r): r is TestRun => r !== null)
    .sort((a, b) => b.runAt.localeCompare(a.runAt));
}

export async function saveRun(run: TestRun): Promise<void> {
  const adapter = getStorageAdapter();
  await adapter.set(`run:${run.modelId}:${run.id}`, run);
}

export async function getCalendar(modelId: string): Promise<MonitoringCalendarEntry[]> {
  const model = await getModel(modelId);
  if (!model) return [];

  const calendar = getMonitoringCalendar(model);

  // Enrich with test history dots
  const historyMap = new Map<string, (typeof TEST_HISTORY)[number]>();
  TEST_HISTORY.forEach((h) => {
    if (h.modelId === modelId) {
      historyMap.set(h.testType, h);
    }
  });

  // Check for completed runs in the run store
  const runHistory = await getRunHistory(modelId);

  return calendar.map((entry) => {
    const seedHistory = historyMap.get(entry.testType)?.history ?? [];
    const liveRuns = runHistory
      .filter((r) => r.testType === entry.testType)
      .map((r) => ({
        period: r.runAt.slice(0, 7),
        verdict: r.result.verdict,
        runDate: r.runAt.slice(0, 10),
      }));
    return { ...entry, historyDots: [...seedHistory, ...liveRuns] };
  });
}

export function getDataset(id: string): Dataset<unknown> | null {
  return getDatasetById(id);
}

/**
 * Returns all models with openFx computed dynamically from active (non-Closed) findings.
 * This is the source of truth — never rely on the stored openFx integer directly.
 */
export async function getModelsWithFxCounts(): Promise<Model[]> {
  const [models, findings] = await Promise.all([getModels(), getFindings()]);
  const openFxByModel = new Map<string, number>();
  findings
    .filter((f) => f.status !== 'Closed')
    .forEach((f) => openFxByModel.set(f.modelId, (openFxByModel.get(f.modelId) ?? 0) + 1));
  return models.map((m) => ({ ...m, openFx: openFxByModel.get(m.id) ?? 0 }));
}
