import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  onViz?: boolean;
}

/**
 * Sparing uppercase section label (Addendum §3.3).
 * Use only for section headings, not for every label.
 */
export function Eyebrow({ children, className, onViz = false }: EyebrowProps) {
  return (
    <span
      className={cn(
        'block text-caption font-semibold uppercase tracking-wider',
        onViz ? 'text-white/50' : 'text-ink-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
