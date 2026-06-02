'use client';

import { ResetDemoButton } from './ResetDemoButton';

export function AppFooter() {
  return (
    <footer
      className="flex items-center justify-between border-t px-6 py-2 text-caption text-ink-muted"
      style={{ borderColor: 'var(--border-hairline)' }}
      role="contentinfo"
    >
      <span>Demo environment — not for distribution</span>
      <div className="flex items-center gap-4">
        <ResetDemoButton />
        <span>© {new Date().getFullYear()} Crowe LLP</span>
      </div>
    </footer>
  );
}
