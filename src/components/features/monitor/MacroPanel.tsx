'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { VizCard } from '@/components/ui/VizCard';
import { MACRO_FALLBACK, MACRO_QUARTERLY } from '@/lib/data/macro';
import {
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_TOOLTIP_STYLE,
  CHART_COLORS,
} from '@/components/ui/ChartTheme';
import type { MacroSeries } from '@/types';

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TREND_COLOR = {
  up: CHART_COLORS.teal,
  down: CHART_COLORS.coral,
  flat: CHART_COLORS.whiteMuted,
};

export function MacroPanel() {
  const [macroData, setMacroData] = useState<MacroSeries[]>(MACRO_FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [drillDownId, setDrillDownId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () =>
        fetch('/api/macro', { signal: controller.signal })
          .then((r) => r.json())
          .then((json) => {
            if (json.data) {
              setMacroData(json.data);
              setIsLive(json.source === 'live');
            }
          })
          .catch(() => {}),
      100
    );
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const drillData = drillDownId ? MACRO_QUARTERLY[drillDownId] : null;
  const drillSeries = drillDownId ? macroData.find((m) => m.id === drillDownId) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {macroData.map((series) => {
          const Icon = TREND_ICON[series.trend];
          const trendColor = TREND_COLOR[series.trend];
          const isDrillOpen = drillDownId === series.id;
          return (
            <button
              key={series.id}
              onClick={() => setDrillDownId(isDrillOpen ? null : series.id)}
              className="group rounded-card p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
              style={{
                backgroundColor: 'var(--surface)',
                boxShadow: isDrillOpen ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
                border: isDrillOpen ? '1px solid var(--accent)' : '1px solid transparent',
              }}
              aria-expanded={isDrillOpen}
              aria-label={`${series.label}: ${series.value}${series.unit} — click to drill down`}
            >
              <div className="flex items-start justify-between">
                <span className="text-caption text-ink-muted">{series.label}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-caption font-medium"
                  style={{
                    backgroundColor: series.live ? 'var(--status-pass-bg)' : 'var(--canvas)',
                    color: series.live ? 'var(--status-pass)' : 'var(--ink-muted)',
                  }}
                  aria-label={series.live ? 'Live data' : 'Cached data'}
                >
                  {series.live ? 'Live' : 'Cached'}
                </span>
              </div>
              <p className="mt-1 text-h2 font-bold tabular-nums text-ink">
                {series.value}
                <span className="ml-1 text-small text-ink-muted">{series.unit}</span>
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <Icon
                  className="h-3 w-3 shrink-0"
                  style={{ color: trendColor }}
                  aria-hidden="true"
                />
                <span className="text-caption" style={{ color: trendColor }}>
                  {series.change >= 0 ? '+' : ''}
                  {series.change} {series.unit}
                </span>
                <span className="ml-1 text-caption text-ink-muted">vs prior</span>
              </div>
            </button>
          );
        })}
      </div>

      {drillData && drillSeries && (
        <VizCard
          title={`${drillSeries.label} — Quarterly History`}
          eyebrow={`Source: ${drillSeries.source}`}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...drillData]} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID_STYLE} />
              <XAxis
                dataKey="quarter"
                tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 10 }}
                axisLine={CHART_AXIS_STYLE.axisLine}
                tickLine={false}
              />
              <YAxis tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: '#fff' }}
                formatter={(v: number) => [`${v}${drillSeries.unit}`, drillSeries.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.amber}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.amber, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </VizCard>
      )}

      {!isLive && (
        <div
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-caption text-ink-muted"
          style={{ backgroundColor: 'var(--canvas)' }}
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Macro data shown is cached — live fetch unavailable in this environment.
        </div>
      )}
    </div>
  );
}
