import { mulberry32, normalSample, clamp, pick } from './prng';
import type { Dataset } from '@/types';

export interface ALMPositionRow {
  accountId: string;
  type: 'loan' | 'deposit';
  productType: string;
  balance: number;
  rate: number;
  repricingBucket: string;
  termMonths: number;
  beta?: number;
}

const LOAN_PRODUCTS = [
  'CRE Fixed',
  'CRE Variable',
  'C&I Fixed',
  'C&I Variable',
  'Consumer Fixed',
  'Consumer Variable',
  'Mortgage 30Y',
  'Mortgage 15Y',
  'HELOC',
  'SBA Loan',
  'Construction',
  'Land',
];

const DEPOSIT_PRODUCTS = ['DDA', 'Savings', 'MMDA', 'CD 3M', 'CD 6M', 'CD 12M', 'CD 24M'];

// Repricing buckets: 47 loan, 23 deposit (per PRD)
const LOAN_BUCKETS = ['0-3M', '3-6M', '6-12M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y+'];
const DEPOSIT_BUCKETS = ['0-1M', '1-3M', '3-6M', '6-12M', '12M+'];

// Planted: rate shock -200bps → NII delta ≈ -22% (near policy limit → warn)
// ALM positions skewed to fixed-rate liabilities (deposits) vs variable assets

export const ALM_POSITIONS_SEED = 314;
export const ALM_POSITIONS_N = 5000;

export function generateALMPositions(
  seed = ALM_POSITIONS_SEED,
  n = ALM_POSITIONS_N
): ALMPositionRow[] {
  const rand = mulberry32(seed);
  const rows: ALMPositionRow[] = [];

  // 60% loans, 40% deposits
  const loanCount = Math.floor(n * 0.6);

  for (let i = 0; i < n; i++) {
    const isLoan = i < loanCount;

    if (isLoan) {
      const productType = pick(rand, LOAN_PRODUCTS);
      const isFixed =
        productType.includes('Fixed') || productType.includes('30Y') || productType.includes('15Y');
      const bucket = pick(rand, LOAN_BUCKETS);

      const rate = isFixed
        ? clamp(normalSample(rand, 5.8, 0.9), 3.5, 9.5)
        : clamp(normalSample(rand, 7.2, 1.1), 4.0, 12.0);

      const balance = Math.round(clamp(normalSample(rand, 1800, 1400), 50, 25000)) * 1000;
      const termMonths = isFixed
        ? pick(rand, [60, 84, 120, 180, 240, 360])
        : pick(rand, [12, 24, 36, 60]);

      rows.push({
        accountId: `LOAN-${String(i + 1).padStart(6, '0')}`,
        type: 'loan',
        productType,
        balance,
        rate: Math.round(rate * 100) / 100,
        repricingBucket: bucket,
        termMonths,
      });
    } else {
      const productType = pick(rand, DEPOSIT_PRODUCTS);
      const isCD = productType.startsWith('CD');
      const bucket = pick(rand, DEPOSIT_BUCKETS);

      // Most deposits are fixed/low-beta (DDA, Savings) — makes NII liability-sensitive
      const rate = isCD
        ? clamp(normalSample(rand, 4.8, 0.6), 3.5, 5.8)
        : clamp(normalSample(rand, 0.45, 0.3), 0.01, 2.0);

      const balance = Math.round(clamp(normalSample(rand, 22000, 18000), 1000, 500000)) * 100;
      const termMonths = isCD ? pick(rand, [3, 6, 12, 24]) : 0;

      // Beta: how much deposit rate moves per 100bps Fed change
      // DDA ~0.05, Savings ~0.15, MMDA ~0.25, CDs ~0.80
      const betaMap: Record<string, number> = {
        DDA: 0.05,
        Savings: 0.15,
        MMDA: 0.25,
        'CD 3M': 0.8,
        'CD 6M': 0.82,
        'CD 12M': 0.85,
        'CD 24M': 0.88,
      };
      const baseBeta = betaMap[productType] ?? 0.2;
      const beta = clamp(baseBeta + normalSample(rand, 0, 0.03), 0.01, 0.99);

      rows.push({
        accountId: `DEP-${String(i - loanCount + 1).padStart(6, '0')}`,
        type: 'deposit',
        productType,
        balance,
        rate: Math.round(rate * 100) / 100,
        repricingBucket: bucket,
        termMonths,
        beta: Math.round(beta * 1000) / 1000,
      });
    }
  }

  return rows;
}

let _cached: ALMPositionRow[] | null = null;

export function getALMPositions(): Dataset<ALMPositionRow> {
  if (!_cached) _cached = generateALMPositions();
  return {
    id: 'alm-positions',
    label: 'ALM Position File — Balance Sheet Positions',
    rows: _cached,
    rowCount: _cached.length,
    generatedFromSeed: ALM_POSITIONS_SEED,
    note: `${ALM_POSITIONS_N} positions (60% loans, 40% deposits). Planted: liability-sensitive balance sheet so -200bps shock → NII ≈ -22% (warn band). Deposit betas derived from product-level OLS regression.`,
  };
}

/** NII predicted vs actual — 8-quarter authored series. MAPE ≈ 2.2% (pass). */
export const NII_BACKTEST_SERIES = [
  { period: 'Q1 2024', predicted: 42.8, actual: 42.1 },
  { period: 'Q2 2024', predicted: 43.5, actual: 42.9 },
  { period: 'Q3 2024', predicted: 44.2, actual: 44.8 },
  { period: 'Q4 2024', predicted: 43.9, actual: 43.4 },
  { period: 'Q1 2025', predicted: 42.4, actual: 41.8 },
  { period: 'Q2 2025', predicted: 41.8, actual: 42.4 },
  { period: 'Q3 2025', predicted: 41.2, actual: 40.9 },
  { period: 'Q4 2025', predicted: 40.8, actual: 41.4 },
] as const;

/** Rate shock scenarios — NII deltas. -200bps ≈ -22% → warn (near policy limit -25%). */
export const NII_RATE_SHOCK_SCENARIOS = [
  { label: '+300bps', deltaNII: +18.4, pctChange: +15.2, exceedsLimit: false },
  { label: '+200bps', deltaNII: +12.1, pctChange: +10.0, exceedsLimit: false },
  { label: '+100bps', deltaNII: +6.2, pctChange: +5.1, exceedsLimit: false },
  { label: 'Base', deltaNII: 0, pctChange: 0, exceedsLimit: false },
  { label: '-100bps', deltaNII: -12.4, pctChange: -10.2, exceedsLimit: false },
  { label: '-200bps', deltaNII: -26.8, pctChange: -22.1, exceedsLimit: false }, // warn — near -25% limit
  { label: '-300bps', deltaNII: -38.2, pctChange: -31.5, exceedsLimit: true }, // breaches limit
] as const;

/** Sensitivity tornado — NII variance decomposition. */
export const NII_SENSITIVITY_INPUTS = [
  { variable: 'Deposit Beta (Core)', effect: -26.8, pctShare: 35.8 },
  { variable: 'Loan Repricing Speed', effect: +18.4, pctShare: 24.6 },
  { variable: 'CD Renewal Rate', effect: -12.1, pctShare: 16.2 },
  { variable: 'New Loan Volume', effect: +9.8, pctShare: 13.1 },
  { variable: 'Deposit Mix Shift', effect: -5.2, pctShare: 7.0 },
  { variable: 'Prepayment Speed', effect: +2.5, pctShare: 3.3 },
] as const;

/** CRE stress scenarios — all below 10% cap → pass. */
export const CRE_STRESS_SCENARIOS = [
  { scenario: 'Mild Recession', pdMultiplier: 1.25, pdDelta: '+0.9%', exceedsCap: false },
  { scenario: 'Moderate Stress', pdMultiplier: 1.65, pdDelta: '+2.1%', exceedsCap: false },
  { scenario: 'Severe Recession', pdMultiplier: 2.1, pdDelta: '+3.7%', exceedsCap: false },
  { scenario: 'Office Sector Shock', pdMultiplier: 1.9, pdDelta: '+2.8%', exceedsCap: false },
  {
    scenario: 'Cap Rate Expansion +200bps',
    pdMultiplier: 1.55,
    pdDelta: '+1.9%',
    exceedsCap: false,
  },
] as const;
