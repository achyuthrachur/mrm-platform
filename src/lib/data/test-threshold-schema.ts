import type { TestThresholdSchema, TestType } from '@/types';

const NON_DISCRIMINATORY = ['ALM', 'PPNR', 'Liquidity'];

export const TEST_THRESHOLD_SCHEMAS: TestThresholdSchema[] = [
  {
    testType: 'source-to-model',
    label: 'Source-to-Model',
    fields: [
      {
        key: 'completeness_pass',
        label: 'Completeness Pass Threshold',
        unit: 'decimal',
        default: 0.999,
        min: 0.95,
        max: 1.0,
        description:
          '≥ this value = pass; below = warn/fail. Represents % of source records matched to model.',
        reference: 'SR 11-7 §I.D',
        warnBand: { lt: 0.999 },
        failBand: { lt: 0.95 },
      },
      {
        key: 'completeness_warn',
        label: 'Completeness Warn Threshold',
        unit: 'decimal',
        default: 0.95,
        min: 0.9,
        max: 0.999,
        description: '≥ this value but below pass = warn. Below this = fail.',
        reference: 'SR 11-7 §I.D',
      },
      {
        key: 'discrepancy_pass',
        label: 'Max Numeric Discrepancy',
        unit: 'decimal',
        default: 0.001,
        min: 0,
        max: 0.05,
        description:
          'Maximum allowed fractional discrepancy in numeric fields. Exceeding = warn or fail.',
        reference: 'SR 11-7 §I.D',
        warnBand: { gt: 0.001 },
        failBand: { gt: 0.01 },
      },
    ],
  },
  {
    testType: 'psi',
    label: 'PSI (Population Stability Index)',
    fields: [
      {
        key: 'psi_stable',
        label: 'PSI Stable Limit',
        unit: 'decimal',
        default: 0.1,
        min: 0.01,
        max: 0.5,
        description: 'PSI below this = stable (pass). PSI between this and monitor limit = warn.',
        reference: 'SR 26-2 §II.D',
        warnBand: { gt: 0.1, lt: 0.25 },
        failBand: { gt: 0.25 },
      },
      {
        key: 'psi_monitor',
        label: 'PSI Monitor Limit',
        unit: 'decimal',
        default: 0.25,
        min: 0.1,
        max: 0.5,
        description:
          'PSI at or above this = rebuild required (fail). Between stable and this = monitor.',
        reference: 'SR 26-2 §II.D',
      },
    ],
  },
  {
    testType: 'csi',
    label: 'CSI (Characteristic Stability Index)',
    fields: [
      {
        key: 'csi_stable',
        label: 'CSI Stable Limit',
        unit: 'decimal',
        default: 0.1,
        min: 0.01,
        max: 0.5,
        description:
          'Per-variable CSI below this = stable (pass). Used to detect individual input drift.',
        reference: 'SR 26-2 §II.D',
        warnBand: { gt: 0.1, lt: 0.25 },
        failBand: { gt: 0.25 },
      },
      {
        key: 'csi_monitor',
        label: 'CSI Monitor Limit',
        unit: 'decimal',
        default: 0.25,
        min: 0.1,
        max: 0.5,
        description: 'Per-variable CSI at or above this = investigate (fail).',
        reference: 'SR 26-2 §II.D',
      },
    ],
  },
  {
    testType: 'backtesting',
    label: 'Backtesting',
    fields: [
      {
        key: 'mape_pass',
        label: 'MAPE Pass Threshold (%)',
        unit: '%',
        default: 15.0,
        min: 1.0,
        max: 50.0,
        description:
          'Mean Absolute Percentage Error: below this = pass. Varies by category (PD: 20%, NII: 5%, Fraud: 15%).',
        reference: 'SR 11-7 §II.B',
        warnBand: { gt: 15.0, lt: 20.0 },
        failBand: { gt: 20.0 },
      },
      {
        key: 'mape_warn',
        label: 'MAPE Warn Threshold (%)',
        unit: '%',
        default: 20.0,
        min: 5.0,
        max: 60.0,
        description: 'MAPE between pass and this = warn. Above this = fail.',
        reference: 'SR 11-7 §II.B',
      },
      {
        key: 'bias_limit',
        label: 'Systematic Bias Limit (%)',
        unit: '%',
        default: 2.0,
        min: 0.1,
        max: 20.0,
        description:
          'Maximum allowed systematic directional bias. Above this triggers review regardless of MAPE.',
        reference: 'SR 11-7 §II.B',
      },
      {
        key: 'gini_min',
        label: 'Minimum Gini Coefficient',
        unit: 'decimal',
        default: 0.5,
        min: 0.2,
        max: 0.9,
        description:
          'Discriminatory power floor. Gini below this = fail. Only applies to discriminatory (PD/classification) models.',
        reference: 'SR 11-7 §II.B',
        failBand: { lt: 0.5 },
        hideForCategories: NON_DISCRIMINATORY,
      },
      {
        key: 'auc_min',
        label: 'Minimum AUC',
        unit: 'decimal',
        default: 0.8,
        min: 0.5,
        max: 0.99,
        description:
          'Area Under ROC Curve floor. AUC below this = fail. Only for classification models.',
        reference: 'SR 11-7 §II.B',
        failBand: { lt: 0.8 },
        showForCategories: ['Fraud', 'BSA/AML'],
      },
    ],
  },
  {
    testType: 'benchmarking',
    label: 'Benchmarking',
    fields: [
      {
        key: 'deviation_warn',
        label: 'Peer Deviation Warn (%)',
        unit: '%',
        default: 15.0,
        min: 5.0,
        max: 40.0,
        description: 'Model output deviation from peer median: above this = warn.',
        reference: 'SR 11-7 §I.A',
        warnBand: { gt: 15.0, lt: 25.0 },
        failBand: { gt: 25.0 },
      },
      {
        key: 'deviation_fail',
        label: 'Peer Deviation Fail (%)',
        unit: '%',
        default: 25.0,
        min: 10.0,
        max: 60.0,
        description: 'Model output deviation above this = fail.',
        reference: 'SR 11-7 §I.A',
      },
      {
        key: 'percentile_warn',
        label: 'Peer Percentile Warn',
        unit: 'decimal',
        default: 0.2,
        min: 0.05,
        max: 0.4,
        description: 'Falling below this peer percentile = warn.',
        reference: 'SR 11-7 §I.A',
      },
      {
        key: 'percentile_fail',
        label: 'Peer Percentile Fail',
        unit: 'decimal',
        default: 0.1,
        min: 0.01,
        max: 0.25,
        description: 'Falling below this peer percentile = fail.',
        reference: 'SR 11-7 §I.A',
      },
    ],
  },
  {
    testType: 'sensitivity',
    label: 'Sensitivity Analysis',
    fields: [
      {
        key: 'concentration_warn',
        label: 'Input Concentration Warn (%)',
        unit: '%',
        default: 50.0,
        min: 20.0,
        max: 80.0,
        description: 'Single variable drives more than this % of output variance = warn.',
        reference: 'SR 11-7 §II.C',
        warnBand: { gt: 50.0, lt: 70.0 },
        failBand: { gt: 70.0 },
      },
      {
        key: 'concentration_fail',
        label: 'Input Concentration Fail (%)',
        unit: '%',
        default: 70.0,
        min: 30.0,
        max: 95.0,
        description: 'Single variable drives more than this % of output variance = fail.',
        reference: 'SR 11-7 §II.C',
      },
    ],
  },
  {
    testType: 'stress',
    label: 'Stress Testing',
    fields: [
      {
        key: 'policy_cap',
        label: 'Policy Cap (%)',
        unit: '%',
        default: 10.0,
        min: 1.0,
        max: 50.0,
        description: 'No scenario result may breach this PD/loss cap. Breach = automatic fail.',
        reference: 'SR 11-7 §I.E',
        failBand: { gt: 10.0 },
      },
      {
        key: 'severe_threshold',
        label: 'Severe Scenario Threshold (%)',
        unit: '%',
        default: 7.5,
        min: 1.0,
        max: 30.0,
        description:
          'Any scenario result above this = warn. Used to identify early stress signals.',
        reference: 'SR 11-7 §I.E',
        warnBand: { gt: 7.5, lt: 10.0 },
      },
    ],
  },
  {
    testType: 'override',
    label: 'Override Analysis',
    fields: [
      {
        key: 'override_rate_warn',
        label: 'Override Rate Warn (%)',
        unit: '%',
        default: 20.0,
        min: 5.0,
        max: 50.0,
        description:
          'Override rate above this = warn. Override rate = overrides / total model outputs.',
        reference: 'SR 11-7 §II.C',
        warnBand: { gt: 20.0, lt: 30.0 },
        failBand: { gt: 30.0 },
      },
      {
        key: 'override_rate_fail',
        label: 'Override Rate Fail (%)',
        unit: '%',
        default: 30.0,
        min: 10.0,
        max: 70.0,
        description: 'Override rate above this = fail.',
        reference: 'SR 11-7 §II.C',
      },
      {
        key: 'conservative_direction_pass',
        label: 'Conservative Direction Pass (%)',
        unit: '%',
        default: 80.0,
        min: 50.0,
        max: 100.0,
        description:
          '% of overrides that are conservative (more conservative than model). Below this = concern.',
        reference: 'SR 11-7 §II.C',
        failBand: { lt: 80.0 },
      },
      {
        key: 'documentation_pass',
        label: 'Documentation Pass (%)',
        unit: '%',
        default: 90.0,
        min: 60.0,
        max: 100.0,
        description: '% of overrides with complete documentation. Below this = fail.',
        reference: 'SR 11-7 §II.C',
        failBand: { lt: 90.0 },
      },
    ],
  },
];

export const THRESHOLD_SCHEMA_BY_TYPE: Record<TestType, TestThresholdSchema> = Object.fromEntries(
  TEST_THRESHOLD_SCHEMAS.map((s) => [s.testType, s])
) as Record<TestType, TestThresholdSchema>;

/** Get default threshold values for a test type, optionally filtered by model category. */
export function getDefaultThresholds(testType: TestType): Record<string, number> {
  const schema = THRESHOLD_SCHEMA_BY_TYPE[testType];
  if (!schema) return {};
  return Object.fromEntries(schema.fields.map((f) => [f.key, f.default]));
}

/** Get visible fields for a test type given the model category. */
export function getVisibleFields(testType: TestType, category: string) {
  const schema = THRESHOLD_SCHEMA_BY_TYPE[testType];
  if (!schema) return [];
  return schema.fields.filter((f) => {
    if (f.showForCategories && !f.showForCategories.includes(category)) return false;
    if (f.hideForCategories && f.hideForCategories.includes(category)) return false;
    return true;
  });
}

/** Determine if any field values deviate from defaults. */
export function hasOverrides(fields: Record<string, number>, testType: TestType): boolean {
  const defaults = getDefaultThresholds(testType);
  return Object.entries(fields).some(([k, v]) => defaults[k] !== undefined && defaults[k] !== v);
}
