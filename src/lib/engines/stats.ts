/**
 * Shared statistical primitives for all validation engines.
 * Every function is pure, unit-tested with known-answer fixtures.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function rmse(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0;
  const mse = actual.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) / actual.length;
  return Math.sqrt(mse);
}

/** MAPE = (1/n) Σ |aᵢ − pᵢ| / |aᵢ| — skips zero-actual terms to avoid division by zero. */
export function mape(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0;
  let totalAPE = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i]) > 1e-10) {
      totalAPE += Math.abs(actual[i] - predicted[i]) / Math.abs(actual[i]);
      count++;
    }
  }
  return count > 0 ? totalAPE / count : 0;
}

/** Signed bias: positive = over-prediction, negative = under-prediction. */
export function meanBias(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0;
  return mean(predicted.map((p, i) => p - actual[i]));
}

/** Single PSI term: (cPct − bPct) × ln(cPct / bPct). Handles near-zero with a floor. */
export function psiTerm(cPct: number, bPct: number): number {
  const c = Math.max(cPct, 0.0001);
  const b = Math.max(bPct, 0.0001);
  return (c - b) * Math.log(c / b);
}

/** Bin continuous values into n equal-width bins, return proportions. */
export function binProportions(values: number[], bins: number): number[] {
  if (values.length === 0) return Array(bins).fill(1 / bins);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV;
  if (range === 0) {
    const result = Array(bins).fill(0);
    result[0] = 1;
    return result;
  }
  const w = range / bins;
  const counts = Array(bins).fill(0);
  for (const v of values) {
    const bin = Math.min(Math.floor((v - minV) / w), bins - 1);
    counts[bin]++;
  }
  return counts.map((c) => c / values.length);
}

/**
 * Compute PSI between two continuous value arrays.
 * PSI = Σᵢ (cPctᵢ − bPctᵢ) × ln(cPctᵢ / bPctᵢ) over `bins` equal-width bins.
 */
export function computePSI(baseline: number[], current: number[], bins = 10): number {
  const allVals = [...baseline, ...current];
  if (allVals.length === 0) return 0;
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV;
  if (range === 0) return 0;

  const w = range / bins;
  const bCounts = Array(bins).fill(0);
  const cCounts = Array(bins).fill(0);

  for (const v of baseline) bCounts[Math.min(Math.floor((v - minV) / w), bins - 1)]++;
  for (const v of current) cCounts[Math.min(Math.floor((v - minV) / w), bins - 1)]++;

  let psi = 0;
  for (let i = 0; i < bins; i++) {
    const bPct = bCounts[i] / Math.max(baseline.length, 1);
    const cPct = cCounts[i] / Math.max(current.length, 1);
    psi += psiTerm(cPct, bPct);
  }
  return psi;
}

/**
 * AUC (ROC) via Wilcoxon rank-sum — O(n log n).
 * AUC = P(score_pos > score_neg) + 0.5 × P(score_pos = score_neg)
 */
export function aucRoc(scores: number[], labels: (0 | 1)[]): number {
  if (scores.length !== labels.length) return 0;
  const pairs = scores.map((s, i) => ({ s, l: labels[i] })).sort((a, b) => a.s - b.s);
  const nPos = pairs.filter((p) => p.l === 1).length;
  const nNeg = pairs.length - nPos;
  if (nPos === 0 || nNeg === 0) return 0;

  let rankSum = 0;
  pairs.forEach((p, i) => {
    if (p.l === 1) rankSum += i + 1;
  });
  return (rankSum - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

/** Gini / Accuracy Ratio = 2 × AUC − 1 */
export function gini(scores: number[], labels: (0 | 1)[]): number {
  return 2 * aucRoc(scores, labels) - 1;
}

/** Directional accuracy: fraction of periods where predicted and actual move the same direction. */
export function directionalAccuracy(actual: number[], predicted: number[]): number {
  if (actual.length < 2 || predicted.length < 2) return 0;
  let correct = 0;
  for (let i = 1; i < actual.length; i++) {
    const aDir = actual[i] - actual[i - 1];
    const pDir = predicted[i] - predicted[i - 1];
    if ((aDir > 0 && pDir > 0) || (aDir < 0 && pDir < 0) || (aDir === 0 && pDir === 0)) {
      correct++;
    }
  }
  return correct / (actual.length - 1);
}

/** Percentile rank of subject in the peer array (0–1). */
export function percentileRank(subject: number, peers: number[]): number {
  if (peers.length === 0) return 0;
  const below = peers.filter((p) => p < subject).length;
  return below / peers.length;
}

/** Median of an array. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Precision = TP / (TP + FP) at a given binary threshold. */
export function precision(scores: number[], labels: (0 | 1)[], threshold: number): number {
  const tp = scores.filter((s, i) => s >= threshold && labels[i] === 1).length;
  const fp = scores.filter((s, i) => s >= threshold && labels[i] === 0).length;
  return tp + fp === 0 ? 0 : tp / (tp + fp);
}

/** Recall = TP / (TP + FN) at a given binary threshold. */
export function recall(scores: number[], labels: (0 | 1)[], threshold: number): number {
  const tp = scores.filter((s, i) => s >= threshold && labels[i] === 1).length;
  const fn = scores.filter((s, i) => s < threshold && labels[i] === 1).length;
  return tp + fn === 0 ? 0 : tp / (tp + fn);
}

/** Variance share decomposition: shareᵢ = |effectᵢ| / Σ|effectⱼ| */
export function varianceShares(effects: number[]): number[] {
  const total = effects.reduce((s, e) => s + Math.abs(e), 0);
  if (total === 0) return effects.map(() => 0);
  return effects.map((e) => Math.abs(e) / total);
}
