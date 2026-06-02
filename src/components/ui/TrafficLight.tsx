import { cn } from '@/lib/utils';
import type { TrafficLight as TLType } from '@/types';

interface TrafficLightProps {
  light: TLType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CFG: Record<TLType, { color: string; label: string; aria: string }> = {
  Green: { color: 'var(--status-pass)', label: 'Green', aria: 'Green — acceptable' },
  Yellow: { color: 'var(--status-warn)', label: 'Yellow', aria: 'Yellow — monitor' },
  Red: { color: 'var(--status-fail)', label: 'Red', aria: 'Red — action required' },
};
const DOT = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5' };

export function TrafficLight({
  light,
  showLabel = false,
  size = 'md',
  className,
}: TrafficLightProps) {
  const c = CFG[light];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      role="img"
      aria-label={c.aria}
    >
      <span
        className={cn('shrink-0 rounded-full', DOT[size])}
        style={{ backgroundColor: c.color }}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-body-sm font-medium" style={{ color: c.color }}>
          {c.label}
        </span>
      )}
    </span>
  );
}
