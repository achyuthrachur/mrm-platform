import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function DependenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Eyebrow>Network</Eyebrow>
          <span
            className="rounded px-1.5 py-0.5 text-caption font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'var(--status-info-bg)',
              color: 'var(--status-info)',
            }}
          >
            BETA
          </span>
        </div>
        <h1 className="mt-1 text-h1 font-bold text-ink">Dependencies</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Model dependency graph — upstream inputs, downstream impacts, risk propagation —{' '}
          <strong className="text-ink">built in Phase 7</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
