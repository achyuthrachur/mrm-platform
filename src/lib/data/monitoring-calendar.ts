import type { MonitoringCalendarEntry, TestType } from '@/types';
import type { Model } from '@/types';
import { getDueDateStatus, getToday, offsetDate } from '@/lib/clock';

export const TEST_LABELS: Record<TestType, string> = {
  'source-to-model': 'Source-to-Model',
  backtesting: 'Backtesting',
  benchmarking: 'Benchmarking',
  sensitivity: 'Sensitivity Analysis',
  stress: 'Stress Testing',
  override: 'Override Analysis',
  psi: 'PSI',
  csi: 'CSI',
};

export const MODEL_TEST_MENU: Record<string, TestType[]> = {
  CECL: ['source-to-model', 'backtesting', 'psi', 'stress', 'sensitivity', 'benchmarking'],
  'BSA/AML': ['source-to-model', 'backtesting', 'benchmarking', 'override', 'psi'],
  ALM: ['source-to-model', 'backtesting', 'sensitivity', 'stress'],
  Fraud: ['backtesting', 'psi', 'csi', 'benchmarking', 'source-to-model'],
  Capital: ['backtesting', 'sensitivity', 'stress', 'benchmarking'],
  PPNR: ['backtesting', 'sensitivity', 'benchmarking'],
  'Market Risk': ['backtesting', 'stress', 'benchmarking', 'sensitivity'],
  'Op Risk': ['backtesting', 'benchmarking'],
  Liquidity: ['backtesting', 'stress', 'sensitivity'],
};

const FREQ_DAYS: Record<string, number> = {
  Monthly: 30,
  Quarterly: 90,
  'Semi-annual': 180,
  Annual: 365,
};

const SR_REFS: Record<TestType, string> = {
  'source-to-model': 'SR 11-7 §I.D',
  backtesting: 'SR 11-7 §II.B',
  benchmarking: 'SR 11-7 §I.A',
  sensitivity: 'SR 11-7 §II.C',
  stress: 'SR 11-7 §I.E',
  override: 'SR 11-7 §II.C',
  psi: 'SR 26-2 §II.D',
  csi: 'SR 26-2 §II.D',
};

const THRESHOLD_TEXT: Record<TestType, string> = {
  'source-to-model': 'Completeness ≥ 99%; discrepancies < 0.05%',
  backtesting: 'MAPE ≤ 15% (warn) / ≤ 20% (fail); Gini ≥ 0.55',
  benchmarking: 'Subject value within ±2 std devs of peer median',
  sensitivity: 'No single input > 50% variance share',
  stress: 'Scenario impact ≤ policy cap',
  override: 'Override rate < 30%; documentation ≥ 90%',
  psi: 'PSI < 0.10 (pass) / 0.10–0.25 (warn) / > 0.25 (fail)',
  csi: 'CSI < 0.10 (pass) / ≥ 0.10 (warn)',
};

/** Build the monitoring calendar for a given model. */
export function getMonitoringCalendar(model: Model): MonitoringCalendarEntry[] {
  if (!model.selectedTests || model.selectedTests.length === 0) return [];

  const today = getToday();
  return model.selectedTests.map((sel) => {
    const freqDays = FREQ_DAYS[sel.frequency] ?? 90;
    const lastRun = offsetDate(today, -Math.floor(freqDays * 0.8));
    const nextDue = offsetDate(lastRun, freqDays);
    const status = getDueDateStatus(nextDue);

    return {
      modelId: model.id,
      testType: sel.testType,
      srRef: sel.srRef || SR_REFS[sel.testType],
      frequency: sel.frequency,
      thresholdText: THRESHOLD_TEXT[sel.testType],
      lastRun,
      nextDue,
      status,
      historyDots: [],
    };
  });
}

/** Map test key strings (used in wireframe data) to TestType. */
export function testKeyToType(key: string): TestType | null {
  const map: Record<string, TestType> = {
    stm: 'source-to-model',
    'source-to-model': 'source-to-model',
    backtest: 'backtesting',
    backtesting: 'backtesting',
    benchmark: 'benchmarking',
    benchmarking: 'benchmarking',
    sensitivity: 'sensitivity',
    stress: 'stress',
    override: 'override',
    psi: 'psi',
    csi: 'csi',
  };
  return map[key.toLowerCase()] ?? null;
}
