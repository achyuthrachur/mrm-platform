'use client';

import { useState } from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TierBadge } from '@/components/ui/TierBadge';
import { cn } from '@/lib/utils';
import type { Model } from '@/types';

interface RiskHeatMapProps {
  models: Model[];
}

interface TooltipState {
  model: Model;
  x: number;
  y: number;
}

const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const IMPACT_LABELS = ['Minimal', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

const CELL_COLOR = (likelihood: number, impact: number): string => {
  const score = likelihood * impact;
  if (score >= 16) return 'bg-[rgba(229,55,107,0.25)]';
  if (score >= 9) return 'bg-[rgba(215,118,29,0.20)]';
  if (score >= 4) return 'bg-[rgba(245,168,0,0.12)]';
  return 'bg-[rgba(255,255,255,0.04)]';
};

export function RiskHeatMap({ models }: RiskHeatMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const modelsWithHeat = models.filter((m) => m.heatX !== undefined && m.heatY !== undefined);

  function getModelsAt(x: number, y: number): Model[] {
    return modelsWithHeat.filter((m) => m.heatX === x && m.heatY === y);
  }

  return (
    <SurfaceCard title="Risk Heat Map" eyebrow="Likelihood × Impact">
      <div className="relative" aria-label="Risk heat map grid">
        {/* Y-axis label */}
        <div className="flex gap-2">
          <div className="flex w-8 shrink-0 flex-col-reverse justify-between">
            {IMPACT_LABELS.map((label, i) => (
              <span key={i} className="py-1 text-right text-caption leading-none text-ink-muted">
                {i + 1}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div
              className="grid gap-1"
              style={{ gridTemplateRows: 'repeat(5, 1fr)', gridTemplateColumns: 'repeat(5, 1fr)' }}
            >
              {Array.from({ length: 5 }, (_, row) => 5 - row).map((impact) =>
                Array.from({ length: 5 }, (_, col) => col + 1).map((likelihood) => {
                  const cell = getModelsAt(likelihood, impact);
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className={cn(
                        'relative flex h-10 items-center justify-center rounded',
                        CELL_COLOR(likelihood, impact),
                        'border border-[var(--border-hairline)]'
                      )}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {cell.map((model, i) => (
                        <button
                          key={model.id}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-caption font-bold transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]',
                            model.risk === 'High'
                              ? 'bg-[var(--status-fail)] text-white'
                              : model.risk === 'Medium'
                                ? 'bg-[var(--status-warn)] text-white'
                                : 'bg-[var(--status-pass)] text-white'
                          )}
                          style={{ marginLeft: i > 0 ? '-4px' : 0, zIndex: i + 1 }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ model, x: rect.right, y: rect.top });
                          }}
                          aria-label={`${model.name} at likelihood ${likelihood}, impact ${impact}`}
                        >
                          {model.tier}
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* X-axis labels */}
            <div className="mt-1 grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {LIKELIHOOD_LABELS.map((label, i) => (
                <span key={i} className="text-center text-caption leading-none text-ink-muted">
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Axis titles */}
        <div className="mt-1 flex gap-2">
          <div className="w-8 shrink-0" />
          <div className="flex-1 text-center">
            <span className="text-caption text-ink-muted">Likelihood →</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 rounded-card p-3 shadow-card-lg"
            style={{
              backgroundColor: '#002E62',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              left: tooltip.x + 8,
              top: tooltip.y - 8,
              minWidth: 200,
              fontSize: 12,
              pointerEvents: 'none',
            }}
            role="tooltip"
          >
            <p className="font-semibold">{tooltip.model.name}</p>
            <p className="mt-0.5 text-white/60">{tooltip.model.id}</p>
            <div className="mt-2 flex items-center gap-2">
              <TierBadge tier={tooltip.model.tier} />
              <span className="text-white/60">{tooltip.model.risk} Risk</span>
            </div>
            <p className="mt-1 text-white/60">{tooltip.model.status}</p>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
