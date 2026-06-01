import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Models</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Model Inventory</h1>
      </div>
      <SurfaceCard>
        <p className="text-ink-secondary">
          Filterable model table, model detail, and role-scoped views —{' '}
          <strong className="text-ink">built in Phase 2</strong>.
        </p>
      </SurfaceCard>
    </div>
  );
}
