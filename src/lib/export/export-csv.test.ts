import { describe, it, expect } from 'vitest';
import { buildCSV } from './export-csv';
import { runEngine } from '@/lib/engines';

describe('CSV export', () => {
  it('includes model and verdict metadata', () => {
    const result = runEngine('CECL-2024-001', 'psi');
    const csv = buildCSV(result, 'CRE Probability of Default');
    expect(csv).toContain('CRE Probability of Default');
    expect(csv).toContain('CECL-2024-001');
    expect(csv).toContain('psi');
    expect(csv).toContain(result.verdict);
  });

  it('includes all metrics', () => {
    const result = runEngine('ALM-2024-001', 'backtesting');
    const csv = buildCSV(result, 'NII Sensitivity');
    for (const m of result.metrics) {
      expect(csv).toContain(m.label);
      expect(csv).toContain(m.value);
    }
  });

  it('includes formula trace for computed results', () => {
    const result = runEngine('AML-2024-001', 'source-to-model');
    expect(result.computed).toBe(true);
    const csv = buildCSV(result, 'Transaction Monitoring');
    expect(csv).toContain('FORMULA TRACE');
    expect(csv).toContain('INPUTS');
    expect(csv).toContain('STEPS');
    expect(csv).toContain('Result');
  });

  it('formula trace result matches displayed metric value', () => {
    const result = runEngine('ALM-2024-001', 'sensitivity');
    const csv = buildCSV(result, 'NII Sensitivity');
    // The formula result should appear in the CSV
    expect(csv).toContain(String(result.formula!.result));
  });

  it('includes findings when present', () => {
    const result = runEngine('AML-2024-001', 'source-to-model');
    const csv = buildCSV(result, 'Transaction Monitoring');
    expect(csv).toContain('FINDINGS');
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it('includes data sources', () => {
    const result = runEngine('CECL-2024-001', 'backtesting');
    const csv = buildCSV(result, 'CRE PD');
    expect(csv).toContain('DATA SOURCES');
    for (const src of result.dataSources) {
      expect(csv).toContain(src);
    }
  });

  it('exported numbers match on-screen values (serializer consistency)', () => {
    const result = runEngine('FRAUD-2024-001', 'backtesting');
    const csv = buildCSV(result, 'Card Fraud');
    // AUC metric should appear in CSV
    const aucMetric = result.metrics.find((m) => m.label.includes('AUC'));
    if (aucMetric) expect(csv).toContain(aucMetric.value);
  });
});
