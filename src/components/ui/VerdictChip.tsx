import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/types';

interface VerdictChipProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VERDICT_CONFIG: Record<
  Verdict,
  { icon: React.ElementType; label: string; colorVar: string; bgVar: string }
> = {
  pass: {
    icon: CheckCircle2,
    label: 'Pass',
    colorVar: 'var(--status-pass)',
    bgVar: 'var(--status-pass-bg)',
  },
  warn: {
    icon: AlertTriangle,
    label: 'Warn',
    colorVar: 'var(--status-warn)',
    bgVar: 'var(--status-warn-bg)',
  },
  fail: {
    icon: XCircle,
    label: 'Fail',
    colorVar: 'var(--status-fail)',
    bgVar: 'var(--status-fail-bg)',
  },
};

export function VerdictChip({ verdict, size = 'md', className }: VerdictChipProps) {
  const config = VERDICT_CONFIG[verdict];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-caption px-2 py-0.5 gap-1',
    md: 'text-small px-2.5 py-1 gap-1.5',
    lg: 'text-body px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip font-semibold',
        sizeClasses[size],
        className
      )}
      style={{ color: config.colorVar, backgroundColor: config.bgVar }}
      role="status"
      aria-label={`Verdict: ${config.label}`}
    >
      <Icon className={cn('shrink-0', iconSizes[size])} aria-hidden="true" />
      {config.label}
    </span>
  );
}
