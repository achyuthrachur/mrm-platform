import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Geist-style empty state: small icon + one sentence + single primary action. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-8 py-16 text-center', className)}
    >
      {Icon ? (
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-control"
          style={{ backgroundColor: 'var(--border-hairline)' }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-ink-muted" />
        </div>
      ) : null}
      <p className="text-body font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-body-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
