import type { TestType } from '@/types';

export interface TestMethodology {
  description: string;
  srRef: string;
  dataUsed: string;
  metrics: string[];
  verdictBands: string;
}

export const TEST_METHODOLOGY: Record<TestType, TestMethodology> = {
  'source-to-model': {
    description:
      'Reconciles the source data file against the model input file to verify completeness and accuracy. Counts matched, missing, and phantom records; flags numeric discrepancies (|Δ| > 0.0005) and text mismatches. A completeness rate below 99% triggers warn; below 95% triggers fail.',
    srRef: 'SR 11-7 §I.D — Data Integrity and Completeness',
    dataUsed: 'Source system extract vs. model input copy',
    metrics: [
      'Completeness rate',
      'Missing records',
      'Phantom records',
      'Numeric discrepancies',
      'Text mismatches',
    ],
    verdictBands: 'Pass: 100% · Warn: 99–100% · Fail: < 99%',
  },
  backtesting: {
    description:
      'Compares model predictions against realized outcomes over a historical lookback window. For PD models: MAPE, bias, Gini/AR. For classification (AML, Fraud): precision, recall, AUC via Wilcoxon rank-sum. For NII: MAPE over 8 quarterly periods, directional accuracy.',
    srRef: 'SR 11-7 §II.B — Ongoing Monitoring: Backtesting',
    dataUsed: 'Historical actuals vs. model predictions (generated synthetic dataset)',
    metrics: ['MAPE', 'Gini / Accuracy Ratio', 'AUC (ROC)', 'Mean bias', 'Directional accuracy'],
    verdictBands: 'Varies by model type — see metrics table after running',
  },
  benchmarking: {
    description:
      "Compares the subject model's performance metric against a peer institution array. Computes the subject's percentile rank and deviation from the peer median. A rank below the 40th percentile triggers warn; below 20th triggers fail.",
    srRef: 'SR 11-7 §I.A — Industry Benchmarking',
    dataUsed: 'Peer institution benchmark array (FinCEN 314(b) / industry study)',
    metrics: ['Subject metric value', 'Peer median', 'Deviation from median', 'Percentile rank'],
    verdictBands: 'Pass: ≥ 40th pct · Warn: 20–40th pct · Fail: < 20th pct',
  },
  sensitivity: {
    description:
      'Decomposes model output variance across input variables to identify which assumptions drive the most uncertainty. Flags any single input contributing more than 50% of total variance (single-factor dominance). For NII: computes deposit betas from the ALM position file.',
    srRef: 'SR 11-7 §II.C — Sensitivity Analysis',
    dataUsed: 'Tornado inputs from ALM position file / model input parameters',
    metrics: ['Variance share per input (%)', 'Total absolute effect', 'Dominant variable'],
    verdictBands: 'Pass: no input > 33% · Warn: 33–50% · Fail: > 50%',
  },
  stress: {
    description:
      "Applies a set of adverse macroeconomic or rate-shock scenarios to the model's baseline output. For CRE PD: scenario multipliers to baseline default rate vs. a 10% policy cap. For NII: parallel rate shocks (±100/200/300bps) vs. board-approved NII policy limit (−25%).",
    srRef: 'SR 11-7 §I.E — Stress Testing',
    dataUsed: 'Scenario set from stress scenario library / ALCO rate scenarios',
    metrics: ['Stressed value per scenario', 'Policy limit headroom', 'Worst-case scenario delta'],
    verdictBands:
      'Pass: no scenario breaches policy limit · Warn: within 5pp of limit · Fail: breaches limit',
  },
  override: {
    description:
      'Analyzes the population of analyst override decisions in the case management system. Measures override rate, the proportion that are conservative (risk-increasing), and documentation completeness. An override rate above 30% or conservative rate below 80% triggers warn.',
    srRef: 'SR 11-7 §II.C — Override Analysis',
    dataUsed: 'Case management system override log',
    metrics: ['Override rate', 'Conservative direction %', 'Documentation rate', 'Cases reviewed'],
    verdictBands: 'Override < 30% and conservative ≥ 80% and documented ≥ 90% → Pass',
  },
  psi: {
    description:
      "Population Stability Index measures the shift in an input variable's distribution between a baseline period and the current period. Uses 10 equal-width bins. PSI < 0.10 is stable; 0.10–0.25 is a monitoring watch; > 0.25 signals significant drift requiring investigation.",
    srRef: 'SR 26-2 §II.D — Population Stability Index',
    dataUsed: 'Baseline split vs. current split of scored transactions',
    metrics: ['PSI value', 'Per-bin baseline%', 'Per-bin current%', 'PSI term per bin'],
    verdictBands: 'Pass: PSI < 0.10 · Warn: 0.10–0.25 · Fail: > 0.25',
  },
  csi: {
    description:
      'Characteristic Stability Index extends PSI to individual model input variables. Computes a per-variable PSI and a combined total across all characteristics. Identifies which specific input is drifting, guiding targeted retraining decisions.',
    srRef: 'SR 26-2 §II.D — Characteristic Stability Index',
    dataUsed: 'Baseline and current transaction populations with all input features',
    metrics: ['CSI per characteristic', 'Combined CSI total', 'Most-drifted variable'],
    verdictBands: 'Pass: CSI < 0.10 per variable · Warn: any variable 0.10–0.25',
  },
};
