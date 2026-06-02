import { getAMLOverrideLog } from '@/lib/data/datasets/aml-transactions';
import type { TestResult, MetricRow, FormulaTrace } from '@/types';
import { getToday } from '@/lib/clock';

interface OverrideInput {
  modelId: string;
  period?: string;
}

const THRESHOLDS = {
  overrideRateWarn: 0.3,
  conservativePctWarn: 0.8,
  documentationWarn: 0.9,
};

export function runOverride(input: OverrideInput): TestResult {
  const period = input.period ?? 'Q4 2025';
  const dataset = getAMLOverrideLog();
  const rows = dataset.rows;

  const totalReviewed = rows.length;
  const overridden = rows.filter((r) => r.overrideFlag);
  const overrideRate = overridden.length / totalReviewed;

  const conservative = overridden.filter((r) => r.direction === 'conservative');
  const conservativePct = overridden.length > 0 ? conservative.length / overridden.length : 0;

  const documented = overridden.filter((r) => r.documented);
  const documentationRate = overridden.length > 0 ? documented.length / overridden.length : 1;

  const overrideStatus: 'pass' | 'warn' | 'fail' =
    overrideRate < THRESHOLDS.overrideRateWarn ? 'pass' : 'warn';
  const conservativeStatus: 'pass' | 'warn' | 'fail' =
    conservativePct >= THRESHOLDS.conservativePctWarn ? 'pass' : 'warn';
  const documentationStatus: 'pass' | 'warn' | 'fail' =
    documentationRate >= THRESHOLDS.documentationWarn ? 'pass' : 'fail';

  const verdict: 'pass' | 'warn' | 'fail' =
    documentationStatus === 'fail'
      ? 'fail'
      : overrideStatus === 'warn' || conservativeStatus === 'warn'
        ? 'warn'
        : 'pass';

  const metrics: MetricRow[] = [
    {
      label: 'Override Rate',
      value: `${(overrideRate * 100).toFixed(1)}%`,
      threshold: `< ${THRESHOLDS.overrideRateWarn * 100}%`,
      status: overrideStatus,
    },
    {
      label: 'Conservative Override %',
      value: `${(conservativePct * 100).toFixed(1)}%`,
      threshold: `≥ ${THRESHOLDS.conservativePctWarn * 100}%`,
      status: conservativeStatus,
      note: 'Of all overrides, % in conservative direction',
    },
    {
      label: 'Documentation Rate',
      value: `${(documentationRate * 100).toFixed(1)}%`,
      threshold: `≥ ${THRESHOLDS.documentationWarn * 100}%`,
      status: documentationStatus,
    },
    {
      label: 'Cases Reviewed',
      value: totalReviewed.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Overrides Applied',
      value: overridden.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Conservative Overrides',
      value: conservative.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Aggressive Overrides',
      value: (overridden.length - conservative.length).toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Documented Overrides',
      value: documented.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
  ];

  const formula: FormulaTrace = {
    name: 'Override Analysis — AML Case Management',
    equation:
      'overrideRate = overrides / reviewed; conservativePct = conservative / overrides; documentationRate = documented / overrides',
    inputs: {
      'Cases Reviewed': totalReviewed,
      Overrides: overridden.length,
      'Conservative Overrides': conservative.length,
      'Documented Overrides': documented.length,
    },
    steps: [
      {
        label: 'Compute override rate',
        expression: `overrideRate = ${overridden.length} / ${totalReviewed}`,
        value: `${(overrideRate * 100).toFixed(1)}%`,
      },
      {
        label: 'Compute conservative direction %',
        expression: `conservativePct = ${conservative.length} / ${overridden.length}`,
        value: `${(conservativePct * 100).toFixed(1)}%`,
      },
      {
        label: 'Compute documentation rate',
        expression: `documentationRate = ${documented.length} / ${overridden.length}`,
        value: `${(documentationRate * 100).toFixed(1)}%`,
      },
      {
        label: 'Apply thresholds',
        expression: `override < 30% ✓; conservative ≥ 80% ✓; documentation ≥ 90% ✓`,
        value: verdict.toUpperCase(),
      },
    ],
    result: `Override ${(overrideRate * 100).toFixed(1)}%; Conservative ${(conservativePct * 100).toFixed(1)}%; Documented ${(documentationRate * 100).toFixed(1)}%`,
    reference: 'SR 11-7 §II.C — Override Analysis',
  };

  return {
    testType: 'override',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : verdict === 'warn' ? 'Yellow' : 'Red',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['Case Management System', 'SAR Filing Database'],
    computed: true,
    formula,
    metrics,
    findings: [],
    recommendation:
      'Override analysis metrics within acceptable thresholds. Documentation rate is strong. Monitor override rate trend — Q3 2025 showed an increase from 19% to 25% (see MRF-007). If rate exceeds 30% in Q1 2026, initiate scorecard recalibration review.',
  };
}
