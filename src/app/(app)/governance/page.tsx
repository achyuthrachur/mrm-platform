import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Oversight</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Governance</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Approval pipeline, MRM committee, policy exception log —{' '}
          <strong className="text-ink">built in Phase 6</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
