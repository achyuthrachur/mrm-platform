import { cn } from '@/lib/utils';

interface VizCardProps {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Indigo data-viz panel (Addendum §3.2).
 * Dark anchor within the light layout — charts live inside here.
 */
export function VizCard({
  title,
  eyebrow,
  actions,
  children,
  className,
  noPadding = false,
}: VizCardProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-card', className)}
      style={{
        backgroundColor: 'var(--surface-viz)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {(title || eyebrow || actions) && (
        <div className="flex items-start justify-between px-6 pt-5">
          <div className="flex flex-col gap-0.5">
            {eyebrow && (
              <span className="text-caption font-semibold uppercase tracking-wider text-white/50">
                {eyebrow}
              </span>
            )}
            {title && <h2 className="text-h3 font-semibold text-white">{title}</h2>}
          </div>
          {actions && <div className="mt-0.5 flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-6', (title || eyebrow) && !noPadding && 'pt-4')}>
        {children}
      </div>
    </div>
  );
}
