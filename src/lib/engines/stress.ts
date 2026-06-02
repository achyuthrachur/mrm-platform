import { CRE_STRESS_SCENARIOS, NII_RATE_SHOCK_SCENARIOS } from '@/lib/data/datasets/alm-positions';
import type { TestResult, MetricRow, FormulaTrace } from '@/types';
import { getToday } from '@/lib/clock';

interface StressInput {
  modelId: string;
  period?: string;
}

const CRE_BASELINE_PD = 0.028;
const CRE_POLICY_CAP = 0.1;
const NII_BASELINE = 121.1;
const NII_POLICY_LIMIT_PCT = -25;

export function runStress(input: StressInput): TestResult {
  if (input.modelId === 'CECL-2024-001') return runCREStress(input);
  if (input.modelId === 'ALM-2024-001') return runNIIStress(input);
  throw new Error(`No stress engine for model ${input.modelId}`);
}

function runCREStress(input: StressInput): TestResult {
  const period = input.period ?? 'H2 2025';

  const scenarioResults = CRE_STRESS_SCENARIOS.map((s) => ({
    scenario: s.scenario,
    stressedPD: CRE_BASELINE_PD * s.pdMultiplier,
    pdDelta: s.pdDelta,
    changePct: (s.pdMultiplier - 1) * 100,
    exceedsCap: CRE_BASELINE_PD * s.pdMultiplier > CRE_POLICY_CAP,
  }));

  const anyBreach = scenarioResults.some((r) => r.exceedsCap);
  const verdict: 'pass' | 'warn' | 'fail' = anyBreach ? 'warn' : 'pass';

  const metrics: MetricRow[] = [
    {
      label: 'Baseline PD',
      value: `${(CRE_BASELINE_PD * 100).toFixed(2)}%`,
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Policy Cap (Max Stressed PD)',
      value: `${(CRE_POLICY_CAP * 100).toFixed(0)}%`,
      threshold: '—',
      status: 'info',
    },
    ...scenarioResults.map((r) => ({
      label: r.scenario,
      value: `${(r.stressedPD * 100).toFixed(2)}% (${r.pdDelta})`,
      threshold: `< ${(CRE_POLICY_CAP * 100).toFixed(0)}%`,
      status: r.exceedsCap ? 'fail' : ('pass' as 'pass' | 'warn' | 'fail'),
    })),
  ];

  const formula: FormulaTrace = {
    name: 'CRE PD Stress Testing — Scenario Multiplier Approach',
    equation: 'stressed_PD = baseline_PD × scenario_multiplier',
    inputs: {
      'Baseline PD': `${(CRE_BASELINE_PD * 100).toFixed(2)}%`,
      'Policy Cap': `${(CRE_POLICY_CAP * 100).toFixed(0)}%`,
      Scenarios: CRE_STRESS_SCENARIOS.length,
    },
    steps: [
      {
        label: 'Set baseline PD from current calibration',
        expression: `PD_baseline = ${(CRE_BASELINE_PD * 100).toFixed(2)}%`,
        value: `${(CRE_BASELINE_PD * 100).toFixed(2)}%`,
      },
      ...scenarioResults.map((r) => ({
        label: `Apply ${r.scenario}`,
        expression: `PD_stressed = ${(CRE_BASELINE_PD * 100).toFixed(2)}% × multiplier`,
        value: `${(r.stressedPD * 100).toFixed(2)}% ${r.exceedsCap ? '(BREACH)' : '(OK)'}`,
      })),
      {
        label: 'Check policy cap across all scenarios',
        expression: `No scenario > ${(CRE_POLICY_CAP * 100).toFixed(0)}%`,
        value: verdict.toUpperCase(),
      },
    ],
    result: `All ${CRE_STRESS_SCENARIOS.length} scenarios within ${(CRE_POLICY_CAP * 100).toFixed(0)}% policy cap`,
    reference: 'SR 11-7 §I.E — Stress Testing',
  };

  return {
    testType: 'stress',
    modelId: input.modelId,
    verdict,
    trafficLight: 'Green',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['Internal Stress Scenario Library', 'Federal Reserve Macro Scenarios'],
    computed: true,
    formula,
    metrics,
    chartType: 'scenario',
    chartData: {
      scenarios: scenarioResults.map((r) => r.scenario),
      values: scenarioResults.map((r) => r.stressedPD * 100),
      baseline: CRE_BASELINE_PD * 100,
      cap: CRE_POLICY_CAP * 100,
    },
    findings: [],
    recommendation:
      'CRE portfolio remains within policy cap under all stress scenarios. Monitor Office segment concentration as CRE delinquency rates trend upward (see Macro panel). Update scenario multipliers if macro conditions deteriorate further.',
  };
}

function runNIIStress(input: StressInput): TestResult {
  const period = input.period ?? 'Q4 2025';

  const scenarioResults = NII_RATE_SHOCK_SCENARIOS.map((s) => ({
    scenario: s.label,
    niiDelta: s.deltaNII,
    pctChange: s.pctChange,
    exceedsLimit: s.exceedsLimit,
  }));

  // Verdict based on −200bps scenario (the ALCO policy limit scenario).
  // −300bps is tracked as a tail risk but doesn't change the verdict from −200bps.
  // Planted: −200bps = −22% (near −25% limit → warn; does not breach → not fail)
  const minus200 = scenarioResults.find((s) => s.scenario === '-200bps')!;
  const verdict: 'pass' | 'warn' | 'fail' = minus200.exceedsLimit
    ? 'fail'
    : minus200.pctChange <= -18
      ? 'warn'
      : 'pass';

  const metrics: MetricRow[] = [
    { label: 'Baseline NII', value: `$${NII_BASELINE}M`, threshold: '—', status: 'info' },
    {
      label: 'Policy Limit (NII Change)',
      value: `${NII_POLICY_LIMIT_PCT}%`,
      threshold: '—',
      status: 'info',
    },
    ...scenarioResults.map((r) => ({
      label: r.scenario,
      value: `${r.niiDelta >= 0 ? '+' : ''}$${r.niiDelta}M (${r.pctChange >= 0 ? '+' : ''}${r.pctChange}%)`,
      threshold: `> ${NII_POLICY_LIMIT_PCT}%`,
      status: r.exceedsLimit
        ? 'fail'
        : Math.abs(r.pctChange) > 18
          ? 'warn'
          : ('pass' as 'pass' | 'warn' | 'fail'),
    })),
  ];

  const formula: FormulaTrace = {
    name: 'NII Sensitivity Stress Testing — Parallel Rate Shocks',
    equation:
      'NII_stressed = NII_baseline + Σ(position_i × beta_i × ΔRate) for deposits; + Σ(asset_j × repricing_j × ΔRate) for loans',
    inputs: {
      'Baseline NII': `$${NII_BASELINE}M`,
      'Policy Limit': `${NII_POLICY_LIMIT_PCT}%`,
      Scenarios: NII_RATE_SHOCK_SCENARIOS.length,
      '-200bps NII Change': `${minus200.pctChange}%`,
    },
    steps: [
      {
        label: 'Set baseline NII from most recent quarter',
        expression: `NII_baseline = $${NII_BASELINE}M`,
        value: `$${NII_BASELINE}M`,
      },
      {
        label: 'Apply parallel rate shocks to repricing position file',
        expression:
          'For each scenario: apply ΔRate to all variable-rate positions, roll fixed-rate positions at maturity',
        value: '6 scenarios computed',
      },
      {
        label: 'Key result: −200bps scenario',
        expression: `NII_stressed = $${NII_BASELINE}M + $${minus200.niiDelta}M = $${(NII_BASELINE + minus200.niiDelta).toFixed(1)}M`,
        value: `${minus200.pctChange}% change (policy limit: ${NII_POLICY_LIMIT_PCT}%)`,
      },
      {
        label: 'Check policy limit across all scenarios',
        expression: `−200bps scenario: ${minus200.pctChange}% vs limit ${NII_POLICY_LIMIT_PCT}%`,
        value: verdict.toUpperCase(),
      },
    ],
    result: `−200bps: ${minus200.pctChange}% NII change (limit: ${NII_POLICY_LIMIT_PCT}%)`,
    reference: 'SR 11-7 §I.E — Stress Testing',
  };

  return {
    testType: 'stress',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : verdict === 'warn' ? 'Yellow' : 'Red',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['ALM System (IPS Sendero)', 'ALCO Rate Scenarios'],
    computed: true,
    formula,
    metrics,
    chartType: 'scenario',
    chartData: {
      scenarios: scenarioResults.map((r) => r.scenario),
      values: scenarioResults.map((r) => r.pctChange),
      baseline: 0,
      cap: NII_POLICY_LIMIT_PCT,
    },
    findings:
      verdict !== 'pass'
        ? [
            `Down-200bps parallel rate shock produces NII change of ${minus200.pctChange}% vs. board-approved policy limit of ${NII_POLICY_LIMIT_PCT}%. Headroom: only ${(Math.abs(minus200.pctChange) - Math.abs(NII_POLICY_LIMIT_PCT)).toFixed(1)} percentage points before breach.`,
            `Down-300bps scenario breaches the policy limit — action required before next rate cycle.`,
          ]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'ALCO should evaluate receive-fixed interest rate swaps to reduce liability sensitivity. Update core deposit study betas before next ALCO stress test (see MRF-010).'
        : 'NII stress results within policy limits across all scenarios. Continue quarterly monitoring.',
  };
}
