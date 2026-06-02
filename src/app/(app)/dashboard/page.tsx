'use client';

import { useModels } from '@/lib/store/models-context';
import { useFindings } from '@/lib/store/findings-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { HITLBanner } from '@/components/features/dashboard/HITLBanner';
import { KPIStrip } from '@/components/features/dashboard/KPIStrip';
import { TierDonut } from '@/components/features/dashboard/TierDonut';
import { RiskDistributionBar } from '@/components/features/dashboard/RiskDistributionBar';
import { FindingsStatusBar } from '@/components/features/dashboard/FindingsStatusBar';
import { RiskHeatMap } from '@/components/features/dashboard/RiskHeatMap';
import { TestHealthTable } from '@/components/features/dashboard/TestHealthTable';

export default function DashboardPage() {
  const { models, loading: modelsLoading } = useModels();
  const { findings, loading: findingsLoading } = useFindings();
  const { role } = useRole();
  const { canViewAllModels } = usePermissions();

  const scopedModels = canViewAllModels ? models : models.filter((m) => m.owner === 'Sarah Chen');

  if (modelsLoading || findingsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Eyebrow>Overview</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-card bg-surface p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  const scopedFindings = canViewAllModels
    ? findings
    : findings.filter((f) => scopedModels.some((m) => m.id === f.modelId));

  const scopeText =
    role === 'mrm'
      ? 'All models — Heartland Commerce Bank'
      : `${scopedModels.length} of ${models.length} models in your scope`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Overview</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Dashboard</h1>
        </div>
        <span className="mt-1 hidden text-caption text-ink-muted sm:block">{scopeText}</span>
      </div>

      {/* HITL banner */}
      <HITLBanner models={scopedModels} findings={scopedFindings} />

      {/* KPI tiles */}
      <KPIStrip models={scopedModels} findings={scopedFindings} />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TierDonut models={scopedModels} />
        <RiskDistributionBar models={scopedModels} />
        <FindingsStatusBar findings={scopedFindings} />
      </div>

      {/* Heat map + test health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RiskHeatMap models={scopedModels} />
        <TestHealthTable models={scopedModels} />
      </div>
    </div>
  );
}
