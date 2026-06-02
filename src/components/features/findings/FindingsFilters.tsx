'use client';

import { cn } from '@/lib/utils';

export type FindingFilterValue =
  | 'All'
  | 'Open'
  | 'In Remediation'
  | 'Closed'
  | 'Critical'
  | 'High'
  | 'Flagged';

interface FindingsFiltersProps {
  active: FindingFilterValue;
  onChange: (v: FindingFilterValue) => void;
  counts: Partial<Record<FindingFilterValue, number>>;
}

const PILLS: FindingFilterValue[] = [
  'All',
  'Open',
  'In Remediation',
  'Closed',
  'Critical',
  'High',
  'Flagged',
];

export function FindingsFilters({ active, onChange, counts }: FindingsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter findings">
      {PILLS.map((pill) => {
        const count = counts[pill];
        const isActive = active === pill;
        return (
          <button
            key={pill}
            onClick={() => onChange(pill)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-small font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]',
              isActive
                ? 'bg-[var(--ink)] text-white'
                : 'bg-[var(--canvas)] text-ink-secondary hover:bg-[var(--border-hairline)] hover:text-ink'
            )}
            aria-pressed={isActive}
          >
            {pill}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-caption font-bold leading-none',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--border-hairline)] text-ink-secondary'
                )}
                aria-label={`${count} findings`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
