import { describe, it, expect } from 'vitest';
import { MODELS } from '@/lib/data/models';
import { FINDINGS } from '@/lib/data/findings';

describe('Dashboard KPI derivation', () => {
  it('total models count derives from MODELS', () => {
    expect(MODELS.length).toBe(16);
  });

  it('tier-1 count matches MODELS data', () => {
    const tier1 = MODELS.filter((m) => m.tier === 1).length;
    expect(tier1).toBeGreaterThan(0);
    expect(tier1).toBeLessThan(MODELS.length);
  });

  it('open findings count derives from FINDINGS', () => {
    const open = FINDINGS.filter((f) => f.status !== 'Closed').length;
    expect(open).toBeGreaterThan(0);
    expect(open).toBeLessThanOrEqual(FINDINGS.length);
  });

  it('owner-scoped models are a strict subset', () => {
    const ownerModels = MODELS.filter((m) => m.owner === 'Sarah Chen');
    expect(ownerModels.length).toBeGreaterThan(0);
    expect(ownerModels.length).toBeLessThan(MODELS.length);
    ownerModels.forEach((m) => expect(m.owner).toBe('Sarah Chen'));
  });

  it('findings with flaggedForReview are a subset of all findings', () => {
    const flagged = FINDINGS.filter((f) => f.flaggedForReview);
    expect(flagged.length).toBeGreaterThan(0);
    flagged.forEach((f) => expect(FINDINGS.some((ff) => ff.id === f.id)).toBe(true));
  });

  it('all models have heatX/heatY or neither', () => {
    MODELS.forEach((m) => {
      if (m.heatX !== undefined) {
        expect(m.heatY).toBeDefined();
        expect(m.heatX).toBeGreaterThanOrEqual(1);
        expect(m.heatX).toBeLessThanOrEqual(5);
        expect(m.heatY).toBeGreaterThanOrEqual(1);
        expect(m.heatY).toBeLessThanOrEqual(5);
      }
    });
  });
});
