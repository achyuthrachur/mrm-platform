'use client';

import { cn } from '@/lib/utils';
import type { ThresholdField as ThresholdFieldDef } from '@/types';

interface ThresholdFieldProps {
  field: ThresholdFieldDef;
  value: number;
  onChange: (key: string, value: number) => void;
  isOverride?: boolean;
}

export function ThresholdField({ field, value, onChange, isOverride }: ThresholdFieldProps) {
  const rangeMin = field.min;
  const rangeMax = field.max;
  const pct = ((value - rangeMin) / (rangeMax - rangeMin)) * 100;

  function handleChange(raw: string) {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    const clamped = Math.max(field.min, Math.min(field.max, n));
    onChange(field.key, clamped);
  }

  const unitLabel = field.unit === '%' ? '%' : field.unit === 'decimal' ? '(0–1)' : field.unit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`tf-${field.key}`}
          className={cn(
            'text-body-sm font-medium',
            isOverride ? 'text-[var(--status-warn)]' : 'text-ink'
          )}
        >
          {field.label}
          {isOverride && (
            <span
              className="ml-1.5 rounded px-1.5 py-0.5 text-caption"
              style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
            >
              override
            </span>
          )}
        </label>
        <span className="shrink-0 text-caption text-ink-muted">{unitLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`tf-${field.key}`}
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          step={field.unit === '%' ? 0.5 : 0.001}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            'w-28 rounded-control border bg-surface-sunken px-2.5 py-1.5 text-body-sm tabular-nums text-ink',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]',
            isOverride && 'border-[var(--status-warn)]'
          )}
          style={{ borderColor: isOverride ? 'var(--status-warn)' : 'var(--border-hairline)' }}
          aria-describedby={`tf-${field.key}-desc`}
        />
        {/* Mini range bar */}
        <div
          className="relative h-1.5 flex-1 overflow-hidden rounded-pill"
          style={{ backgroundColor: 'var(--neutral-200)' }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-pill transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, pct))}%`,
              backgroundColor: isOverride ? 'var(--status-warn)' : 'var(--accent)',
            }}
          />
        </div>
        <span className="w-20 text-right text-caption tabular-nums text-ink-muted">
          {rangeMin} – {rangeMax}
        </span>
      </div>

      <p id={`tf-${field.key}-desc`} className="text-caption text-ink-muted">
        {field.description} <span className="text-ink-muted/70 font-mono">({field.reference})</span>
      </p>
    </div>
  );
}
