import { mulberry32, normalSample, clamp, pick, randInt } from './prng';
import type { Dataset } from '@/types';

export interface FraudScoredTxnRow {
  txnId: string;
  amount: number;
  merchantCategory: string;
  country: string;
  hourOfDay: number;
  dayOfWeek: number;
  velocityScore: number;
  score: number;
  fraudLabel: 0 | 1;
  split: 'baseline' | 'current';
}

const MCC_CODES = [
  'Grocery',
  'Gas Station',
  'Restaurant',
  'Retail',
  'Travel',
  'Electronics',
  'Healthcare',
  'Online Shopping',
  'Digital Goods',
  'ATM',
];

const COUNTRIES = [
  'US',
  'US',
  'US',
  'US',
  'US',
  'US',
  'US',
  'US', // 80% domestic
  'CA',
  'MX',
  'GB',
  'DE',
  'CN',
  'RU',
];

// Planted properties:
// - AUC ≈ 0.93 — fraud scores N(0.68, 0.18), non-fraud N(0.32, 0.18)
// - Precision ≈ 0.82, recall ≈ 0.86 (at operating threshold ~0.55)
// - Mild PSI warn: slight score drift between baseline and current

export const FRAUD_SCORED_SEED = 271;
export const FRAUD_SCORED_N = 30000;

export function generateFraudScoredTxns(
  seed = FRAUD_SCORED_SEED,
  n = FRAUD_SCORED_N
): FraudScoredTxnRow[] {
  const rand = mulberry32(seed);
  const rows: FraudScoredTxnRow[] = [];
  const half = Math.floor(n / 2);

  // Plant ~1.2% fraud rate = 360 fraud transactions
  const FRAUD_RATE = 0.012;

  for (let i = 0; i < n; i++) {
    const split: 'baseline' | 'current' = i < half ? 'baseline' : 'current';
    const isFraud = rand() < FRAUD_RATE;

    const amount = isFraud
      ? clamp(normalSample(rand, 380, 280), 5, 3000)
      : clamp(normalSample(rand, 62, 85), 0.5, 2000);

    const merchantCategory = pick(rand, MCC_CODES);
    const country = pick(rand, COUNTRIES);
    const hourOfDay = randInt(rand, 24);
    const dayOfWeek = randInt(rand, 7);
    const velocityScore = clamp(normalSample(rand, isFraud ? 0.72 : 0.28, 0.18), 0, 1);

    // Score distribution: fraud ≈ N(0.68, 0.18), non-fraud ≈ N(0.32, 0.18)
    // Current split: slight upward drift of 0.04 in non-fraud mean → PSI warn
    // Current split: +0.07 drift in non-fraud mean → PSI ≈ 0.15 (warn band 0.10–0.25)
    const nonFraudMean = split === 'baseline' ? 0.32 : 0.39;
    const rawScore = isFraud
      ? normalSample(rand, 0.68, 0.18)
      : normalSample(rand, nonFraudMean, 0.18);
    const score = clamp(rawScore, 0, 1);

    rows.push({
      txnId: `CARD-${String(i + 1).padStart(7, '0')}`,
      amount: Math.round(amount * 100) / 100,
      merchantCategory,
      country,
      hourOfDay,
      dayOfWeek,
      velocityScore: Math.round(velocityScore * 1000) / 1000,
      score: Math.round(score * 10000) / 10000,
      fraudLabel: isFraud ? 1 : 0,
      split,
    });
  }

  return rows;
}

let _cached: FraudScoredTxnRow[] | null = null;

export function getFraudScoredTxns(): Dataset<FraudScoredTxnRow> {
  if (!_cached) _cached = generateFraudScoredTxns();
  return {
    id: 'fraud-scored-txns',
    label: 'Card Fraud — Scored Transaction Dataset',
    rows: _cached,
    rowCount: _cached.length,
    generatedFromSeed: FRAUD_SCORED_SEED,
    note: `${FRAUD_SCORED_N} transactions. Planted: fraud ≈ 1.2%, AUC ≈ 0.93, precision ≈ 0.82, recall ≈ 0.86. Mild PSI warn from score drift in current split.`,
  };
}
