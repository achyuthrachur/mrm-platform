'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
  Legend,
} from 'recharts';
import { VizCard } from '@/components/ui/VizCard';
import {
  CHART_COLORS,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_TOOLTIP_STYLE,
} from '@/components/ui/ChartTheme';

interface ResultChartProps {
  chartType: string;
  chartData: unknown;
}

/** Predicted vs actual line — quarterly NII or PD backtesting */
function QuarterlyChart({
  data,
}: {
  data: { periods: string[]; actual: number[]; predicted: number[] };
}) {
  const series = data.periods.map((p, i) => ({
    period: p,
    actual: data.actual[i],
    predicted: data.predicted[i],
  }));
  return (
    <VizCard title="Predicted vs Actual" eyebrow="Backtesting">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={series} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis
            dataKey="period"
            tick={CHART_AXIS_STYLE.tick}
            axisLine={CHART_AXIS_STYLE.axisLine}
            tickLine={false}
          />
          <YAxis tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} />
          <Legend
            formatter={(v) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{v}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={CHART_COLORS.teal}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.teal }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={CHART_COLORS.amber}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: CHART_COLORS.amber }}
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </VizCard>
  );
}

/** Tornado — sensitivity bar chart (horizontal) */
function TornadoChart({
  data,
}: {
  data: { variables: string[]; effects: number[]; shares: number[] };
}) {
  const series = data.variables
    .map((v, i) => ({
      variable: v.length > 20 ? v.slice(0, 18) + '…' : v,
      effect: data.effects[i],
      share: Math.round(data.shares[i] * 100),
    }))
    .sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  return (
    <VizCard title="Sensitivity Tornado" eyebrow="Variance Share Decomposition">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={series}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
        >
          <XAxis type="number" tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="variable"
            tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#fff' }}
            formatter={(v: number) => [`$${v}M`, 'NII effect']}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
          <Bar dataKey="effect" radius={[0, 3, 3, 0]}>
            {series.map((entry) => (
              <Cell
                key={entry.variable}
                fill={entry.effect < 0 ? CHART_COLORS.coral : CHART_COLORS.teal}
              />
            ))}
            <LabelList
              dataKey="share"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fill: CHART_COLORS.white, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </VizCard>
  );
}

/** Scenario bars — stress test (NII % change vs policy cap) */
function ScenarioChart({
  data,
}: {
  data: { scenarios: string[]; values: number[]; baseline: number; cap: number };
}) {
  const series = data.scenarios.map((s, i) => ({ scenario: s, value: data.values[i] }));
  return (
    <VizCard title="Stress Scenarios" eyebrow="NII Change vs Policy Limit">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={series} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis
            dataKey="scenario"
            tick={CHART_AXIS_STYLE.tick}
            axisLine={CHART_AXIS_STYLE.axisLine}
            tickLine={false}
          />
          <YAxis tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#fff' }}
            formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}%`, 'NII change']}
          />
          <ReferenceLine
            y={data.cap}
            stroke={CHART_COLORS.coral}
            strokeDasharray="4 2"
            label={{ value: 'Policy limit', fill: CHART_COLORS.coral, fontSize: 11 }}
          />
          <ReferenceLine y={data.baseline} stroke="rgba(255,255,255,0.4)" />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {series.map((entry) => (
              <Cell
                key={entry.scenario}
                fill={
                  entry.value <= data.cap && entry.value >= -18
                    ? CHART_COLORS.teal
                    : entry.value <= -18
                      ? CHART_COLORS.amber
                      : CHART_COLORS.coral
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </VizCard>
  );
}

/** PSI/CSI bar — baseline vs current distribution per bin */
function PSIBarChart({
  data,
  title = 'Score Distribution',
}: {
  data: { baseline: number[]; current: number[]; labels: string[] };
  title?: string;
}) {
  const series = data.labels.map((l, i) => ({
    bin: l.length > 12 ? l.slice(0, 10) + '…' : l,
    baseline: Math.round(data.baseline[i] * 1000) / 10,
    current: Math.round(data.current[i] * 1000) / 10,
  }));
  return (
    <VizCard title={title} eyebrow="Baseline vs Current Distribution">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis
            dataKey="bin"
            tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 9 }}
            axisLine={CHART_AXIS_STYLE.axisLine}
            tickLine={false}
          />
          <YAxis tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#fff' }}
            formatter={(v: number) => [`${v}%`, '']}
          />
          <Legend
            formatter={(v) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{v}</span>
            )}
          />
          <Bar dataKey="baseline" fill={CHART_COLORS.cyan} name="Baseline" radius={[2, 2, 0, 0]} />
          <Bar dataKey="current" fill={CHART_COLORS.amber} name="Current" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </VizCard>
  );
}

/** Benchmark — peers bar with subject highlighted + median line */
function BenchmarkChart({
  data,
}: {
  data: {
    peers: { name: string; value: number; isSubject?: boolean }[];
    subject: number;
    peerMedian: number;
    pctRank: number;
  };
}) {
  const sorted = [...data.peers].sort((a, b) => a.value - b.value);
  return (
    <VizCard
      title="Peer Benchmarking"
      eyebrow={`Subject at ${Math.round(data.pctRank * 100)}th percentile`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
        >
          <XAxis type="number" tick={CHART_AXIS_STYLE.tick} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#fff' }}
            formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, '']}
          />
          <ReferenceLine
            x={data.peerMedian}
            stroke={CHART_COLORS.amber}
            strokeDasharray="4 2"
            label={{ value: 'Median', fill: CHART_COLORS.amber, fontSize: 11, position: 'top' }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {sorted.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.isSubject ? CHART_COLORS.amber : 'rgba(255,255,255,0.25)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </VizCard>
  );
}

export function ResultChart({ chartType, chartData }: ResultChartProps) {
  if (!chartData) return null;
  const d = chartData as Record<string, unknown>;

  switch (chartType) {
    case 'quarterly':
      return <QuarterlyChart data={d as Parameters<typeof QuarterlyChart>[0]['data']} />;
    case 'backtest-pd':
      return null; // large scatter datasets omitted for now; metrics table carries the story
    case 'tornado':
      return <TornadoChart data={d as Parameters<typeof TornadoChart>[0]['data']} />;
    case 'scenario':
      return <ScenarioChart data={d as Parameters<typeof ScenarioChart>[0]['data']} />;
    case 'psi-bar':
      return (
        <PSIBarChart
          data={d as Parameters<typeof PSIBarChart>[0]['data']}
          title="PSI Distribution"
        />
      );
    case 'csi-bar':
      return (
        <PSIBarChart
          data={d as Parameters<typeof PSIBarChart>[0]['data']}
          title="CSI Distribution"
        />
      );
    case 'benchmark':
      return <BenchmarkChart data={d as Parameters<typeof BenchmarkChart>[0]['data']} />;
    default:
      return null;
  }
}
