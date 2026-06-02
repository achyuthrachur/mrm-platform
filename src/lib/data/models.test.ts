import { describe, it, expect } from 'vitest';
import { MODELS, SHOWCASE_MODEL_IDS } from './models';

describe('MODELS seed data', () => {
  it('contains exactly 16 models', () => {
    expect(MODELS).toHaveLength(16);
  });

  it('contains the 4 showcase model IDs', () => {
    const ids = MODELS.map((m) => m.id);
    expect(ids).toContain('CECL-2024-001');
    expect(ids).toContain('AML-2024-001');
    expect(ids).toContain('ALM-2024-001');
    expect(ids).toContain('FRAUD-2024-001');
  });

  it('SHOWCASE_MODEL_IDS contains exactly 4 models', () => {
    expect(SHOWCASE_MODEL_IDS.size).toBe(4);
  });

  it('all models have required fields', () => {
    for (const m of MODELS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect([1, 2, 3]).toContain(m.tier);
      expect(['High', 'Medium', 'Low']).toContain(m.risk);
      expect(m.owner).toBeTruthy();
      expect(m.sources.length).toBeGreaterThan(0);
    }
  });

  it('showcase models have selectedTests', () => {
    const showcase = MODELS.filter((m) => SHOWCASE_MODEL_IDS.has(m.id));
    for (const m of showcase) {
      expect(m.selectedTests?.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('all IDs are unique', () => {
    const ids = MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
