import { describe, it, expect } from 'vitest';
import { getToday, getDaysUntil, getDueDateStatus, isOverdue, isDue } from './clock';

describe('clock seam', () => {
  it('getToday returns the fixed demo date', () => {
    expect(getToday()).toBe('2026-04-07');
  });

  it('getDaysUntil returns positive for future dates', () => {
    expect(getDaysUntil('2026-04-17')).toBe(10);
  });

  it('getDaysUntil returns negative for past dates', () => {
    expect(getDaysUntil('2026-03-28')).toBe(-10);
  });

  it('getDaysUntil returns 0 for today', () => {
    expect(getDaysUntil('2026-04-07')).toBe(0);
  });

  it('getDueDateStatus: Overdue for past due dates', () => {
    expect(getDueDateStatus('2026-03-01')).toBe('Overdue');
  });

  it('getDueDateStatus: Due within 14 days', () => {
    expect(getDueDateStatus('2026-04-14')).toBe('Due');
  });

  it('getDueDateStatus: Current for future dates beyond 14 days', () => {
    expect(getDueDateStatus('2026-06-01')).toBe('Current');
  });

  it('isOverdue: returns true for past dates', () => {
    expect(isOverdue('2026-01-01')).toBe(true);
    expect(isOverdue('2026-04-08')).toBe(false);
  });

  it('isDue: returns true for dates within next 14 days', () => {
    expect(isDue('2026-04-10')).toBe(true); // 3 days away → due
    expect(isDue('2026-04-22')).toBe(false); // 15 days away → not due
    expect(isDue('2026-03-01')).toBe(false); // past → not due
  });
});
