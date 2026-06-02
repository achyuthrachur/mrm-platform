import { describe, it, expect } from 'vitest';
import { mulberry32, normalSample, clamp } from './prng';

describe('mulberry32 PRNG', () => {
  it('produces values in [0, 1)', () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic — same seed, same sequence', () => {
    const r1 = mulberry32(999);
    const r2 = mulberry32(999);
    for (let i = 0; i < 100; i++) {
      expect(r1()).toBe(r2());
    }
  });

  it('different seeds produce different sequences', () => {
    const r1 = mulberry32(1);
    const r2 = mulberry32(2);
    const seq1 = Array.from({ length: 10 }, () => r1());
    const seq2 = Array.from({ length: 10 }, () => r2());
    expect(seq1).not.toEqual(seq2);
  });
});

describe('normalSample', () => {
  it('produces values centered near the mean (large sample)', () => {
    const rand = mulberry32(42);
    const samples = Array.from({ length: 10000 }, () => normalSample(rand, 5, 1));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(Math.abs(mean - 5)).toBeLessThan(0.1);
  });
});

describe('clamp', () => {
  it('clamps values to [lo, hi]', () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-5, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});
