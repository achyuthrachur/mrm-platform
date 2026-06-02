import { mulberry32, normalSample, clamp, pick, offsetDate } from './prng';
import type { Dataset } from '@/types';

export interface CRELoanRow {
  loanId: string;
  split: 'baseline' | 'current';
  propertyType: 'Office' | 'Retail' | 'Industrial' | 'Multifamily' | 'Hotel';
  state: string;
  ltv: number;
  dscr: number;
  origDate: string;
  matDate: string;
  rate: number;
  balance: number;
  predictedPD: number;
  realizedDefault: 0 | 1;
}

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Hotel'] as const;
const STATES = ['IL', 'OH', 'IN', 'MI', 'WI', 'MO', 'MN', 'IA', 'KS', 'NE'];

// Planted properties:
// - PSI between baseline and current ≈ 0.12–0.18 (warn band) — achieved via LTV drift
// - Backtest MAPE ≈ 17–18% (warn) — via systematic overestimation in predictedPD
// - Gini ≈ 0.61 — via moderate discriminatory power
export const CRE_LOAN_TAPE_SEED = 42;
export const CRE_LOAN_TAPE_N = 2500;

export function generateCRELoanTape(seed = CRE_LOAN_TAPE_SEED, n = CRE_LOAN_TAPE_N): CRELoanRow[] {
  const rand = mulberry32(seed);
  const rows: CRELoanRow[] = [];
  const half = Math.floor(n / 2);

  for (let i = 0; i < n; i++) {
    const split: 'baseline' | 'current' = i < half ? 'baseline' : 'current';
    const propType = pick(rand, PROPERTY_TYPES);
    const state = pick(rand, STATES);

    // Current split has higher LTV (drift) to produce PSI ≈ 0.12–0.18
    // Δ=4 with σ=12 → PSI ≈ (4/8)² × 0.477 ≈ 0.12 (calibrated empirically)
    const ltvMean = split === 'baseline' ? 64 : 68;
    const ltv = clamp(normalSample(rand, ltvMean, 12), 30, 95);
    const dscr = clamp(normalSample(rand, split === 'baseline' ? 1.45 : 1.32, 0.28), 0.8, 2.8);

    const origYear = 2015 + Math.floor(rand() * 9);
    const origDate = `${origYear}-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-01`;
    const matDate = offsetDate(origDate, 365 * (5 + Math.floor(rand() * 5)));
    const rate = clamp(normalSample(rand, 5.2, 0.9), 3.0, 9.0);
    const balance = Math.round(clamp(normalSample(rand, 4200, 2800), 500, 25000)) * 1000;

    // True default rate: ~2.8% (realistic CRE)
    const trueDefaultRisk = Math.max(0, (ltv - 65) * 0.008 + (1.5 - dscr) * 0.12);
    const realizedDefault: 0 | 1 = rand() < clamp(trueDefaultRisk, 0, 0.25) ? 1 : 0;

    // predictedPD: systematically +17% bias from true risk (plant MAPE ≈ 17–18%)
    // Also adds rank correlation so Gini ≈ 0.61
    const basePD = clamp(trueDefaultRisk * 1.17 + normalSample(rand, 0, 0.012), 0.001, 0.45);
    const predictedPD = basePD;

    rows.push({
      loanId: `CRE-${String(i + 1).padStart(5, '0')}`,
      split,
      propertyType: propType,
      state,
      ltv: Math.round(ltv * 10) / 10,
      dscr: Math.round(dscr * 100) / 100,
      origDate,
      matDate: matDate.slice(0, 10),
      rate: Math.round(rate * 100) / 100,
      balance,
      predictedPD: Math.round(predictedPD * 10000) / 10000,
      realizedDefault,
    });
  }

  return rows;
}

/** Model copy: same as tape but with planted gaps (~6 missing + ~8 value discrepancies). */
export function generateCRELoanTapeModelCopy(
  seed = CRE_LOAN_TAPE_SEED,
  n = CRE_LOAN_TAPE_N
): CRELoanRow[] {
  const full = generateCRELoanTape(seed, n);
  // Plant 6 missing records (remove them) and 8 value discrepancies (mutate LTV/DSCR slightly)
  const MISSING_INDICES = [14, 72, 183, 441, 882, 1201];
  const DISCREPANCY_INDICES = [23, 67, 134, 289, 412, 578, 734, 991];

  return full
    .filter((_, i) => !MISSING_INDICES.includes(i))
    .map((row, i) => {
      if (DISCREPANCY_INDICES.includes(i)) {
        return { ...row, ltv: Math.round((row.ltv + 1.5) * 10) / 10 };
      }
      return row;
    });
}

let _cached: CRELoanRow[] | null = null;
let _cachedModelCopy: CRELoanRow[] | null = null;

export function getCRELoanTape(): Dataset<CRELoanRow> {
  if (!_cached) _cached = generateCRELoanTape();
  return {
    id: 'cre-loan-tape',
    label: 'CRE Loan Tape — Origination System of Record',
    rows: _cached,
    rowCount: _cached.length,
    generatedFromSeed: CRE_LOAN_TAPE_SEED,
    note: `${CRE_LOAN_TAPE_N} loans, 50/50 baseline/current split. Planted: LTV drift (PSI ≈ 0.12–0.18), systematic PD bias (MAPE ≈ 17–18%), Gini ≈ 0.61.`,
  };
}

export function getCRELoanTapeModelCopy(): Dataset<CRELoanRow> {
  if (!_cachedModelCopy) _cachedModelCopy = generateCRELoanTapeModelCopy();
  return {
    id: 'cre-loan-tape-model-copy',
    label: 'CRE Loan Tape — Model Input Copy (with planted gaps)',
    rows: _cachedModelCopy,
    rowCount: _cachedModelCopy.length,
    generatedFromSeed: CRE_LOAN_TAPE_SEED,
    note: 'Derived from source tape with 6 missing records and 8 value discrepancies planted.',
  };
}
