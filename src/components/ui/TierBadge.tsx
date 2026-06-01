import { cn } from '@/lib/utils';
import type { Tier } from '@/types';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

const TIER_CONFIG: Record<Tier, { label: string; bg: string; text: string }> = {
  1: { label: 'Tier 1', bg: 'rgba(229,55,107,0.1)', text: '#E5376B' },
  2: { label: 'Tier 2', bg: 'rgba(215,118,29,0.1)', text: '#D7761D' },
  3: { label: 'Tier 3', bg: 'rgba(0,117,201,0.1)', text: '#0075C9' },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-caption font-semibold',
        className
      )}
      style={{ backgroundColor: config.bg, color: config.text }}
      aria-label={config.label}
    >
      {config.label}
    </span>
  );
}
