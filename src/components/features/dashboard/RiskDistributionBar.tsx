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
import type { Model } from '@/types';

interface RiskDistributionBarProps {
  models: Model[];
}

const RISK_COLORS = {
  High: CHART_COLORS.coral,
  Medium: CHART_COLORS.amber,
  Low: CHART_COLORS.teal,
};

export function RiskDistributionBar({ models }: RiskDistributionBarProps) {
  const data = [
    { risk: 'High', count: models.filter((m) => m.risk === 'High').length },
    { risk: 'Medium', count: models.filter((m) => m.risk === 'Medium').length },
    { risk: 'Low', count: models.filter((m) => m.risk === 'Low').length },
  ];

  return (
    <VizCard title="Risk Distribution" eyebrow="Portfolio">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="risk"
            tick={CHART_AXIS_STYLE.tick}
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
            formatter={(value: number) => [value, 'models']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.risk} fill={RISK_COLORS[entry.risk as keyof typeof RISK_COLORS]} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fill: CHART_COLORS.white, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </VizCard>
  );
}
