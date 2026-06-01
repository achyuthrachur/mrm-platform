export function AppFooter() {
  return (
    <footer
      className="flex items-center justify-between border-t px-6 py-2 text-caption text-ink-muted"
      style={{ borderColor: 'var(--border-hairline)' }}
      role="contentinfo"
    >
      <span>Demo environment — not for distribution</span>
      <span>© {new Date().getFullYear()} Crowe LLP</span>
    </footer>
  );
}
