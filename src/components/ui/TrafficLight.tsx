import { cn } from '@/lib/utils';
import type { TrafficLight as TrafficLightType } from '@/types';

interface TrafficLightProps {
  light: TrafficLightType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LIGHT_CONFIG: Record<
  TrafficLightType,
  { colorVar: string; label: string; ariaLabel: string }
> = {
  Green: {
    colorVar: 'var(--status-pass)',
    label: 'Green',
    ariaLabel: 'Green — acceptable performance',
  },
  Yellow: {
    colorVar: 'var(--status-warn)',
    label: 'Yellow',
    ariaLabel: 'Yellow — monitor closely',
  },
  Red: {
    colorVar: 'var(--status-fail)',
    label: 'Red',
    ariaLabel: 'Red — action required',
  },
};

const SIZE_MAP = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function TrafficLight({
  light,
  showLabel = false,
  size = 'md',
  className,
}: TrafficLightProps) {
  const config = LIGHT_CONFIG[light];

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      role="img"
      aria-label={config.ariaLabel}
    >
      <span
        className={cn('shrink-0 rounded-full', SIZE_MAP[size])}
        style={{ backgroundColor: config.colorVar }}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-small font-medium" style={{ color: config.colorVar }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
