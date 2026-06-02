import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/types';

interface VerdictChipProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CFG: Record<Verdict, { icon: React.ElementType; label: string; color: string; bg: string }> =
  {
    pass: {
      icon: CheckCircle2,
      label: 'Pass',
      color: 'var(--status-pass)',
      bg: 'var(--status-pass-bg)',
    },
    warn: {
      icon: AlertTriangle,
      label: 'Warn',
      color: 'var(--status-warn)',
      bg: 'var(--status-warn-bg)',
    },
    fail: {
      icon: XCircle,
      label: 'Fail',
      color: 'var(--status-fail)',
      bg: 'var(--status-fail-bg)',
    },
  };

const SIZE = {
  sm: 'px-2 py-px text-eyebrow gap-1',
  md: 'px-2.5 py-1 text-body-sm gap-1.5',
  lg: 'px-3 py-1.5 text-body gap-2',
};
const ICON = { sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4' };

export function VerdictChip({ verdict, size = 'md', className }: VerdictChipProps) {
  const c = CFG[verdict];
  const Icon = c.icon;
  return (
    <span
      className={cn('inline-flex items-center rounded-chip font-semibold', SIZE[size], className)}
      style={{ color: c.color, backgroundColor: c.bg }}
      role="status"
      aria-label={`Verdict: ${c.label}`}
    >
      <Icon className={cn('shrink-0', ICON[size])} aria-hidden="true" />
      {c.label}
    </span>
  );
}
