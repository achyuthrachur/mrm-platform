/**
 * Mulberry32 — deterministic seeded PRNG.
 * Returns a function () => number in [0, 1).
 * Same seed always produces the same sequence.
 */
export function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal distribution approximation via Box-Muller (uses 2 PRNG calls). */
export function normalSample(rand: () => number, mean: number, std: number): number {
  const u1 = Math.max(1e-10, rand());
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

/** Clamp a value to [lo, hi]. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Pick a random integer in [0, n). */
export function randInt(rand: () => number, n: number): number {
  return Math.floor(rand() * n);
}

/** Pick a random element from an array. */
export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[randInt(rand, arr.length)];
}

/** Format a date N days relative to a base date string. */
export function offsetDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
