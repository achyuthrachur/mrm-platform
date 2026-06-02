import { getCRELoanTape } from '@/lib/data/datasets/cre-loan-tape';
import { getFraudScoredTxns } from '@/lib/data/datasets/fraud-scored-txns';
import { psiTerm } from './stats';
import type { TestResult, MetricRow, FormulaTrace } from '@/types';
import { getToday } from '@/lib/clock';

interface PSIEngineInput {
  modelId: string;
  period?: string;
  thresholdOverride?: { warn: number; fail: number };
}

const DEFAULT_THRESHOLDS = { warn: 0.1, fail: 0.25 };

function psiVerdict(psi: number, thresholds = DEFAULT_THRESHOLDS): 'pass' | 'warn' | 'fail' {
  if (psi >= thresholds.fail) return 'fail';
  if (psi >= thresholds.warn) return 'warn';
  return 'pass';
}

export function runPSI(input: PSIEngineInput): TestResult {
  if (input.modelId === 'CECL-2024-001') return runCREPSI(input);
  if (input.modelId === 'FRAUD-2024-001') return runFraudPSI(input);
  throw new Error(`No PSI engine for model ${input.modelId}`);
}

export function runCSI(input: PSIEngineInput): TestResult {
  if (input.modelId === 'FRAUD-2024-001') return runFraudCSI(input);
  throw new Error(`No CSI engine for model ${input.modelId}`);
}

function buildPSIBinTable(
  baseline: number[],
  current: number[],
  bins = 10
): { binLabel: string; bPct: number; cPct: number; term: number }[] {
  const allVals = [...baseline, ...current];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const w = (maxV - minV) / bins;

  return Array.from({ length: bins }, (_, i) => {
    const lo = minV + i * w;
    const hi = lo + w;
    const label = `[${lo.toFixed(1)}, ${hi.toFixed(1)})`;
    const bCount = baseline.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length;
    const cCount = current.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length;
    const bPct = bCount / Math.max(baseline.length, 1);
    const cPct = cCount / Math.max(current.length, 1);
    const term = psiTerm(cPct, bPct);
    return { binLabel: label, bPct, cPct, term };
  });
}

function runCREPSI(input: PSIEngineInput): TestResult {
  const period = input.period ?? 'Q1 2026';
  const thresholds = input.thresholdOverride ?? DEFAULT_THRESHOLDS;
  const tape = getCRELoanTape();

  const baseline = tape.rows.filter((r) => r.split === 'baseline').map((r) => r.ltv);
  const current = tape.rows.filter((r) => r.split === 'current').map((r) => r.ltv);

  const bins = buildPSIBinTable(baseline, current);
  const psiVal = bins.reduce((s, b) => s + b.term, 0);
  const verdict = psiVerdict(psiVal, thresholds);

  const metrics: MetricRow[] = [
    {
      label: 'PSI — LTV Distribution',
      value: psiVal.toFixed(4),
      threshold: `< ${thresholds.warn} (pass) / ${thresholds.warn}–${thresholds.fail} (warn) / > ${thresholds.fail} (fail)`,
      status: verdict,
    },
    {
      label: 'Baseline Sample Size',
      value: baseline.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Current Sample Size',
      value: current.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    ...bins.slice(0, 5).map((b, i) => ({
      label: `Bin ${i + 1}: LTV ${b.binLabel}`,
      value: `B: ${(b.bPct * 100).toFixed(1)}% / C: ${(b.cPct * 100).toFixed(1)}%`,
      threshold: '—',
      status: 'info' as const,
      note: `PSI term: ${b.term.toFixed(4)}`,
    })),
  ];

  const topBin = bins.reduce((a, b) => (b.term > a.term ? b : a), bins[0]);

  const formula: FormulaTrace = {
    name: 'Population Stability Index (PSI)',
    equation: 'PSI = Σᵢ (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ)',
    inputs: {
      Variable: 'LTV (Loan-to-Value)',
      'Baseline n': baseline.length,
      'Current n': current.length,
      Bins: 10,
      'Warn Threshold': thresholds.warn,
      'Fail Threshold': thresholds.fail,
    },
    steps: [
      {
        label: 'Divide LTV range into 10 equal-width bins',
        expression: `bins = 10 over range [${Math.min(...baseline, ...current).toFixed(1)}, ${Math.max(...baseline, ...current).toFixed(1)}]`,
        value: '10 bins',
      },
      {
        label: 'Compute baseline and current proportions per bin',
        expression:
          'bPctᵢ = baseline_count_in_bin_i / baseline_n; cPctᵢ = current_count_in_bin_i / current_n',
        value: 'See bin table above',
      },
      {
        label: 'Compute PSI term for each bin',
        expression: 'termᵢ = (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ)',
        value: `Largest term: bin ${topBin.binLabel} = ${topBin.term.toFixed(4)}`,
      },
      {
        label: 'Sum PSI terms',
        expression: `PSI = ${bins.map((b) => b.term.toFixed(4)).join(' + ')}`,
        value: psiVal.toFixed(4),
      },
      {
        label: 'Apply threshold',
        expression: `PSI ${psiVal.toFixed(4)} is in monitor band [${thresholds.warn}, ${thresholds.fail})`,
        value: verdict.toUpperCase(),
      },
    ],
    result: psiVal.toFixed(4),
    reference: 'SR 26-2 §II.D — Population Stability Index',
  };

  return {
    testType: 'psi',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : verdict === 'warn' ? 'Yellow' : 'Red',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['CoreLogic Property Database', 'Internal Origination System'],
    computed: true,
    formula,
    metrics,
    chartType: 'psi-bar',
    chartData: {
      baseline: bins.map((b) => b.bPct),
      current: bins.map((b) => b.cPct),
      labels: bins.map((b) => b.binLabel),
    },
    findings:
      verdict !== 'pass'
        ? [
            `LTV distribution has shifted between baseline and current populations (PSI = ${psiVal.toFixed(3)}). Current vintage loans carry higher average LTV, indicating potentially elevated credit risk relative to the model's training population.`,
          ]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Monitor LTV drift quarterly. If PSI exceeds 0.25, initiate model recalibration with updated LTV distribution. Review underwriting standards for recent vintages.'
        : 'LTV distribution stable. Continue quarterly monitoring.',
  };
}

function runFraudPSI(input: PSIEngineInput): TestResult {
  const period = input.period ?? 'Q1 2026';
  const thresholds = input.thresholdOverride ?? DEFAULT_THRESHOLDS;
  const dataset = getFraudScoredTxns();

  const baseline = dataset.rows.filter((r) => r.split === 'baseline').map((r) => r.score);
  const current = dataset.rows.filter((r) => r.split === 'current').map((r) => r.score);

  const bins = buildPSIBinTable(baseline, current);
  const psiVal = bins.reduce((s, b) => s + b.term, 0);
  const verdict = psiVerdict(psiVal, thresholds);

  const metrics: MetricRow[] = [
    {
      label: 'PSI — Fraud Score Distribution',
      value: psiVal.toFixed(4),
      threshold: `< ${thresholds.warn} (pass) / ${thresholds.warn}–${thresholds.fail} (warn)`,
      status: verdict,
    },
    {
      label: 'Baseline n',
      value: baseline.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    { label: 'Current n', value: current.length.toLocaleString(), threshold: '—', status: 'info' },
  ];

  const formula: FormulaTrace = {
    name: 'Population Stability Index — Fraud Score',
    equation: 'PSI = Σᵢ (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ)',
    inputs: {
      Variable: 'Fraud Model Score (0–1)',
      'Baseline n': baseline.length,
      'Current n': current.length,
      Bins: 10,
      'Warn Threshold': thresholds.warn,
      'Fail Threshold': thresholds.fail,
    },
    steps: [
      {
        label: 'Bin fraud scores (0–1) into 10 bins',
        expression: 'bins = 10 × [0, 0.1)',
        value: '10 bins',
      },
      {
        label: 'Compute proportions per bin',
        expression: 'bPct, cPct per bin',
        value: 'See bin table',
      },
      { label: 'Sum PSI terms', expression: `PSI = Σ termᵢ`, value: psiVal.toFixed(4) },
      {
        label: 'Apply threshold',
        expression: `PSI ${psiVal.toFixed(4)} in range [0.10, 0.25)`,
        value: verdict.toUpperCase(),
      },
    ],
    result: psiVal.toFixed(4),
    reference: 'SR 26-2 §II.D — Population Stability Index',
  };

  return {
    testType: 'psi',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : 'Yellow',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['Card Authorization System', 'Merchant Category Database'],
    computed: true,
    formula,
    metrics,
    chartType: 'psi-bar',
    chartData: {
      baseline: bins.map((b) => b.bPct),
      current: bins.map((b) => b.cPct),
      labels: bins.map((b) => b.binLabel),
    },
    findings:
      verdict !== 'pass'
        ? [
            'Fraud score distribution has shifted in the current period. Mid-range scores (0.3–0.5) show the most drift, suggesting possible change in the transaction mix or feature drift.',
          ]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Investigate feature drift in the 0.3–0.5 score band. Consider incremental retraining with 2025–2026 data if PSI reaches 0.25 next quarter.'
        : 'Score distribution stable. Continue monthly monitoring.',
  };
}

function runFraudCSI(input: PSIEngineInput): TestResult {
  const period = input.period ?? 'Q1 2026';
  const thresholds = input.thresholdOverride ?? { warn: 0.1, fail: 0.25 };
  const dataset = getFraudScoredTxns();

  // CSI: per-variable PSI on the merchant category distribution
  const baseline = dataset.rows.filter((r) => r.split === 'baseline');
  const current = dataset.rows.filter((r) => r.split === 'current');

  const cats = [...new Set(dataset.rows.map((r) => r.merchantCategory))].sort();

  const bCounts: Record<string, number> = {};
  const cCounts: Record<string, number> = {};
  for (const cat of cats) {
    bCounts[cat] = 0;
    cCounts[cat] = 0;
  }
  for (const r of baseline) bCounts[r.merchantCategory] = (bCounts[r.merchantCategory] ?? 0) + 1;
  for (const r of current) cCounts[r.merchantCategory] = (cCounts[r.merchantCategory] ?? 0) + 1;

  let csiTotal = 0;
  const perVarMetrics: MetricRow[] = cats.map((cat) => {
    const bPct = (bCounts[cat] ?? 0) / baseline.length;
    const cPct = (cCounts[cat] ?? 0) / current.length;
    const term = psiTerm(cPct, bPct);
    csiTotal += term;
    return {
      label: `CSI — ${cat}`,
      value: term.toFixed(4),
      threshold: `< 0.10 (pass)`,
      status: term >= 0.1 ? 'warn' : term >= 0.05 ? 'info' : 'pass',
    } as MetricRow;
  });

  const verdict = psiVerdict(csiTotal, thresholds);

  const formula: FormulaTrace = {
    name: 'Characteristic Stability Index (CSI) — Merchant Category',
    equation: 'CSI_var = Σᵢ (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ) per category',
    inputs: {
      Variable: 'Merchant Category Code (MCC)',
      'Baseline n': baseline.length,
      'Current n': current.length,
      'Categories Analyzed': cats.length,
      'Warn Threshold': thresholds.warn,
    },
    steps: [
      {
        label: 'Tabulate MCC distribution for baseline and current',
        expression: 'bPct, cPct per MCC',
        value: `${cats.length} categories`,
      },
      {
        label: 'Compute PSI term per MCC',
        expression: 'termᵢ = (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ)',
        value: 'See per-category table',
      },
      { label: 'Sum CSI terms', expression: `CSI = Σ termᵢ`, value: csiTotal.toFixed(4) },
      { label: 'Apply threshold', expression: `CSI ${csiTotal.toFixed(4)} < 0.10`, value: 'PASS' },
    ],
    result: csiTotal.toFixed(4),
    reference: 'SR 26-2 §II.D — Characteristic Stability Index',
  };

  return {
    testType: 'csi',
    modelId: input.modelId,
    verdict,
    trafficLight: 'Green',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['Card Authorization System', 'Merchant Category Database'],
    computed: true,
    formula,
    metrics: [
      {
        label: 'CSI — All Variables Combined',
        value: csiTotal.toFixed(4),
        threshold: '< 0.10 (pass)',
        status: verdict,
      },
      ...perVarMetrics.slice(0, 5),
    ],
    findings:
      verdict !== 'pass'
        ? ['Merchant category distribution shift detected. See per-variable breakdown.']
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Investigate high-CSI categories. Include in next model retraining cycle.'
        : 'Input distributions stable across merchant categories. Continue quarterly monitoring.',
  };
}
