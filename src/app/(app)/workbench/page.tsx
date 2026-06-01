import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function WorkbenchPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Validation</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Testing Workbench</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Real compute engines, formula-transparency panels, CSV upload —{' '}
          <strong className="text-ink">built in Phase 3</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
