'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface InventoryFilters {
  search: string;
  category: string;
  status: string;
  tier: string;
}

interface ModelFiltersProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
  categories: string[];
  statuses: string[];
}

const CATEGORY_PILLS = [
  { label: 'All', value: '' },
  { label: 'CECL', value: 'CECL' },
  { label: 'BSA/AML', value: 'BSA/AML' },
  { label: 'ALM', value: 'ALM' },
  { label: 'Fraud', value: 'Fraud' },
  { label: 'Other', value: '__other__' },
];

const OTHER_CATS = new Set(['CECL', 'BSA/AML', 'ALM', 'Fraud']);

export function categoryMatch(modelCat: string, filterValue: string): boolean {
  if (!filterValue) return true;
  if (filterValue === '__other__') return !OTHER_CATS.has(modelCat);
  return modelCat === filterValue;
}

export function ModelFilters({ filters, onChange }: ModelFiltersProps) {
  function set<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search models — name, ID, category..."
          className="placeholder-ink-muted w-full rounded-md border bg-surface py-2 pl-9 pr-4 text-small text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
          style={{ borderColor: 'var(--border-hairline)' }}
          aria-label="Search models"
        />
      </div>

      {/* Category pills + selects */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => set('category', pill.value)}
            className={cn(
              'rounded-chip px-3 py-1 text-small font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]',
              filters.category === pill.value
                ? 'bg-[var(--ink)] text-white'
                : 'bg-[var(--canvas)] text-ink-secondary hover:bg-[var(--border-hairline)] hover:text-ink'
            )}
            aria-pressed={filters.category === pill.value}
          >
            {pill.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {/* Tier select */}
          <select
            value={filters.tier}
            onChange={(e) => set('tier', e.target.value)}
            className="rounded border bg-surface px-2 py-1 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            style={{ borderColor: 'var(--border-hairline)' }}
            aria-label="Filter by tier"
          >
            <option value="">All tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          {/* Status select */}
          <select
            value={filters.status}
            onChange={(e) => set('status', e.target.value)}
            className="rounded border bg-surface px-2 py-1 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            style={{ borderColor: 'var(--border-hairline)' }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="In Validation">In Validation</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>
    </div>
  );
}
