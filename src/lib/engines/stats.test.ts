import { describe, it, expect } from 'vitest';
import {
  mean,
  std,
  rmse,
  mape,
  meanBias,
  psiTerm,
  computePSI,
  aucRoc,
  gini,
  directionalAccuracy,
  percentileRank,
  precision,
  recall,
  varianceShares,
} from './stats';

describe('mean', () => {
  it('computes mean of values', () => expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3));
  it('returns 0 for empty array', () => expect(mean([])).toBe(0));
});

describe('std', () => {
  it('computes sample std dev (n-1 denominator)', () =>
    expect(std([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 1));
  it('returns 0 for empty or single-element arrays', () => {
    expect(std([])).toBe(0);
    expect(std([5])).toBe(0);
  });
});

describe('rmse', () => {
  it('is 0 for identical arrays', () => expect(rmse([1, 2, 3], [1, 2, 3])).toBe(0));
  it('computes RMSE correctly', () =>
    expect(rmse([1, 2, 3], [1, 2, 4])).toBeCloseTo(Math.sqrt(1 / 3)));
});

describe('mape', () => {
  it('known answer: 10% error uniformly', () => {
    expect(mape([100, 200, 50], [110, 220, 55])).toBeCloseTo(0.1);
  });
  it('skips zero actual values', () => {
    expect(mape([0, 100], [5, 120])).toBeCloseTo(0.2);
  });
});

describe('meanBias', () => {
  it('positive when predicted > actual', () => expect(meanBias([10, 10], [12, 12])).toBeCloseTo(2));
  it('zero when equal', () => expect(meanBias([5, 5], [5, 5])).toBe(0));
});

describe('psiTerm', () => {
  it('zero when baseline = current', () => expect(psiTerm(0.2, 0.2)).toBeCloseTo(0));
  it('positive for any difference', () => expect(psiTerm(0.3, 0.1)).toBeGreaterThan(0));
});

describe('computePSI', () => {
  it('zero for identical distributions', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(computePSI(arr, arr)).toBeCloseTo(0);
  });
  it('larger for more divergent distributions', () => {
    const a = Array.from({ length: 100 }, (_, i) => i * 0.1);
    const b = Array.from({ length: 100 }, (_, i) => (i + 50) * 0.1);
    expect(computePSI(a, b)).toBeGreaterThan(0.1);
  });
});

describe('aucRoc', () => {
  it('perfect classifier returns 1.0', () => {
    expect(aucRoc([0.1, 0.2, 0.8, 0.9], [0, 0, 1, 1])).toBeCloseTo(1);
  });
  it('inverse classifier returns 0.0', () => {
    expect(aucRoc([0.9, 0.8, 0.2, 0.1], [0, 0, 1, 1])).toBeCloseTo(0);
  });
  it('perfect separation with equal group scores returns 1', () => {
    expect(aucRoc([0.6, 0.6, 0.4, 0.4], [1, 1, 0, 0])).toBeCloseTo(1);
  });
});

describe('gini', () => {
  it('perfect = 1', () => expect(gini([0.1, 0.9], [0, 1])).toBeCloseTo(1));
  it('inverse = -1', () => expect(gini([0.9, 0.1], [0, 1])).toBeCloseTo(-1));
});

describe('directionalAccuracy', () => {
  it('perfect directional accuracy', () =>
    expect(directionalAccuracy([1, 2, 3], [10, 20, 30])).toBeCloseTo(1));
  it('opposite direction = 0', () =>
    expect(directionalAccuracy([1, 2, 3], [10, 5, 1])).toBeCloseTo(0));
});

describe('percentileRank', () => {
  it('subject below all peers = 0', () => expect(percentileRank(0, [1, 2, 3, 4])).toBe(0));
  it('subject above all peers = 1', () => expect(percentileRank(10, [1, 2, 3, 4])).toBe(1));
  it('subject in the middle', () => expect(percentileRank(2.5, [1, 2, 3, 4])).toBe(0.5));
});

describe('precision and recall', () => {
  it('perfect precision and recall at threshold 0.5', () => {
    expect(precision([0.9, 0.8, 0.2, 0.1], [1, 1, 0, 0] as (0 | 1)[], 0.5)).toBeCloseTo(1);
    expect(recall([0.9, 0.8, 0.2, 0.1], [1, 1, 0, 0] as (0 | 1)[], 0.5)).toBeCloseTo(1);
  });
  it('mixed precision', () => {
    expect(precision([0.9, 0.8, 0.3, 0.2], [1, 0, 1, 0] as (0 | 1)[], 0.5)).toBeCloseTo(0.5);
  });
});

describe('varianceShares', () => {
  it('sums to 1', () => {
    expect(varianceShares([10, -5, 3]).reduce((s, v) => s + v, 0)).toBeCloseTo(1);
  });
  it('treats negative effects by magnitude', () => {
    const shares = varianceShares([10, -10]);
    expect(shares[0]).toBeCloseTo(0.5);
  });
  it('handles all zeros', () => {
    expect(varianceShares([0, 0]).every((v) => v === 0)).toBe(true);
  });
});
