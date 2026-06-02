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

const CFG: Record<
  StatusVariant,
  { icon: React.ElementType; color: string; bg: string; def: string }
> = {
  pass: {
    icon: CheckCircle2,
    color: 'var(--status-pass)',
    bg: 'var(--status-pass-bg)',
    def: 'Pass',
  },
  warn: {
    icon: AlertTriangle,
    color: 'var(--status-warn)',
    bg: 'var(--status-warn-bg)',
    def: 'Warn',
  },
  fail: { icon: XCircle, color: 'var(--status-fail)', bg: 'var(--status-fail-bg)', def: 'Fail' },
  info: { icon: Info, color: 'var(--status-info)', bg: 'var(--status-info-bg)', def: 'Info' },
};

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const c = CFG[status];
  const Icon = c.icon;
  const lbl = label ?? c.def;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-chip font-medium',
        size === 'sm' ? 'px-1.5 py-px text-eyebrow' : 'px-2.5 py-1 text-body-sm',
        className
      )}
      style={{ color: c.color, backgroundColor: c.bg }}
      role="status"
      aria-label={lbl}
    >
      <Icon
        className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      {lbl}
    </span>
  );
}
