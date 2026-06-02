import { cn } from '@/lib/utils';
import type { Tier } from '@/types';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

const CFG: Record<Tier, { label: string; bg: string; text: string }> = {
  1: { label: 'Tier 1', bg: 'rgba(215,38,61,0.09)', text: 'var(--status-fail)' },
  2: { label: 'Tier 2', bg: 'rgba(199,119,0,0.09)', text: 'var(--status-warn)' },
  3: { label: 'Tier 3', bg: 'rgba(0,117,201,0.09)', text: 'var(--status-info)' },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const c = CFG[tier];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2 py-px text-body-sm font-semibold',
        className
      )}
      style={{ backgroundColor: c.bg, color: c.text }}
      aria-label={c.label}
    >
      {c.label}
    </span>
  );
}
