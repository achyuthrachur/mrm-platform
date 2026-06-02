import { describe, it, expect } from 'vitest';
import { getEngine, runEngine } from './index';
import type { TestType } from '@/types';

/**
 * Known-answer tests for all 16 computed (model, test) pairs.
 * Planted verdict map (Addendum §1):
 *   CECL-2024-001: STM=warn, PSI=warn, backtest=warn, stress=pass
 *   AML-2024-001:  STM=fail, backtest=pass, benchmark=warn, override=pass
 *   ALM-2024-001:  backtest=pass, sensitivity=warn, stress=warn, STM=pass
 *   FRAUD-2024-001: backtest=pass, PSI=warn, CSI=pass, benchmark=pass
 */

const COMPUTED_MATRIX: [string, TestType, 'pass' | 'warn' | 'fail'][] = [
  // CRE PD
  ['CECL-2024-001', 'source-to-model', 'warn'],
  ['CECL-2024-001', 'psi', 'warn'],
  ['CECL-2024-001', 'backtesting', 'warn'],
  ['CECL-2024-001', 'stress', 'pass'],
  // AML
  ['AML-2024-001', 'source-to-model', 'fail'],
  ['AML-2024-001', 'backtesting', 'pass'],
  ['AML-2024-001', 'benchmarking', 'warn'],
  ['AML-2024-001', 'override', 'pass'],
  // NII
  ['ALM-2024-001', 'backtesting', 'pass'],
  ['ALM-2024-001', 'sensitivity', 'warn'],
  ['ALM-2024-001', 'stress', 'warn'],
  ['ALM-2024-001', 'source-to-model', 'pass'],
  // Fraud
  ['FRAUD-2024-001', 'backtesting', 'pass'],
  ['FRAUD-2024-001', 'psi', 'warn'],
  ['FRAUD-2024-001', 'csi', 'pass'],
  ['FRAUD-2024-001', 'benchmarking', 'pass'],
];

describe('Engine registry', () => {
  it('returns an engine for each of the 16 computed pairs', () => {
    for (const [modelId, testType] of COMPUTED_MATRIX) {
      expect(getEngine(modelId, testType), `${modelId}:${testType}`).not.toBeNull();
    }
  });

  it('returns null for illustrative pairs', () => {
    expect(getEngine('CECL-2024-002', 'backtesting')).toBeNull();
    expect(getEngine('AML-2024-002', 'override')).toBeNull();
    expect(getEngine('FRAUD-2024-001', 'sensitivity')).toBeNull();
    expect(getEngine('NONEXISTENT', 'psi' as TestType)).toBeNull();
  });
});

describe('Computed pairs — planted verdicts', () => {
  it.each(COMPUTED_MATRIX)('%s × %s → %s', (modelId, testType, expectedVerdict) => {
    const result = runEngine(modelId, testType);
    expect(result.computed, `${modelId}:${testType} must be computed=true`).toBe(true);
    expect(result.verdict, `${modelId}:${testType} verdict`).toBe(expectedVerdict);
    expect(result.formula, `${modelId}:${testType} must have FormulaTrace`).toBeDefined();
    expect(result.metrics.length, `${modelId}:${testType} must have metrics`).toBeGreaterThan(0);
  });
});

describe('FormulaTrace completeness', () => {
  it('every computed result has a complete FormulaTrace', () => {
    for (const [modelId, testType] of COMPUTED_MATRIX) {
      const result = runEngine(modelId, testType);
      const trace = result.formula!;
      expect(trace.name, `${modelId}:${testType} name`).toBeTruthy();
      expect(trace.equation, `${modelId}:${testType} equation`).toBeTruthy();
      expect(Object.keys(trace.inputs).length, `${modelId}:${testType} inputs`).toBeGreaterThan(0);
      expect(trace.steps.length, `${modelId}:${testType} steps`).toBeGreaterThan(0);
      expect(trace.result, `${modelId}:${testType} result`).toBeTruthy();
      expect(trace.reference, `${modelId}:${testType} reference`).toContain('SR');
    }
  });
});

describe('MetricRow statuses reconcile to verdict', () => {
  it('each metric has a valid status', () => {
    for (const [modelId, testType] of COMPUTED_MATRIX) {
      const result = runEngine(modelId, testType);
      for (const m of result.metrics) {
        expect(['pass', 'warn', 'fail', 'info']).toContain(m.status);
      }
    }
  });
});
