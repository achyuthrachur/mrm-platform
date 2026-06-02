import { NII_SENSITIVITY_INPUTS } from '@/lib/data/datasets/alm-positions';
import { varianceShares } from './stats';
import type { TestResult, MetricRow, FormulaTrace } from '@/types';
import { getToday } from '@/lib/clock';

interface SensitivityInput {
  modelId: string;
  period?: string;
}

export function runSensitivity(input: SensitivityInput): TestResult {
  if (input.modelId === 'ALM-2024-001') return runNIISensitivity(input);
  if (input.modelId === 'CECL-2024-003') return runMortgageSensitivity(input);
  throw new Error(`No sensitivity engine for model ${input.modelId}`);
}

function runNIISensitivity(input: SensitivityInput): TestResult {
  const period = input.period ?? 'Q4 2025';

  const effects = NII_SENSITIVITY_INPUTS.map((s) => s.effect);
  const shares = varianceShares(effects);
  const maxShare = Math.max(...shares);
  const maxVar = NII_SENSITIVITY_INPUTS[shares.indexOf(maxShare)];

  // warn: any factor > 33% (approaching the 50% dominance limit — planted: deposit beta at 35.8%)
  const singleFactorBreach = maxShare > 0.5;
  const singleFactorApproach = maxShare > 0.33;
  const verdict: 'pass' | 'warn' | 'fail' = singleFactorBreach
    ? 'fail'
    : singleFactorApproach
      ? 'warn'
      : 'pass';

  const metrics: MetricRow[] = NII_SENSITIVITY_INPUTS.map((inp, i) => ({
    label: inp.variable,
    value: `${(shares[i] * 100).toFixed(1)}%`,
    threshold: '< 50% single-factor limit',
    status:
      shares[i] > 0.5 ? 'fail' : shares[i] > 0.35 ? 'warn' : ('pass' as 'pass' | 'warn' | 'fail'),
    note: `Effect: ${inp.effect > 0 ? '+' : ''}$${inp.effect}M NII`,
  }));

  const formula: FormulaTrace = {
    name: 'NII Sensitivity — Variance Share Decomposition (Tornado)',
    equation: 'shareᵢ = |effectᵢ| / Σⱼ |effectⱼ|',
    inputs: {
      'Variables Analyzed': NII_SENSITIVITY_INPUTS.length,
      'Total Absolute Effect': `$${effects.reduce((s, e) => s + Math.abs(e), 0).toFixed(1)}M`,
      'Dominant Variable': maxVar.variable,
      'Single-Factor Limit': '50%',
    },
    steps: [
      {
        label: 'Compute NII effect of each input variable (±shock)',
        expression: 'effect_i = NII(input_i ± σ) − NII(baseline)',
        value: NII_SENSITIVITY_INPUTS.map((s) => `${s.variable}: $${s.effect}M`).join('; '),
      },
      {
        label: 'Compute total absolute effect',
        expression: `total = Σ |effect_i| = ${effects.reduce((s, e) => s + Math.abs(e), 0).toFixed(1)}M`,
        value: `$${effects.reduce((s, e) => s + Math.abs(e), 0).toFixed(1)}M`,
      },
      {
        label: 'Compute variance shares (tornado)',
        expression: 'share_i = |effect_i| / total',
        value: NII_SENSITIVITY_INPUTS.map(
          (s, i) => `${s.variable}: ${(shares[i] * 100).toFixed(1)}%`
        ).join('; '),
      },
      {
        label: 'Check single-factor dominance (> 50%)',
        expression: `max share = ${maxVar.variable} at ${(maxShare * 100).toFixed(1)}%`,
        value: singleFactorBreach
          ? `WARN — ${maxVar.variable} at ${(maxShare * 100).toFixed(1)}% (below 50% but elevated)`
          : 'PASS',
      },
    ],
    result: `Max share: ${maxVar.variable} = ${(maxShare * 100).toFixed(1)}%`,
    reference: 'SR 11-7 §II.C — Sensitivity Analysis',
  };

  return {
    testType: 'sensitivity',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : 'Yellow',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['ALM System (IPS Sendero)', 'Core Deposit Study'],
    computed: true,
    formula,
    metrics,
    chartType: 'tornado',
    chartData: {
      variables: NII_SENSITIVITY_INPUTS.map((s) => s.variable),
      effects: NII_SENSITIVITY_INPUTS.map((s) => s.effect),
      shares: NII_SENSITIVITY_INPUTS.map((_, i) => shares[i]),
    },
    findings:
      verdict !== 'pass'
        ? [
            `${maxVar.variable} accounts for ${(maxShare * 100).toFixed(1)}% of NII variance — near the 50% single-factor dominance limit. High concentration in a single assumption warrants stress-testing of that assumption independently.`,
          ]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Conduct independent stress test of deposit beta assumptions. Consider expanding sensitivity analysis to include non-parallel rate scenarios (flattener, steepener).'
        : 'NII variance well-distributed across inputs. No single factor dominates. Continue quarterly monitoring.',
  };
}

function runMortgageSensitivity(input: SensitivityInput): TestResult {
  const period = input.period ?? 'Q4 2025';

  // Illustrative-but-computed sensitivity for Consumer Mortgage PD
  const mortgageInputs = [
    { variable: 'FICO Score', effect: -0.0065, pctShare: 48.2 },
    { variable: 'LTV', effect: 0.0053, pctShare: 28.1 },
    { variable: 'Origination Channel', effect: 0.0025, pctShare: 14.6 },
    { variable: 'Vintage', effect: 0.0012, pctShare: 9.1 },
  ];

  const effects = mortgageInputs.map((s) => s.effect);
  const shares = varianceShares(effects);
  const maxShare = Math.max(...shares);
  const maxVar = mortgageInputs[shares.indexOf(maxShare)];
  const singleFactorBreach = maxShare > 0.5;

  const verdict: 'pass' | 'warn' | 'fail' = singleFactorBreach ? 'warn' : 'pass';

  const metrics: MetricRow[] = mortgageInputs.map((inp, i) => ({
    label: inp.variable,
    value: `${(shares[i] * 100).toFixed(1)}%`,
    threshold: '< 50%',
    status:
      shares[i] > 0.5 ? 'fail' : shares[i] > 0.4 ? 'warn' : ('pass' as 'pass' | 'warn' | 'fail'),
    note: `Effect: ${Math.abs(inp.effect * 100).toFixed(3)}pp PD change`,
  }));

  const formula: FormulaTrace = {
    name: 'Mortgage PD Sensitivity — Variance Share Decomposition',
    equation: 'shareᵢ = |effectᵢ| / Σⱼ |effectⱼ|',
    inputs: {
      Variables: mortgageInputs.length,
      'Single-Factor Limit': '50%',
      'Dominant Factor': maxVar.variable,
    },
    steps: [
      {
        label: 'Shock each input and measure PD change',
        expression: 'Δ PD per input',
        value: mortgageInputs
          .map((s) => `${s.variable}: ${(s.effect * 100).toFixed(3)}pp`)
          .join('; '),
      },
      {
        label: 'Compute variance shares',
        expression: 'shareᵢ = |effectᵢ| / total',
        value: mortgageInputs
          .map((s, i) => `${s.variable}: ${(shares[i] * 100).toFixed(1)}%`)
          .join('; '),
      },
      {
        label: 'Check single-factor limit',
        expression: `max = ${maxVar.variable} at ${(maxShare * 100).toFixed(1)}%`,
        value: verdict.toUpperCase(),
      },
    ],
    result: `Max share: ${maxVar.variable} = ${(maxShare * 100).toFixed(1)}%`,
    reference: 'SR 11-7 §II.C — Sensitivity Analysis',
  };

  return {
    testType: 'sensitivity',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : 'Yellow',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['Loan Origination System', 'Credit Bureau Data'],
    computed: true,
    formula,
    metrics,
    chartType: 'tornado',
    chartData: { variables: mortgageInputs.map((s) => s.variable), effects, shares: shares },
    findings:
      verdict !== 'pass'
        ? [`${maxVar.variable} approaching 50% variance dominance threshold.`]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Add additional credit variables to reduce FICO concentration.'
        : 'Variance well-distributed. Continue monitoring.',
  };
}
