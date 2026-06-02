'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { VizCard } from '@/components/ui/VizCard';
import { CHART_COLORS, CHART_AXIS_STYLE, CHART_TOOLTIP_STYLE } from '@/components/ui/ChartTheme';
import type { Finding } from '@/types';

interface FindingsStatusBarProps {
  findings: Finding[];
}

const STATUS_COLORS: Record<string, string> = {
  Open: CHART_COLORS.coral,
  'In Remediation': CHART_COLORS.amber,
  Closed: CHART_COLORS.teal,
};

const SEV_COLORS: Record<string, string> = {
  Critical: CHART_COLORS.coral,
  High: CHART_COLORS.coralBright,
  Medium: CHART_COLORS.amber,
  Low: CHART_COLORS.teal,
};

export function FindingsStatusBar({ findings }: FindingsStatusBarProps) {
  const statusData = [
    { label: 'Open', count: findings.filter((f) => f.status === 'Open').length },
    {
      label: 'In Remediation',
      count: findings.filter((f) => f.status === 'In Remediation').length,
    },
    { label: 'Closed', count: findings.filter((f) => f.status === 'Closed').length },
  ];

  const sevData = [
    {
      label: 'Critical',
      count: findings.filter((f) => f.sev === 'Critical' && f.status !== 'Closed').length,
    },
    {
      label: 'High',
      count: findings.filter((f) => f.sev === 'High' && f.status !== 'Closed').length,
    },
    {
      label: 'Medium',
      count: findings.filter((f) => f.sev === 'Medium' && f.status !== 'Closed').length,
    },
    {
      label: 'Low',
      count: findings.filter((f) => f.sev === 'Low' && f.status !== 'Closed').length,
    },
  ];

  return (
    <VizCard title="Findings Overview" eyebrow="Open · by status and severity">
      <div className="grid grid-cols-2 gap-4">
        {/* By status */}
        <div>
          <p className="mb-2 text-caption uppercase tracking-wide text-white/50">By Status</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={statusData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 10 }}
                axisLine={CHART_AXIS_STYLE.axisLine}
                tickLine={false}
              />
              <YAxis
                tick={CHART_AXIS_STYLE.tick}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(value: number) => [value, 'findings']}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={STATUS_COLORS[entry.label] ?? CHART_COLORS.whiteMuted}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fill: CHART_COLORS.white, fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By severity (open only) */}
        <div>
          <p className="mb-2 text-caption uppercase tracking-wide text-white/50">
            By Severity (Open)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sevData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ ...CHART_AXIS_STYLE.tick, fontSize: 10 }}
                axisLine={CHART_AXIS_STYLE.axisLine}
                tickLine={false}
              />
              <YAxis
                tick={CHART_AXIS_STYLE.tick}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(value: number) => [value, 'findings']}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {sevData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={SEV_COLORS[entry.label] ?? CHART_COLORS.whiteMuted}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fill: CHART_COLORS.white, fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </VizCard>
  );
}
