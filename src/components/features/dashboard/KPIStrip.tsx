'use client';

import { StatTile } from '@/components/ui/StatTile';
import type { Model, Finding } from '@/types';
import { getDueDateStatus } from '@/lib/clock';

interface KPIStripProps {
  models: Model[];
  findings: Finding[];
}

export function KPIStrip({ models, findings }: KPIStripProps) {
  const totalModels = models.length;
  const tier1Count = models.filter((m) => m.tier === 1).length;
  const openFindings = findings.filter((f) => f.status !== 'Closed').length;
  const criticalFindings = findings.filter(
    (f) => f.sev === 'Critical' && f.status !== 'Closed'
  ).length;

  const overdueValidations = models.filter(
    (m) => m.nextVal && getDueDateStatus(m.nextVal) === 'Overdue'
  ).length;

  const dueValidations = models.filter(
    (m) => m.nextVal && getDueDateStatus(m.nextVal) === 'Due'
  ).length;

  const highRiskModels = models.filter((m) => m.risk === 'High').length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <StatTile
        label="Models in Scope"
        value={totalModels}
        sub={`${tier1Count} Tier 1`}
        accent={false}
      />
      <StatTile
        label="Open Findings"
        value={openFindings}
        sub={criticalFindings > 0 ? `${criticalFindings} critical` : 'none critical'}
        trend={openFindings > 0 ? 'down' : 'flat'}
        accent={openFindings > 0}
      />
      <StatTile
        label="Overdue Validations"
        value={overdueValidations}
        sub={dueValidations > 0 ? `${dueValidations} due soon` : undefined}
        accent={overdueValidations > 0}
      />
      <StatTile label="Tier 1 Models" value={tier1Count} sub="highest risk tier" />
      <StatTile label="High Risk Models" value={highRiskModels} sub={`of ${totalModels} total`} />
      <StatTile
        label="Findings Rate"
        value={`${totalModels > 0 ? Math.round((openFindings / totalModels) * 10) / 10 : 0}×`}
        sub="open per model"
      />
    </div>
  );
}
