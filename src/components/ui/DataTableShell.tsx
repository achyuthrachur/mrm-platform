import { cn } from '@/lib/utils';

interface DataTableShellProps {
  children: React.ReactNode;
  className?: string;
  caption?: string;
}

export function DataTableShell({ children, className, caption }: DataTableShellProps) {
  return (
    <div
      className={cn('overflow-auto rounded-card', className)}
      style={{ boxShadow: 'var(--elev-1)' }}
    >
      <table
        className="w-full border-collapse bg-surface text-body"
        style={{ minWidth: '100%' }}
        aria-label={caption}
      >
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead
      className="sticky top-0 z-10 bg-surface"
      style={{ borderBottom: '1px solid var(--border-hairline)' }}
    >
      {children}
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
  numeric = false,
  className,
}: {
  children: React.ReactNode;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-muted',
        numeric && 'text-right tabular-nums',
        className
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-t transition-colors',
        onClick && 'cursor-pointer hover:bg-neutral-50',
        className
      )}
      style={{ borderColor: 'var(--border-hairline)' }}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  numeric = false,
  className,
}: {
  children: React.ReactNode;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-body text-ink-body',
        numeric && 'text-right font-medium tabular-nums',
        className
      )}
    >
      {children}
    </td>
  );
}
