'use client';

import { useState, useMemo } from 'react';
import { useModels } from '@/lib/store/models-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import {
  ModelFilters,
  categoryMatch,
  type InventoryFilters,
} from '@/components/features/inventory/ModelFilters';
import { ModelTable } from '@/components/features/inventory/ModelTable';

export default function InventoryPage() {
  const { models, loading } = useModels();
  const { role } = useRole();
  const { canViewAllModels } = usePermissions();

  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: '',
    status: '',
    tier: '',
  });

  const scopedModels = canViewAllModels ? models : models.filter((m) => m.owner === 'Sarah Chen');

  const filtered = useMemo(() => {
    return scopedModels.filter((m) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.id.toLowerCase().includes(q) &&
          !m.cat.toLowerCase().includes(q) &&
          !m.owner.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (!categoryMatch(m.cat, filters.category)) return false;
      if (filters.status && !m.status.toLowerCase().includes(filters.status.toLowerCase()))
        return false;
      if (filters.tier && String(m.tier) !== filters.tier) return false;
      return true;
    });
  }, [scopedModels, filters]);

  const scopeLabel =
    role === 'mrm'
      ? `All ${models.length} models`
      : `${scopedModels.length} of ${models.length} models in scope`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Models</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Model Inventory</h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {!canViewAllModels && (
            <span
              className="rounded-chip px-2.5 py-1 text-caption font-medium"
              style={{
                backgroundColor: 'var(--status-warn-bg)',
                color: 'var(--status-warn)',
              }}
              aria-label={`Scope: ${scopeLabel}`}
            >
              {scopeLabel}
            </span>
          )}
          {canViewAllModels && <span className="text-caption text-ink-muted">{scopeLabel}</span>}
        </div>
      </div>

      {/* Filters + table */}
      <SurfaceCard noPadding>
        <div className="px-6 pb-4 pt-5">
          <ModelFilters
            filters={filters}
            onChange={setFilters}
            categories={[...new Set(models.map((m) => m.cat))]}
            statuses={[...new Set(models.map((m) => m.status))]}
          />
          <p className="mt-3 text-caption text-ink-muted">
            {loading ? 'Loading…' : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-small text-ink-muted">Loading models…</div>
        ) : (
          <ModelTable models={filtered} />
        )}
      </SurfaceCard>
    </div>
  );
}
