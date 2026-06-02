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
  const trendColors = {
    up: 'text-[var(--status-pass)]',
    down: 'text-[var(--status-fail)]',
    flat: 'text-ink-muted',
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-card bg-surface p-5',
        accent && 'border-l-[3px] border-[var(--accent)]',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span className="text-caption font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span
        className="font-display text-h1 font-bold tabular-nums leading-none text-ink"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
      {(sub || trendValue) && (
        <div className="mt-0.5 flex items-center gap-1.5">
          {trendValue && trend && (
            <span className={cn('text-small font-medium', trendColors[trend])}>{trendValue}</span>
          )}
          {sub && <span className="text-small text-ink-muted">{sub}</span>}
        </div>
      )}
    </div>
  );
}
