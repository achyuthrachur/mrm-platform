import { describe, it, expect } from 'vitest';
import { ILLUSTRATIVE_RESULTS } from './illustrative-results';
import { SHOWCASE_MODEL_IDS } from './models';

describe('Illustrative results', () => {
  it('none have computed: true', () => {
    const computedEntries = ILLUSTRATIVE_RESULTS.filter((r) => r.computed === true);
    expect(computedEntries).toHaveLength(0);
  });

  it('none carry a FormulaTrace', () => {
    const withFormula = ILLUSTRATIVE_RESULTS.filter((r) => r.formula !== undefined);
    expect(withFormula).toHaveLength(0);
  });

  it('all belong to non-showcase models', () => {
    const showcaseEntries = ILLUSTRATIVE_RESULTS.filter((r) => SHOWCASE_MODEL_IDS.has(r.modelId));
    expect(showcaseEntries).toHaveLength(0);
  });

  it('all have verdict, trafficLight, metrics, and recommendation', () => {
    for (const r of ILLUSTRATIVE_RESULTS) {
      expect(['pass', 'warn', 'fail']).toContain(r.verdict);
      expect(['Green', 'Yellow', 'Red']).toContain(r.trafficLight);
      expect(r.metrics.length).toBeGreaterThan(0);
      expect(r.recommendation.length).toBeGreaterThan(0);
    }
  });
});
