import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Overview</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Dashboard</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Portfolio KPIs, charts, risk heat map, and test-health overview —{' '}
          <strong className="text-ink">built in Phase 2</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
