import { cn } from '@/lib/utils';

interface VizCardProps {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  id?: string;
}

/** Indigo data-viz panel — deliberate dark punctuation within the light layout. */
export function VizCard({
  title,
  eyebrow,
  actions,
  children,
  className,
  noPadding = false,
  id,
}: VizCardProps) {
  return (
    <div
      id={id}
      className={cn('overflow-hidden rounded-viz bg-surface-viz shadow-elev-1', className)}
    >
      {title || eyebrow || actions ? (
        <div className="flex items-start justify-between px-6 pt-5">
          <div className="flex flex-col gap-0.5">
            {eyebrow ? (
              <span className="text-eyebrow uppercase tracking-[0.06em] text-white/40">
                {eyebrow}
              </span>
            ) : null}
            {title ? <h2 className="text-h3 font-semibold text-white">{title}</h2> : null}
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
