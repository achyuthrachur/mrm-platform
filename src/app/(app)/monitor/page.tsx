import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function MonitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Monitoring</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Performance Monitor</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Monitoring calendar, test-history dots, macro-environment panel —{' '}
          <strong className="text-ink">built in Phase 6</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
