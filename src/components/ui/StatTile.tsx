'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  accent?: boolean;
  className?: string;
}

export function StatTile({
  label,
  value,
  sub,
  trend,
  trendValue,
  accent = false,
  className,
}: StatTileProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const trendColor = {
    up: 'text-[var(--status-pass)]',
    down: 'text-[var(--status-fail)]',
    flat: 'text-ink-muted',
  };
  const trendArrow = { up: '↑', down: '↓', flat: '→' };

  useEffect(() => {
    const el = valueRef.current;
    if (!el || typeof value !== 'number') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = String(value);
      return;
    }
    const target = value;
    const duration = 650;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-card bg-surface p-5 shadow-elev-1',
        accent && 'border-l-[3px] border-[var(--accent)]',
        className
      )}
    >
      <span className="text-eyebrow uppercase tracking-[0.06em] text-ink-muted">{label}</span>
      <span
        ref={valueRef}
        className="font-display text-display-xl font-bold tabular-nums leading-none text-ink"
      >
        {value}
      </span>
      {sub || trendValue ? (
        <div className="flex items-center gap-1.5">
          {trendValue && trend && (
            <span className={cn('text-body-sm font-medium', trendColor[trend])}>
              {trendArrow[trend]} {trendValue}
            </span>
          )}
          {sub && <span className="text-body-sm text-ink-muted">{sub}</span>}
        </div>
      ) : null}
    </div>
  );
}
