'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useModels } from '@/lib/store/models-context';
import { useSubmissions } from '@/lib/store/submissions-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Button } from '@/components/ui/Button';
import {
  ModelFilters,
  categoryMatch,
  type InventoryFilters,
} from '@/components/features/inventory/ModelFilters';
import { ModelTable } from '@/components/features/inventory/ModelTable';
import { AddModelSheet } from '@/components/features/add-model/AddModelSheet';
import { SubmissionStatusCard } from '@/components/features/add-model/SubmissionStatusCard';
import type { ModelSubmission } from '@/types';

export default function InventoryPage() {
  const { models, loading } = useModels();
  const { submissions, retryDataGen } = useSubmissions();
  const { role } = useRole();
  const { canViewAllModels, canAddModel } = usePermissions();

  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: '',
    status: '',
    tier: '',
  });
  const [showAddModel, setShowAddModel] = useState(false);
  const [revisingSubmission, setRevisingSubmission] = useState<ModelSubmission | null>(null);

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

  // Pending models visible to this user
  const pendingSubmissions = useMemo(() => {
    const mySubmissions = canViewAllModels
      ? submissions
      : submissions.filter((s) => s.model.owner === 'Sarah Chen');
    return mySubmissions.filter(
      (s) =>
        s.status === 'draft' ||
        s.status === 'awaiting_review' ||
        s.status === 'changes_requested' ||
        s.status === 'approved' ||
        s.status === 'data_gen_failed'
    );
  }, [submissions, canViewAllModels]);

  const scopeLabel =
    role === 'mrm'
      ? `All ${models.length} models`
      : `${scopedModels.length} of ${models.length} models in scope`;

  function handleReviseDraft(sub: ModelSubmission) {
    setRevisingSubmission(sub);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Models</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Model Inventory</h1>
        </div>
        <div className="mt-1 flex items-center gap-3">
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

          {canAddModel && (
            <Button variant="primary" size="sm" onClick={() => setShowAddModel(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Model
            </Button>
          )}
        </div>
      </div>

      {/* Pending submissions — owner-side view */}
      {pendingSubmissions.length > 0 && (
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Pending Models ({pendingSubmissions.length})
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingSubmissions.map((sub) => (
              <SubmissionStatusCard
                key={sub.id}
                submission={sub}
                onRevise={handleReviseDraft}
                onRetry={retryDataGen}
              />
            ))}
          </div>
        </div>
      )}

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
          <div className="px-6 py-8 text-center text-body-sm text-ink-muted">Loading models…</div>
        ) : (
          <ModelTable models={filtered} />
        )}
      </SurfaceCard>

      {/* Add model drawer */}
      {showAddModel && (
        <AddModelSheet
          onClose={() => setShowAddModel(false)}
          onSaved={(id) => {
            toast.success(`Model ${id} submitted for review`);
            setShowAddModel(false);
          }}
        />
      )}

      {/* Revise draft / changes-requested drawer */}
      {revisingSubmission && (
        <AddModelSheet
          onClose={() => setRevisingSubmission(null)}
          onSaved={() => setRevisingSubmission(null)}
          existingSubmission={revisingSubmission}
        />
      )}
    </div>
  );
}
