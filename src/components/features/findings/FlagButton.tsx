'use client';

import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { useFindings } from '@/lib/store/findings-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { applyFlag, applyUnflag } from '@/lib/findings/transitions';
import { cn } from '@/lib/utils';

interface FlagButtonProps {
  findingId: string;
  isFlagged: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function FlagButton({ findingId, isFlagged, size = 'md', className }: FlagButtonProps) {
  const { getFinding, updateFinding } = useFindings();
  const { currentUser } = useRole();

  async function handleToggle() {
    const finding = getFinding(findingId);
    if (!finding) return;

    const updated = isFlagged ? applyUnflag(finding, currentUser) : applyFlag(finding, currentUser);

    await updateFinding(updated);
    toast.success(isFlagged ? 'Review flag cleared' : 'Flagged for MRM review');
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]',
        size === 'sm' ? 'px-2 py-1 text-caption' : 'px-3 py-1.5 text-small',
        isFlagged
          ? 'border-[var(--status-warn)] bg-[var(--status-warn-bg)] text-[var(--status-warn)]'
          : 'border-[var(--border-hairline)] bg-surface text-ink-secondary hover:border-[var(--status-warn)] hover:text-[var(--status-warn)]',
        className
      )}
      aria-label={isFlagged ? 'Clear review flag' : 'Flag for MRM review'}
      aria-pressed={isFlagged}
    >
      <Flag
        className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'}
        aria-hidden="true"
        fill={isFlagged ? 'currentColor' : 'none'}
      />
      {isFlagged ? 'Flagged' : 'Flag for Review'}
    </button>
  );
}
