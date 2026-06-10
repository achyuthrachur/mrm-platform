import { describe, it, expect } from 'vitest';
import { seedFromModelId, generateModelDatasets } from './data-gen';
import type { ModelSubmission } from '@/types';

const BASE_SUBMISSION: ModelSubmission = {
  id: 'SUB-2026-001',
  modelId: 'CECL-2026-001',
  status: 'approved',
  model: { cat: 'CECL', name: 'Test Model', tier: 2 },
  selectedTests: [
    { testType: 'psi', frequency: 'Quarterly', srRef: 'SR 26-2 §II.D' },
    { testType: 'backtesting', frequency: 'Quarterly', srRef: 'SR 11-7 §II.B' },
    { testType: 'source-to-model', frequency: 'Monthly', srRef: 'SR 11-7 §I.D' },
  ],
  thresholdConfigs: [],
  mrmNotes: '',
  priorNotes: [],
  auditTrail: [],
};

describe('seedFromModelId', () => {
  it('returns a positive integer', () => {
    const seed = seedFromModelId('CECL-2026-001');
    expect(seed).toBeGreaterThan(0);
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('same modelId always produces the same seed', () => {
    expect(seedFromModelId('CECL-2026-001')).toBe(seedFromModelId('CECL-2026-001'));
  });

  it('different modelIds produce different seeds', () => {
    expect(seedFromModelId('CECL-2026-001')).not.toBe(seedFromModelId('FRAUD-2026-001'));
  });
});

describe('generateModelDatasets — determinism', () => {
  it('same modelId + seed → identical datasets', async () => {
    const result1 = await generateModelDatasets(BASE_SUBMISSION);
    const result2 = await generateModelDatasets(BASE_SUBMISSION);

    expect(result1.datasets.length).toBe(result2.datasets.length);
    expect(result1.datasets[0].rowCount).toBe(result2.datasets[0].rowCount);

    // Deep equality of first dataset rows
    expect(JSON.stringify(result1.datasets[0].rows)).toBe(JSON.stringify(result2.datasets[0].rows));
  });

  it('different modelIds → different datasets', async () => {
    const other = { ...BASE_SUBMISSION, modelId: 'FRAUD-2026-001' };
    const r1 = await generateModelDatasets(BASE_SUBMISSION);
    const r2 = await generateModelDatasets(other);
    // Row count may differ (same template), but numeric values must differ
    const v1 = JSON.stringify(r1.datasets[0].rows);
    const v2 = JSON.stringify(r2.datasets[0].rows);
    expect(v1).not.toBe(v2);
  });
});

describe('generateModelDatasets — completeness', () => {
  it('every selected test has at least one dataset', async () => {
    const result = await generateModelDatasets(BASE_SUBMISSION);
    const coveredTypes = new Set(result.datasets.map((d) => d.testType));
    for (const st of BASE_SUBMISSION.selectedTests) {
      expect(coveredTypes.has(st.testType)).toBe(true);
    }
  });

  it('returns complete status for CECL with no threshold overrides', async () => {
    const result = await generateModelDatasets(BASE_SUBMISSION);
    expect(result.status).toBe('complete');
  });

  it('returns partial status with warnings for unknown category', async () => {
    const sub: ModelSubmission = {
      ...BASE_SUBMISSION,
      modelId: 'OTHER-2026-001',
      model: { cat: 'SomeNewCategory', name: 'Unknown Model', tier: 3 },
      selectedTests: [{ testType: 'backtesting', frequency: 'Quarterly', srRef: 'SR 11-7 §II.B' }],
    };
    const result = await generateModelDatasets(sub);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.status).toBe('partial');
  });
});

describe('generateModelDatasets — categories', () => {
  const CATEGORIES = [
    { cat: 'BSA/AML', tests: ['source-to-model', 'backtesting'] },
    { cat: 'ALM', tests: ['source-to-model', 'stress'] },
    { cat: 'Fraud', tests: ['backtesting', 'psi'] },
  ] as const;

  for (const { cat, tests } of CATEGORIES) {
    it(`generates datasets for ${cat}`, async () => {
      const sub: ModelSubmission = {
        ...BASE_SUBMISSION,
        modelId: `${cat.replace(/\//g, '-')}-2026-001`,
        model: { cat, name: `${cat} Test`, tier: 2 },
        selectedTests: tests.map((t) => ({
          testType: t as never,
          frequency: 'Quarterly',
          srRef: 'SR 11-7',
        })),
      };
      const result = await generateModelDatasets(sub);
      expect(result.datasets.length).toBeGreaterThan(0);
      expect(result.modelId).toBe(sub.modelId);
    });
  }
});

describe('generateModelDatasets — threshold awareness', () => {
  it('respects custom PSI threshold (tighter stable limit)', async () => {
    const sub: ModelSubmission = {
      ...BASE_SUBMISSION,
      thresholdConfigs: [
        {
          testKey: 'psi',
          testType: 'psi',
          fields: { psi_stable: 0.08, psi_monitor: 0.2 },
          overridesDefault: true,
          mrmAcknowledged: true,
        },
      ],
    };
    // Should complete without throwing — threshold-aware generation
    const result = await generateModelDatasets(sub);
    expect(result.datasets.length).toBeGreaterThan(0);
  });
});
