import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import '@/styles/globals.css';

// Helvetica Now fallback: Plus Jakarta Sans Variable (Phase 0 — font substitution)
// Loaded via @fontsource-variable (npm-local, no external fetch — corporate-proxy safe)
// Recorded in PHASE-0-NOTES.md

export const metadata: Metadata = {
  title: 'MRM Platform | Crowe',
  description:
    'Model Risk Management monitoring platform — SR 11-7 / SR 26-2 continuous validation testing and oversight.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
