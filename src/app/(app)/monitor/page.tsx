'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useModels } from '@/lib/store/models-context';
import { usePermissions } from '@/hooks/usePermissions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TierBadge } from '@/components/ui/TierBadge';
import { Button } from '@/components/ui/Button';
import { MacroPanel } from '@/components/features/monitor/MacroPanel';
import { MonitoringCalendar } from '@/components/features/monitor/MonitoringCalendar';
import { AddModelSheet } from '@/components/features/add-model/AddModelSheet';
import { getCalendar } from '@/lib/repo';
import type { Model, MonitoringCalendarEntry } from '@/types';

export default function MonitorPage() {
  const { models, loading: modelsLoading } = useModels();
  const { canViewAllModels, canAddModel } = usePermissions();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [calendarEntries, setCalendarEntries] = useState<MonitoringCalendarEntry[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);

  const scopedModels = canViewAllModels ? models : models.filter((m) => m.owner === 'Sarah Chen');

  useEffect(() => {
    if (!selectedModel) return;
    setCalendarLoading(true);
    getCalendar(selectedModel.id)
      .then(setCalendarEntries)
      .finally(() => setCalendarLoading(false));
  }, [selectedModel]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Monitoring</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Performance Monitor</h1>
        </div>
        {canAddModel && (
          <Button variant="primary" size="sm" onClick={() => setShowAddModel(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Model
          </Button>
        )}
      </div>

      <SurfaceCard title="Macro Environment" eyebrow="Economic Indicators">
        <MacroPanel />
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <SurfaceCard title="Models" noPadding>
          <ul className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
            {modelsLoading ? (
              <li className="text-small px-4 py-3 text-ink-muted">Loading…</li>
            ) : scopedModels.length === 0 ? (
              <li className="text-small px-4 py-3 text-ink-muted">No models in scope.</li>
            ) : (
              scopedModels.map((model) => {
                const isSelected = selectedModel?.id === model.id;
                return (
                  <li key={model.id}>
                    <button
                      onClick={() => setSelectedModel(model)}
                      className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                        isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'
                      }`}
                      style={
                        isSelected
                          ? { borderLeft: '3px solid var(--accent)' }
                          : { borderLeft: '3px solid transparent' }
                      }
                      aria-pressed={isSelected}
                    >
                      <TierBadge tier={model.tier} />
                      <div className="min-w-0">
                        <p className="text-small truncate font-medium text-ink">{model.name}</p>
                        <p className="text-caption text-ink-muted">{model.id}</p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </SurfaceCard>

        <div>
          {selectedModel ? (
            calendarLoading ? (
              <SurfaceCard>
                <p className="text-small text-ink-muted">Loading calendar…</p>
              </SurfaceCard>
            ) : (
              <MonitoringCalendar modelId={selectedModel.id} entries={calendarEntries} />
            )
          ) : (
            <SurfaceCard>
              <div className="py-12 text-center">
                <p className="text-small text-ink-muted">
                  Select a model to view its monitoring calendar.
                </p>
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>

      {showAddModel && (
        <AddModelSheet
          onClose={() => setShowAddModel(false)}
          onSaved={() => setShowAddModel(false)}
        />
      )}
    </div>
  );
}
