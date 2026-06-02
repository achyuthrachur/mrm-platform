import { mulberry32, normalSample, clamp, pick, randInt, offsetDate } from './prng';
import type { Dataset } from '@/types';

export interface AMLTransactionRow {
  txnId: string;
  amount: number;
  channel: 'ACH' | 'Wire' | 'Cash' | 'Check' | 'Card';
  feedSource: 'ACH-RETURN' | 'CORE' | 'WIRE-OPS' | 'CARD-PROC';
  country: string;
  date: string;
  ruleHit: string | null;
  alertFlag: boolean;
  sarOutcome: boolean;
}

export interface AMLOverrideRow {
  caseId: string;
  alertId: string;
  reviewerId: string;
  overrideFlag: boolean;
  direction: 'conservative' | 'aggressive' | 'neutral';
  documented: boolean;
  overrideDate: string;
}

const CHANNELS = ['ACH', 'Wire', 'Cash', 'Check', 'Card'] as const;
const CHANNEL_WEIGHTS = [0.38, 0.22, 0.15, 0.1, 0.15]; // ACH heavy

const COUNTRIES = [
  'US',
  'US',
  'US',
  'US',
  'US',
  'US',
  'US', // 70% domestic
  'MX',
  'CA',
  'CO',
  'PH',
  'NG',
  'CN',
  'RU',
];
const RULES = [
  'STR-001 Structuring',
  'CTR-002 Currency Transaction',
  'ACH-003 ACH Velocity',
  'WIRE-004 Wire Anomaly',
  'LAYER-005 Rapid Movement',
  null,
  null,
  null, // nulls = no rule hit
];

// Planted: alert→SAR ≈ 2.1%, FP ≈ 97.8%, ACH-return feed gap

export const AML_TXN_SEED = 137;
export const AML_TXN_N = 25000;

function pickWeighted<T>(rand: () => number, items: readonly T[], weights: number[]): T {
  const r = rand();
  let cum = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r < cum) return items[i];
  }
  return items[items.length - 1];
}

export function generateAMLTransactions(seed = AML_TXN_SEED, n = AML_TXN_N): AMLTransactionRow[] {
  const rand = mulberry32(seed);
  const rows: AMLTransactionRow[] = [];

  for (let i = 0; i < n; i++) {
    const channel = pickWeighted(rand, CHANNELS, CHANNEL_WEIGHTS) as AMLTransactionRow['channel'];
    const feedSource: AMLTransactionRow['feedSource'] =
      channel === 'ACH'
        ? 'ACH-RETURN'
        : channel === 'Wire'
          ? 'WIRE-OPS'
          : channel === 'Card'
            ? 'CARD-PROC'
            : 'CORE';

    const country = pick(rand, COUNTRIES);
    const isHighRisk = country !== 'US' || channel === 'Wire';
    const baseAmount = isHighRisk
      ? clamp(normalSample(rand, 28000, 22000), 500, 250000)
      : clamp(normalSample(rand, 4200, 3800), 10, 50000);
    const amount = Math.round(baseAmount * 100) / 100;

    const daysAgo = randInt(rand, 365);
    const date = offsetDate('2026-04-07', -daysAgo);

    const ruleHit =
      isHighRisk && rand() < 0.08 ? (pick(rand, RULES.filter(Boolean)) as string) : null;

    // Alert logic: rule hit + high amount or high-risk country
    const alertFlag = ruleHit !== null || (isHighRisk && rand() < 0.03) || rand() < 0.004;

    // SAR outcome: only ~2.1% of alerts convert to SAR (FP ≈ 97.8%)
    const sarOutcome = alertFlag && rand() < 0.021;

    rows.push({
      txnId: `TXN-${String(i + 1).padStart(7, '0')}`,
      amount,
      channel,
      feedSource,
      country,
      date: date.slice(0, 10),
      ruleHit,
      alertFlag,
      sarOutcome,
    });
  }

  return rows;
}

export function generateAMLOverrideLog(seed = AML_TXN_SEED + 1, n = 12000): AMLOverrideRow[] {
  const rand = mulberry32(seed);
  const rows: AMLOverrideRow[] = [];
  const reviewers = ['REV-001', 'REV-002', 'REV-003', 'REV-004', 'REV-005'];

  for (let i = 0; i < n; i++) {
    const overrideFlag = rand() < 0.25; // ~25% override rate
    let direction: AMLOverrideRow['direction'] = 'neutral';
    if (overrideFlag) {
      // ~89% conservative when overriding
      direction = rand() < 0.89 ? 'conservative' : 'aggressive';
    }
    // Documentation rate: ~94.8% of overrides are documented
    const documented = !overrideFlag || rand() < 0.948;

    const daysAgo = randInt(rand, 365);
    const overrideDate = offsetDate('2026-04-07', -daysAgo).slice(0, 10);

    rows.push({
      caseId: `CASE-${String(i + 1).padStart(6, '0')}`,
      alertId: `ALERT-${String(randInt(rand, 20000) + 1).padStart(6, '0')}`,
      reviewerId: pick(rand, reviewers),
      overrideFlag,
      direction,
      documented,
      overrideDate,
    });
  }

  return rows;
}

let _cachedTxns: AMLTransactionRow[] | null = null;
let _cachedOverrides: AMLOverrideRow[] | null = null;

export function getAMLTransactions(): Dataset<AMLTransactionRow> {
  if (!_cachedTxns) _cachedTxns = generateAMLTransactions();
  return {
    id: 'aml-transactions',
    label: 'AML Transaction Monitoring — Input Transaction Feed',
    rows: _cachedTxns,
    rowCount: _cachedTxns.length,
    generatedFromSeed: AML_TXN_SEED,
    note: `${AML_TXN_N} transactions. Planted: alert→SAR ≈ 2.1%, FP ≈ 97.8%. ACH-RETURN feed is source of record; model copy excludes same-day ACH returns (completeness gap → fail).`,
  };
}

export function getAMLOverrideLog(): Dataset<AMLOverrideRow> {
  if (!_cachedOverrides) _cachedOverrides = generateAMLOverrideLog();
  return {
    id: 'aml-override-log',
    label: 'AML Override Log — Case Management System',
    rows: _cachedOverrides,
    rowCount: _cachedOverrides.length,
    generatedFromSeed: AML_TXN_SEED + 1,
    note: '12,000 case reviews. Planted: override ≈ 25%, conservative ≈ 89%, documented ≈ 94.8% (→ pass).',
  };
}
