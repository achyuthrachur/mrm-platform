import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  onViz?: boolean;
}

/** Sparing uppercase section label — use sparingly, eyebrows only. */
export function Eyebrow({ children, className, onViz = false }: EyebrowProps) {
  return (
    <span
      className={cn(
        'block text-eyebrow font-semibold uppercase tracking-[0.06em]',
        onViz ? 'text-white/40' : 'text-ink-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
