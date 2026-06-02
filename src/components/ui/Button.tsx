import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-text)] font-semibold hover:bg-[#E09900] active:bg-[#C88800] focus-visible:outline-[var(--accent)]',
  secondary:
    'bg-surface text-ink border border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--canvas)] focus-visible:outline-[var(--focus-ring)]',
  tertiary:
    'bg-transparent text-ink underline-offset-2 hover:underline focus-visible:outline-[var(--focus-ring)]',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-[var(--canvas)] hover:text-ink focus-visible:outline-[var(--focus-ring)]',
  danger:
    'bg-[var(--status-fail-bg)] text-[var(--status-fail)] border border-[var(--status-fail-bg)] hover:bg-[var(--status-fail)] hover:text-white focus-visible:outline-[var(--status-fail)]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8  px-3   text-body-sm rounded-control',
  md: 'h-9  px-4   text-body    rounded-control',
  lg: 'h-11 px-6   text-body    rounded-control',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
