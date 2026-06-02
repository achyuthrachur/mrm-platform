'use client';

import dynamic from 'next/dynamic';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

// Lazy-load the SVG graph — heavy at first paint
const DependencyGraph = dynamic(
  () =>
    import('@/components/features/dependencies/DependencyGraph').then((m) => ({
      default: m.DependencyGraph,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 w-full animate-pulse rounded-card"
        style={{ backgroundColor: 'var(--surface)' }}
        aria-label="Loading dependency graph"
      />
    ),
  }
);

export default function DependenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Eyebrow>Network</Eyebrow>
          <span
            className="rounded px-1.5 py-0.5 text-caption font-semibold uppercase tracking-wide"
            style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
          >
            BETA
          </span>
        </div>
        <h1 className="mt-1 text-h1 font-bold text-ink">Dependencies</h1>
      </div>

      <SurfaceCard noPadding>
        <div className="px-5 pb-2 pt-4">
          <p className="text-small text-ink-secondary">
            Model dependency network — <span style={{ color: '#E5376B' }}>■</span> Tier 1 ·{' '}
            <span style={{ color: '#F5A800' }}>■</span> Tier 2 ·{' '}
            <span style={{ color: '#0075C9' }}>■</span> Tier 3. Click a node to trace upstream
            inputs and downstream impacts. Dashed rings indicate open critical findings.
          </p>
        </div>
        <div className="px-5 pb-5">
          <DependencyGraph />
        </div>
      </SurfaceCard>
    </div>
  );
}
