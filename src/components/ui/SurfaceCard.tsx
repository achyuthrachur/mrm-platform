import { cn } from '@/lib/utils';

interface SurfaceCardProps {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
}

export function SurfaceCard({
  title,
  eyebrow,
  actions,
  children,
  className,
  noPadding = false,
  hoverable = false,
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-surface shadow-elev-1',
        hoverable && 'transition-shadow hover:shadow-elev-2',
        className
      )}
    >
      {title || eyebrow || actions ? (
        <div className="flex items-start justify-between px-6 pb-0 pt-5">
          <div className="flex flex-col gap-0.5">
            {eyebrow ? (
              <span className="text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                {eyebrow}
              </span>
            ) : null}
            {title ? <h2 className="text-h3 font-semibold text-ink">{title}</h2> : null}
          </div>
          {actions ? <div className="mt-0.5 flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn(!noPadding && 'p-6', (title || eyebrow) && !noPadding && 'pt-4')}>
        {children}
      </div>
    </div>
  );
}
