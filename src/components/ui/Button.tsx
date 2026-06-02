import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[#e69e00] active:bg-[#cc8d00] font-semibold',
  secondary:
    'bg-surface text-ink border border-[var(--border-hairline)] hover:border-[var(--ink)] hover:bg-[var(--canvas)]',
  ghost: 'bg-transparent text-ink hover:bg-[var(--canvas)]',
  danger:
    'bg-[var(--status-fail-bg)] text-[var(--status-fail)] hover:bg-[var(--status-fail)] hover:text-white border border-[var(--status-fail-bg)]',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption rounded',
  md: 'px-4 py-2 text-small rounded-md',
  lg: 'px-6 py-2.5 text-body rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
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
    );
  }
);

Button.displayName = 'Button';
