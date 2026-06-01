import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/types';

type StatusVariant = Verdict | 'info';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<
  StatusVariant,
  { icon: React.ElementType; colorVar: string; bgVar: string; defaultLabel: string }
> = {
  pass: {
    icon: CheckCircle2,
    colorVar: 'var(--status-pass)',
    bgVar: 'var(--status-pass-bg)',
    defaultLabel: 'Pass',
  },
  warn: {
    icon: AlertTriangle,
    colorVar: 'var(--status-warn)',
    bgVar: 'var(--status-warn-bg)',
    defaultLabel: 'Warn',
  },
  fail: {
    icon: XCircle,
    colorVar: 'var(--status-fail)',
    bgVar: 'var(--status-fail-bg)',
    defaultLabel: 'Fail',
  },
  info: {
    icon: Info,
    colorVar: 'var(--status-info)',
    bgVar: 'var(--status-info-bg)',
    defaultLabel: 'Info',
  },
};

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-chip font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-small',
        className
      )}
      style={{
        color: config.colorVar,
        backgroundColor: config.bgVar,
      }}
      role="status"
      aria-label={displayLabel}
    >
      <Icon
        className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  );
}
