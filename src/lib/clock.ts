/**
 * Clock seam — demo "now" is fixed so Due/Overdue and history dots are deterministic.
 * All date logic goes through getToday(). Do not call new Date() anywhere in app code.
 */

const DEMO_NOW = '2026-04-07';

export function getToday(): string {
  return DEMO_NOW;
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date(DEMO_NOW);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysSince(dateStr: string): number {
  return -getDaysUntil(dateStr);
}

export type DueDateStatus = 'Current' | 'Due' | 'Overdue';

export function getDueDateStatus(nextDue: string): DueDateStatus {
  const daysUntil = getDaysUntil(nextDue);
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil <= 14) return 'Due';
  return 'Current';
}

/** Format a date offset by N days from a base date string. */
export function offsetDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isOverdue(nextDue: string): boolean {
  return getDaysUntil(nextDue) < 0;
}

export function isDue(nextDue: string): boolean {
  const d = getDaysUntil(nextDue);
  return d >= 0 && d <= 14;
}
