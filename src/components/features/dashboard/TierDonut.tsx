'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { VizCard } from '@/components/ui/VizCard';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from '@/components/ui/ChartTheme';
import type { Model } from '@/types';

interface TierDonutProps {
  models: Model[];
}

const TIER_COLORS = {
  'Tier 1': CHART_COLORS.coral,
  'Tier 2': CHART_COLORS.amber,
  'Tier 3': CHART_COLORS.blue,
};

export function TierDonut({ models }: TierDonutProps) {
  const data = [
    { name: 'Tier 1', value: models.filter((m) => m.tier === 1).length },
    { name: 'Tier 2', value: models.filter((m) => m.tier === 2).length },
    { name: 'Tier 3', value: models.filter((m) => m.tier === 3).length },
  ].filter((d) => d.value > 0);

  return (
    <VizCard title="Tier Distribution" eyebrow="Portfolio">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            stroke="none"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={TIER_COLORS[entry.name as keyof typeof TIER_COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [value, 'models']}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </VizCard>
  );
}
