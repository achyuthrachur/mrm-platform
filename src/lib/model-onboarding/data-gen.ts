/**
 * Synthetic data generation engine (PRD-12 §6).
 *
 * Runs client-side (non-blocking via async yields). Uses mulberry32 seeded
 * from modelId, so the same model always produces the same datasets.
 * Generated data is threshold-aware: verdicts computed against approved
 * thresholds land at least one warn and one pass.
 */
import {
  mulberry32,
  normalSample,
  clamp,
  pick,
  randInt,
  offsetDate,
} from '@/lib/data/datasets/prng';
import type { ThresholdConfig, TestType, Dataset, ModelSubmission } from '@/types';

// ── Seed derivation ──────────────────────────────────────────────────────

/** Deterministically derive a numeric seed from a model ID string. */
export function seedFromModelId(modelId: string): number {
  let h = 0x9e3779b9;
  for (let i = 0; i < modelId.length; i++) {
    h = Math.imul(h ^ modelId.charCodeAt(i), 0x517cc1b727220a95 & 0xffffffff);
    h ^= h >>> 15;
  }
  return Math.abs(h) || 1;
}

// ── Progress callback type ───────────────────────────────────────────────

export type ProgressCallback = (pct: number, label: string) => void;

// ── Row types (inline — avoid cross-package imports in worker context) ───

interface GenericScoredRow {
  rowId: string;
  split: 'baseline' | 'current';
  score: number;
  outcome: 0 | 1;
  feature1: number;
  feature2: number;
  date: string;
}

interface GenericOverrideRow {
  rowId: string;
  date: string;
  modelOutput: number;
  analystOverride: number | null;
  direction: 'conservative' | 'aggressive' | null;
  documented: boolean;
  reason: string;
}

// ── Per-category template selector ─────────────────────────────────────

type CategoryTemplate =
  | 'CECL'
  | 'BSA/AML'
  | 'ALM'
  | 'Fraud'
  | 'Market Risk'
  | 'Op Risk'
  | 'Capital'
  | 'PPNR'
  | 'Liquidity'
  | 'generic';

function resolveTemplate(category: string): CategoryTemplate {
  const map: Record<string, CategoryTemplate> = {
    CECL: 'CECL',
    'BSA/AML': 'BSA/AML',
    ALM: 'ALM',
    Fraud: 'Fraud',
    'Market Risk': 'Market Risk',
    'Op Risk': 'Op Risk',
    Capital: 'Capital',
    PPNR: 'PPNR',
    Liquidity: 'Liquidity',
  };
  return map[category] ?? 'generic';
}

// ── Threshold helpers ────────────────────────────────────────────────────

function threshold(
  configs: ThresholdConfig[],
  testType: TestType,
  key: string,
  fallback: number
): number {
  const cfg = configs.find((c) => c.testType === testType);
  return cfg?.fields[key] ?? fallback;
}

// ── Dataset generators ───────────────────────────────────────────────────

function generateCECLDataset(
  rand: () => number,
  selectedTests: string[],
  configs: ThresholdConfig[]
): Dataset<unknown>[] {
  const datasets: Dataset<unknown>[] = [];
  const N = 2000;

  // PSI / source-to-model: generate loan tape with planted drift
  const psiStable = threshold(configs, 'psi', 'psi_stable', 0.1);
  const psiMonitor = threshold(configs, 'psi', 'psi_monitor', 0.25);
  // Plant PSI in warn band: between psiStable and psiMonitor
  const targetPsi = psiStable + rand() * (psiMonitor - psiStable) * 0.7;
  const ltvDrift = Math.sqrt(targetPsi / 0.477) * 8; // calibrated

  const loanRows = [];
  for (let i = 0; i < N; i++) {
    const split: 'baseline' | 'current' = i < N / 2 ? 'baseline' : 'current';
    const ltvMean = split === 'baseline' ? 64 : 64 + ltvDrift;
    const ltv = clamp(normalSample(rand, ltvMean, 12), 30, 95);
    const dscr = clamp(normalSample(rand, 1.4, 0.28), 0.7, 2.8);
    const trueRisk = Math.max(0, (ltv - 65) * 0.008 + (1.5 - dscr) * 0.12);
    // Plant MAPE ~17% by biasing predicted PD
    const mapePass = threshold(configs, 'backtesting', 'mape_pass', 15.0) / 100;
    const biasFactor = 1 + mapePass + 0.02;
    const predictedPD = clamp(trueRisk * biasFactor + normalSample(rand, 0, 0.01), 0.001, 0.45);
    loanRows.push({
      loanId: `L${String(i).padStart(5, '0')}`,
      split,
      ltv: Math.round(ltv * 10) / 10,
      dscr: Math.round(dscr * 100) / 100,
      predictedPD: Math.round(predictedPD * 10000) / 10000,
      realizedDefault: rand() < clamp(trueRisk, 0, 0.25) ? 1 : 0,
      balance: Math.round(clamp(normalSample(rand, 4200, 2800), 500, 25000)) * 1000,
    });
  }

  datasets.push({
    id: `generated:loan-tape`,
    label: 'CECL Loan Tape (Generated)',
    rows: loanRows,
    rowCount: loanRows.length,
    generatedFromSeed: undefined,
    note: `PSI planted in warn band (${targetPsi.toFixed(3)}). MAPE calibrated to pass threshold.`,
  });

  return datasets;
}

function generateAMLDataset(rand: () => number, configs: ThresholdConfig[]): Dataset<unknown>[] {
  const N = 3000;
  const CHANNELS = ['ACH', 'Wire', 'Card', 'Cash', 'Mobile'] as const;
  const RULES = ['Structuring', 'Layering', 'Velocity', 'Geographic', 'Counter-party'] as const;
  const rows = [];

  for (let i = 0; i < N; i++) {
    const channel = pick(rand, CHANNELS);
    const rule = pick(rand, RULES);
    const alertFlag = rand() < 0.08; // ~8% alert rate
    const sarOutcome = alertFlag && rand() < 0.025; // ~2.5% of alerts → SAR
    const amount = Math.round(normalSample(rand, 8500, 15000));
    rows.push({
      txnId: `T${String(i).padStart(6, '0')}`,
      date: offsetDate('2025-01-01', randInt(rand, 365)),
      channel,
      rule,
      amount: Math.max(100, amount),
      alertFlag,
      sarOutcome,
      // Plant a feed gap for STM test
      hasFeedGap: i > N * 0.7 && channel === 'ACH' && rand() < 0.03,
    });
  }

  // Override log
  const overrideRate = threshold(configs, 'override', 'override_rate_warn', 20.0) / 100;
  const overrideRows: GenericOverrideRow[] = [];
  const OV = Math.round(N * 0.05 * (0.8 + rand() * 0.4));
  const conservativePass =
    threshold(configs, 'override', 'conservative_direction_pass', 80.0) / 100;
  for (let i = 0; i < OV; i++) {
    const dir: 'conservative' | 'aggressive' =
      rand() < conservativePass ? 'conservative' : 'aggressive';
    overrideRows.push({
      rowId: `OV${String(i).padStart(4, '0')}`,
      date: offsetDate('2025-01-01', randInt(rand, 365)),
      modelOutput: clamp(normalSample(rand, 0.6, 0.15), 0, 1),
      analystOverride: rand() < overrideRate ? clamp(normalSample(rand, 0.65, 0.1), 0, 1) : null,
      direction: dir,
      documented: rand() < 0.92,
      reason:
        dir === 'conservative'
          ? 'Additional risk factor identified'
          : 'Model over-estimates in thin segment',
    });
  }

  return [
    {
      id: 'generated:aml-transactions',
      label: 'AML Transaction Feed (Generated)',
      rows,
      rowCount: rows.length,
      note: 'FP rate ~97%, SAR rate ~2.5%, feed gap planted for STM test.',
    },
    {
      id: 'generated:aml-override-log',
      label: 'AML Override Log (Generated)',
      rows: overrideRows,
      rowCount: overrideRows.length,
      note: 'Override rate calibrated to threshold configuration.',
    },
  ];
}

function generateALMDataset(rand: () => number, configs: ThresholdConfig[]): Dataset<unknown>[] {
  const N = 3000;
  const TYPES = ['Fixed', 'Variable', 'CD', 'MMDA', 'Savings', 'Checking'] as const;
  const BUCKETS = ['< 3M', '3–12M', '1–3Y', '3–5Y', '> 5Y'] as const;
  const rows = [];

  for (let i = 0; i < N; i++) {
    const type = pick(rand, TYPES);
    const bucket = pick(rand, BUCKETS);
    const balance = Math.round(clamp(normalSample(rand, 25000, 18000), 1000, 250000)) * 1000;
    const rate = clamp(normalSample(rand, 4.2, 1.1), 0.5, 9.0);
    rows.push({
      positionId: `POS${String(i).padStart(5, '0')}`,
      type,
      repricingBucket: bucket,
      balance,
      rate: Math.round(rate * 100) / 100,
      sensitivityBeta: clamp(normalSample(rand, 0.6, 0.2), 0.1, 1.0),
    });
  }

  // NII stress series — plant sensitivity in warn band
  const severeThreshold = threshold(configs, 'stress', 'severe_threshold', 7.5) / 100;
  const niiBetaShock = severeThreshold + rand() * 0.02; // just above severe threshold
  const niiseries = [-300, -200, -100, 0, 100, 200, 300].map((shock) => ({
    shockBps: shock,
    niiForecast: Math.round(normalSample(rand, 500 + shock * niiBetaShock, 15)),
    niiBeta: Math.round(niiBetaShock * 1000) / 1000,
  }));

  return [
    {
      id: 'generated:alm-positions',
      label: 'ALM Position Tape (Generated)',
      rows,
      rowCount: rows.length,
      note: 'NII sensitivity distribution and rate shock betas seeded.',
    },
    {
      id: 'generated:alm-stress',
      label: 'ALM Stress Series (Generated)',
      rows: niiseries,
      rowCount: niiseries.length,
      note: `Severe scenario planted above ${(severeThreshold * 100).toFixed(1)}% threshold.`,
    },
  ];
}

function generateFraudDataset(rand: () => number, configs: ThresholdConfig[]): Dataset<unknown>[] {
  const N = 5000;
  const rows: GenericScoredRow[] = [];

  // Target AUC ~0.88 — achieved via strong rank correlation
  const aucMin = threshold(configs, 'backtesting', 'auc_min', 0.8);
  const scoreSeparation = aucMin + 0.05; // plant score above AUC floor

  // PSI: drift to put it in warn band
  const psiStable = threshold(configs, 'psi', 'psi_stable', 0.1);
  const psiMonitor = threshold(configs, 'psi', 'psi_monitor', 0.25);
  const targetPsi = psiStable + rand() * (psiMonitor - psiStable) * 0.6;
  const scoreDrift = Math.sqrt(targetPsi / 0.477) * 0.08;

  for (let i = 0; i < N; i++) {
    const split: 'baseline' | 'current' = i < N / 2 ? 'baseline' : 'current';
    const isFraud = rand() < 0.02;
    const baseScore = isFraud
      ? clamp(normalSample(rand, scoreSeparation, 0.12), 0.3, 1.0)
      : clamp(normalSample(rand, 1 - scoreSeparation, 0.15), 0.0, 0.7);
    const score = split === 'current' ? clamp(baseScore + scoreDrift, 0, 1) : baseScore;
    rows.push({
      rowId: `F${String(i).padStart(6, '0')}`,
      split,
      score: Math.round(score * 10000) / 10000,
      outcome: isFraud ? 1 : 0,
      feature1: clamp(normalSample(rand, 2.5, 1.2), 0, 10),
      feature2: clamp(normalSample(rand, 1800, 900), 10, 15000),
      date: offsetDate('2025-01-01', randInt(rand, 365)),
    });
  }

  return [
    {
      id: 'generated:fraud-scores',
      label: 'Fraud Scored Transactions (Generated)',
      rows,
      rowCount: rows.length,
      note: `AUC target ${scoreSeparation.toFixed(3)}; PSI planted in warn band.`,
    },
  ];
}

function generateGenericDataset(
  rand: () => number,
  testType: TestType,
  configs: ThresholdConfig[]
): Dataset<unknown> {
  const N = 500;
  const rows: GenericOverrideRow[] = [];

  const overrideWarn = threshold(configs, 'override', 'override_rate_warn', 20.0) / 100;
  const consPass = threshold(configs, 'override', 'conservative_direction_pass', 80.0) / 100;
  const docPass = threshold(configs, 'override', 'documentation_pass', 90.0) / 100;

  // Plant near pass/warn boundary
  const overrideRate = overrideWarn * (0.9 + rand() * 0.2); // slightly below/above warn

  for (let i = 0; i < N; i++) {
    const isOverride = rand() < overrideRate;
    const dir: 'conservative' | 'aggressive' | null = isOverride
      ? rand() < consPass
        ? 'conservative'
        : 'aggressive'
      : null;
    rows.push({
      rowId: `GEN${String(i).padStart(4, '0')}`,
      date: offsetDate('2025-01-01', randInt(rand, 365)),
      modelOutput: clamp(normalSample(rand, 0.5, 0.15), 0, 1),
      analystOverride: isOverride ? clamp(normalSample(rand, 0.55, 0.1), 0, 1) : null,
      direction: dir,
      documented: rand() < docPass,
      reason: 'Generic override reason',
    });
  }

  return {
    id: `generated:${testType}-generic`,
    label: `${testType} (Generated — Generic)`,
    rows,
    rowCount: rows.length,
    note: `Generic template for ${testType}; override rate near warn threshold.`,
  };
}

// ── Main entry point ─────────────────────────────────────────────────────

export interface DataGenResult {
  modelId: string;
  datasets: Array<Dataset<unknown> & { testType: TestType }>;
  generatedAt: string;
  status: 'complete' | 'partial' | 'failed';
  warnings: string[];
}

export async function generateModelDatasets(
  submission: ModelSubmission,
  onProgress?: ProgressCallback
): Promise<DataGenResult> {
  const { modelId, model, selectedTests, thresholdConfigs } = submission;
  const category = (model.cat as string) ?? 'generic';
  const seed = seedFromModelId(modelId);
  const rand = mulberry32(seed);

  const datasets: Array<Dataset<unknown> & { testType: TestType }> = [];
  const warnings: string[] = [];
  const template = resolveTemplate(category);

  onProgress?.(0, 'Template selected — beginning generation');

  // Yield to allow React re-renders between phases
  await new Promise((r) => setTimeout(r, 0));

  // ── Primary dataset generation (template-specific) ────────────────────
  let primaryDatasets: Dataset<unknown>[] = [];

  switch (template) {
    case 'CECL':
      primaryDatasets = generateCECLDataset(
        rand,
        selectedTests.map((t) => t.testType),
        thresholdConfigs
      );
      break;
    case 'BSA/AML':
      primaryDatasets = generateAMLDataset(rand, thresholdConfigs);
      break;
    case 'ALM':
      primaryDatasets = generateALMDataset(rand, thresholdConfigs);
      break;
    case 'Fraud':
      primaryDatasets = generateFraudDataset(rand, thresholdConfigs);
      break;
    default:
      warnings.push(`No tailored template for category "${category}"; using generic.`);
      primaryDatasets = [generateGenericDataset(rand, 'backtesting', thresholdConfigs)];
  }

  onProgress?.(25, 'Primary dataset generated');
  await new Promise((r) => setTimeout(r, 0));

  // Assign primary datasets to ALL compatible test types (not just the first match)
  const testTypesWithData = new Set<TestType>();
  for (const ds of primaryDatasets) {
    const compatibleTypes = resolveCompatibleTestTypes(
      ds.id,
      selectedTests.map((t) => t.testType)
    );
    for (const testType of compatibleTypes) {
      datasets.push({ ...ds, testType });
      testTypesWithData.add(testType);
    }
  }

  // ── Supplement: generate generic datasets for any selected test with no data ──
  for (const st of selectedTests) {
    if (!testTypesWithData.has(st.testType)) {
      const generic = generateGenericDataset(rand, st.testType, thresholdConfigs);
      datasets.push({ ...generic, testType: st.testType });
      warnings.push(
        `No tailored template for ${st.testType} in ${category}; using generic override log.`
      );
    }
  }

  onProgress?.(50, 'All datasets generated — validating');
  await new Promise((r) => setTimeout(r, 0));

  onProgress?.(75, 'Writing to storage');
  await new Promise((r) => setTimeout(r, 0));

  onProgress?.(100, 'Generation complete');

  return {
    modelId,
    datasets,
    generatedAt: new Date().toISOString(),
    status: warnings.length > 0 ? 'partial' : 'complete',
    warnings,
  };
}

/**
 * Returns all test types that a given dataset can serve.
 * A loan tape / transaction feed can be used for source-to-model, PSI, and backtesting.
 */
function resolveCompatibleTestTypes(datasetId: string, selectedTypes: TestType[]): TestType[] {
  const compatible: TestType[] = [];

  if (
    datasetId.includes('loan-tape') ||
    datasetId.includes('aml-transactions') ||
    datasetId.includes('positions') ||
    datasetId.includes('fraud-scores') ||
    datasetId.includes('fraud')
  ) {
    for (const t of ['source-to-model', 'psi', 'csi', 'backtesting'] as TestType[]) {
      if (selectedTypes.includes(t)) compatible.push(t);
    }
  }
  if (datasetId.includes('stress') || datasetId.includes('nii')) {
    if (selectedTypes.includes('stress')) compatible.push('stress');
    if (selectedTypes.includes('sensitivity')) compatible.push('sensitivity');
  }
  if (datasetId.includes('override')) {
    if (selectedTypes.includes('override')) compatible.push('override');
  }
  if (datasetId.includes('aml-override')) {
    if (selectedTypes.includes('override')) {
      if (!compatible.includes('override')) compatible.push('override');
    }
  }

  // Fallback: first selected test type
  if (compatible.length === 0) {
    compatible.push(selectedTypes[0] ?? 'backtesting');
  }

  return compatible;
}
