import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import '@/styles/globals.css';

// Helvetica Now fallback: Plus Jakarta Sans Variable (Phase 0 — font substitution)
// Loaded via @fontsource-variable (npm-local, no external fetch — corporate-proxy safe)

export const metadata: Metadata = {
  title: 'MRM Platform | Crowe',
  description:
    'Model Risk Management monitoring platform — SR 11-7 / SR 26-2 continuous validation testing and oversight.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Skip to main content — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-[var(--accent-text)]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
