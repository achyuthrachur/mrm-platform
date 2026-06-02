import { describe, it, expect } from 'vitest';
import { categoryMatch } from './ModelFilters';

describe('categoryMatch', () => {
  it('returns true for empty filter (all)', () => {
    expect(categoryMatch('CECL', '')).toBe(true);
    expect(categoryMatch('BSA/AML', '')).toBe(true);
  });

  it('matches exact category', () => {
    expect(categoryMatch('CECL', 'CECL')).toBe(true);
    expect(categoryMatch('BSA/AML', 'BSA/AML')).toBe(true);
    expect(categoryMatch('ALM', 'CECL')).toBe(false);
  });

  it('__other__ matches non-standard categories', () => {
    expect(categoryMatch('Capital', '__other__')).toBe(true);
    expect(categoryMatch('PPNR', '__other__')).toBe(true);
    expect(categoryMatch('Op Risk', '__other__')).toBe(true);
    expect(categoryMatch('Liquidity', '__other__')).toBe(true);
    expect(categoryMatch('Market Risk', '__other__')).toBe(true);
  });

  it('__other__ does not match standard categories', () => {
    expect(categoryMatch('CECL', '__other__')).toBe(false);
    expect(categoryMatch('BSA/AML', '__other__')).toBe(false);
    expect(categoryMatch('ALM', '__other__')).toBe(false);
    expect(categoryMatch('Fraud', '__other__')).toBe(false);
  });
});
