import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Loading skeleton — shaped like the content it replaces. Never use spinners. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-[var(--border-hairline)]', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-4/5' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-card bg-surface p-5 shadow-elev-1', className)} aria-hidden="true">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr
          key={r}
          className="border-t"
          style={{ borderColor: 'var(--border-hairline)' }}
          aria-hidden="true"
        >
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton
                className={cn(
                  'h-3.5',
                  c === 0 ? 'w-24' : c === cols - 1 ? 'w-16' : 'w-full max-w-[120px]'
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
