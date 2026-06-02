import { describe, it, expect } from 'vitest';
import {
  generateCRELoanTape,
  generateCRELoanTapeModelCopy,
  CRE_LOAN_TAPE_N,
} from './cre-loan-tape';
import { generateAMLTransactions, generateAMLOverrideLog, AML_TXN_N } from './aml-transactions';
import { generateFraudScoredTxns, FRAUD_SCORED_N } from './fraud-scored-txns';
import { generateALMPositions, ALM_POSITIONS_N } from './alm-positions';

// ── Helper: compute PSI between two arrays of numeric values ────────────────
function psi(baseline: number[], current: number[], bins = 10): number {
  const allVals = [...baseline, ...current];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const w = (max - min) / bins;

  let total = 0;
  for (let b = 0; b < bins; b++) {
    const lo = min + b * w;
    const hi = lo + w;
    const bCt = baseline.filter((v) => v >= lo && (b === bins - 1 ? v <= hi : v < hi)).length;
    const cCt = current.filter((v) => v >= lo && (b === bins - 1 ? v <= hi : v < hi)).length;
    const bPct = Math.max(bCt / baseline.length, 0.0001);
    const cPct = Math.max(cCt / current.length, 0.0001);
    total += (cPct - bPct) * Math.log(cPct / bPct);
  }
  return total;
}

// ── Helper: compute AUC via Wilcoxon rank-sum ────────────────────────────────
function computeAUC(scores: number[], labels: (0 | 1)[]): number {
  const pos = scores.filter((_, i) => labels[i] === 1);
  const neg = scores.filter((_, i) => labels[i] === 0);
  if (pos.length === 0 || neg.length === 0) return 0;
  let concordant = 0;
  for (const p of pos) {
    for (const n of neg) {
      if (p > n) concordant++;
      else if (p === n) concordant += 0.5;
    }
  }
  return concordant / (pos.length * neg.length);
}

// ── CRE Loan Tape ────────────────────────────────────────────────────────────
describe('CRE Loan Tape generator', () => {
  const tape = generateCRELoanTape();

  it('produces the target row count', () => {
    expect(tape.length).toBe(CRE_LOAN_TAPE_N);
  });

  it('is deterministic (same seed → same rows)', () => {
    const tape2 = generateCRELoanTape(42);
    expect(tape[0].loanId).toBe(tape2[0].loanId);
    expect(tape[100].ltv).toBe(tape2[100].ltv);
  });

  it('LTV values are in [30, 95]', () => {
    expect(tape.every((r) => r.ltv >= 30 && r.ltv <= 95)).toBe(true);
  });

  it('predictedPD values are in (0, 1)', () => {
    expect(tape.every((r) => r.predictedPD > 0 && r.predictedPD < 1)).toBe(true);
  });

  it('planted property: PSI between baseline and current LTV is in warn zone (0.08–0.35)', () => {
    const baseline = tape.filter((r) => r.split === 'baseline').map((r) => r.ltv);
    const current = tape.filter((r) => r.split === 'current').map((r) => r.ltv);
    const psiVal = psi(baseline, current);
    // LTV drift planted: baseline mean 64, current mean 68 → PSI ≈ 0.10–0.18
    expect(psiVal).toBeGreaterThan(0.05);
    expect(psiVal).toBeLessThan(0.35);
  });

  it('planted property: population-level bias in predictedPD ≈ 10–30%', () => {
    // Population MAPE: |mean(predictedPD) - actualDefaultRate| / actualDefaultRate
    const meanPredicted = tape.reduce((s, r) => s + r.predictedPD, 0) / tape.length;
    const actualDefaultRate = tape.filter((r) => r.realizedDefault === 1).length / tape.length;
    // predictedPD is biased ~17% high vs realized default rate
    const bias = (meanPredicted - actualDefaultRate) / Math.max(actualDefaultRate, 0.001);
    expect(bias).toBeGreaterThan(0.05); // at least 5% bias
    expect(bias).toBeLessThan(0.6); // not more than 60% bias
  });
});

describe('CRE Loan Tape Model Copy', () => {
  it('has fewer records than source tape (planted gaps)', () => {
    const copy = generateCRELoanTapeModelCopy();
    expect(copy.length).toBe(CRE_LOAN_TAPE_N - 6);
  });

  it('is deterministic', () => {
    const copy1 = generateCRELoanTapeModelCopy();
    const copy2 = generateCRELoanTapeModelCopy();
    expect(copy1[0].loanId).toBe(copy2[0].loanId);
  });
});

// ── AML Transactions ─────────────────────────────────────────────────────────
describe('AML Transactions generator', () => {
  const txns = generateAMLTransactions();

  it('produces the target row count', () => {
    expect(txns.length).toBe(AML_TXN_N);
  });

  it('is deterministic', () => {
    const txns2 = generateAMLTransactions(137);
    expect(txns[0].txnId).toBe(txns2[0].txnId);
  });

  it('planted property: SAR rate among alerts ≈ 0.015–0.03 (≈ 2.1%)', () => {
    const alerts = txns.filter((t) => t.alertFlag);
    const sars = alerts.filter((t) => t.sarOutcome);
    const sarRate = sars.length / alerts.length;
    expect(sarRate).toBeGreaterThan(0.01);
    expect(sarRate).toBeLessThan(0.05);
  });

  it('planted property: ACH-RETURN feed source is present in source data', () => {
    const achReturns = txns.filter((t) => t.feedSource === 'ACH-RETURN');
    expect(achReturns.length).toBeGreaterThan(100);
  });
});

describe('AML Override Log generator', () => {
  const overrides = generateAMLOverrideLog();

  it('produces 12,000 rows', () => {
    expect(overrides.length).toBe(12000);
  });

  it('planted property: override rate ≈ 20–30%', () => {
    const overrideCount = overrides.filter((r) => r.overrideFlag).length;
    const rate = overrideCount / overrides.length;
    expect(rate).toBeGreaterThan(0.18);
    expect(rate).toBeLessThan(0.32);
  });

  it('planted property: conservative override % ≈ 80–95%', () => {
    const overridden = overrides.filter((r) => r.overrideFlag);
    const conservative = overridden.filter((r) => r.direction === 'conservative');
    const pct = conservative.length / overridden.length;
    expect(pct).toBeGreaterThan(0.8);
    expect(pct).toBeLessThan(0.97);
  });

  it('planted property: documentation rate ≈ 90–99%', () => {
    const overridden = overrides.filter((r) => r.overrideFlag);
    const documented = overridden.filter((r) => r.documented);
    const rate = documented.length / overridden.length;
    expect(rate).toBeGreaterThan(0.9);
    expect(rate).toBeLessThan(0.99);
  });
});

// ── Fraud Scored Transactions ────────────────────────────────────────────────
describe('Fraud Scored Transactions generator', () => {
  const txns = generateFraudScoredTxns();

  it('produces the target row count', () => {
    expect(txns.length).toBe(FRAUD_SCORED_N);
  });

  it('is deterministic', () => {
    const txns2 = generateFraudScoredTxns(271);
    expect(txns[0].txnId).toBe(txns2[0].txnId);
  });

  it('planted property: fraud rate ≈ 0.8–1.8%', () => {
    const fraudCount = txns.filter((t) => t.fraudLabel === 1).length;
    const rate = fraudCount / txns.length;
    expect(rate).toBeGreaterThan(0.008);
    expect(rate).toBeLessThan(0.018);
  });

  it('planted property: AUC ≈ 0.88–0.97 (target ~0.93)', () => {
    // Sample 5,000 rows for speed
    const sample = txns.slice(0, 5000);
    const scores = sample.map((t) => t.score);
    const labels = sample.map((t) => t.fraudLabel);
    const auc = computeAUC(scores, labels);
    expect(auc).toBeGreaterThan(0.85);
    expect(auc).toBeLessThan(0.98);
  });

  it('planted property: fraud scores higher than non-fraud on average', () => {
    const fraudScores = txns.filter((t) => t.fraudLabel === 1).map((t) => t.score);
    const nonFraudScores = txns.filter((t) => t.fraudLabel === 0).map((t) => t.score);
    const fraudMean = fraudScores.reduce((a, b) => a + b, 0) / fraudScores.length;
    const nonFraudMean = nonFraudScores.reduce((a, b) => a + b, 0) / nonFraudScores.length;
    expect(fraudMean).toBeGreaterThan(nonFraudMean + 0.2);
  });

  it('planted property: score PSI between baseline and current in warn band (0.08–0.30)', () => {
    const baseline = txns.filter((t) => t.split === 'baseline').map((t) => t.score);
    const current = txns.filter((t) => t.split === 'current').map((t) => t.score);
    const psiVal = psi(baseline, current);
    expect(psiVal).toBeGreaterThan(0.05);
    expect(psiVal).toBeLessThan(0.3);
  });
});

// ── ALM Positions ─────────────────────────────────────────────────────────────
describe('ALM Positions generator', () => {
  const positions = generateALMPositions();

  it('produces the target row count', () => {
    expect(positions.length).toBe(ALM_POSITIONS_N);
  });

  it('is deterministic', () => {
    const positions2 = generateALMPositions(314);
    expect(positions[0].accountId).toBe(positions2[0].accountId);
  });

  it('has both loans and deposits', () => {
    const loans = positions.filter((p) => p.type === 'loan');
    const deposits = positions.filter((p) => p.type === 'deposit');
    expect(loans.length).toBeGreaterThan(0);
    expect(deposits.length).toBeGreaterThan(0);
  });

  it('planted property: deposits have beta values', () => {
    const deposits = positions.filter((p) => p.type === 'deposit');
    expect(deposits.every((d) => d.beta !== undefined)).toBe(true);
    expect(deposits.every((d) => (d.beta ?? 0) >= 0 && (d.beta ?? 0) <= 1)).toBe(true);
  });

  it('planted property: loan rates in [3%, 12%]', () => {
    const loans = positions.filter((p) => p.type === 'loan');
    expect(loans.every((l) => l.rate >= 3 && l.rate <= 12)).toBe(true);
  });
});
