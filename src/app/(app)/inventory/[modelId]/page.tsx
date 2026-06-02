'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FlaskConical, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { useModels } from '@/lib/store/models-context';
import { useFindings } from '@/lib/store/findings-context';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TierBadge } from '@/components/ui/TierBadge';
import { Button } from '@/components/ui/Button';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';

interface ModelDetailPageProps {
  params: Promise<{ modelId: string }>;
}

export default function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { modelId } = use(params);
  const { getModel, loading } = useModels();
  const { findings } = useFindings();
  const router = useRouter();

  const model = getModel(modelId);
  const modelFindings = findings.filter((f) => f.modelId === modelId && f.status !== 'Closed');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
        <div className="h-48 animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-small text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to inventory
        </Link>
        <SurfaceCard>
          <p className="text-ink-secondary">Model not found: {modelId}</p>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back nav */}
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1.5 rounded text-small text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Model Inventory
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <TierBadge tier={model.tier} />
            <span
              className="text-caption font-medium"
              style={{
                color:
                  model.risk === 'High'
                    ? 'var(--status-fail)'
                    : model.risk === 'Medium'
                      ? 'var(--status-warn)'
                      : 'var(--status-pass)',
              }}
            >
              {model.risk} Risk
            </span>
            {modelFindings.length > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-medium"
                style={{
                  backgroundColor: 'var(--status-fail-bg)',
                  color: 'var(--status-fail)',
                }}
              >
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                {modelFindings.length} open finding{modelFindings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-h1 font-bold text-ink">{model.name}</h1>
          <p className="mt-1 font-mono text-small text-ink-muted">{model.id}</p>
        </div>

        {/* Quick actions */}
        <div className="flex shrink-0 gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/workbench?model=${model.id}`)}
            aria-label="Open in Testing Workbench"
          >
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Run Tests
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/findings?model=${model.id}`)}
            aria-label="View findings for this model"
          >
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Findings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/monitor?model=${model.id}`)}
            aria-label="View monitoring calendar for this model"
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Overview */}
        <SurfaceCard title="Overview" className="md:col-span-2">
          <p className="text-small leading-relaxed text-ink-secondary">{model.desc}</p>
        </SurfaceCard>

        {/* Model metadata */}
        <SurfaceCard title="Model Details">
          <dl className="space-y-3">
            {[
              { label: 'Framework', value: model.framework },
              { label: 'Method', value: model.method },
              { label: 'Validation Status', value: model.valStatus },
              { label: 'Last Validation', value: model.lastVal || '—' },
              { label: 'Next Validation', value: model.nextVal || '—' },
              { label: 'Monitoring Frequency', value: model.monFreq },
              { label: 'Approved By', value: model.approvedBy },
              { label: 'Approval Date', value: model.approvalDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-40 shrink-0 text-small text-ink-muted">{label}</dt>
                <dd className="text-small font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </SurfaceCard>

        {/* Data sources */}
        <SurfaceCard title="Data Sources & Limitations">
          <div className="space-y-4">
            <div>
              <Eyebrow className="mb-2">Data Sources</Eyebrow>
              <ul className="space-y-1">
                {model.sources.map((src) => (
                  <li key={src} className="flex items-start gap-2 text-small text-ink-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {src}
                  </li>
                ))}
              </ul>
            </div>
            {model.limits && (
              <div>
                <Eyebrow className="mb-2">Model Limitations</Eyebrow>
                <p className="text-small text-ink-secondary">{model.limits}</p>
              </div>
            )}
            {model.dataLimits && (
              <div>
                <Eyebrow className="mb-2">Data Limitations</Eyebrow>
                <p className="text-small text-ink-secondary">{model.dataLimits}</p>
              </div>
            )}
          </div>
        </SurfaceCard>

        {/* Monitoring plan */}
        {model.monPlan && (
          <SurfaceCard title="Monitoring Plan" eyebrow="SR 11-7" className="md:col-span-2">
            <p className="text-small leading-relaxed text-ink-secondary">{model.monPlan}</p>
          </SurfaceCard>
        )}

        {/* Selected tests */}
        {model.selectedTests && model.selectedTests.length > 0 && (
          <SurfaceCard title="Scheduled Tests">
            <div className="space-y-2">
              {model.selectedTests.map((t) => (
                <div
                  key={t.testType}
                  className="flex items-center justify-between border-b py-1.5"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <span className="text-small text-ink">{TEST_LABELS[t.testType]}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-caption text-ink-muted">{t.frequency}</span>
                    <span className="font-mono text-caption text-ink-muted">{t.srRef}</span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}

        {/* Open findings for this model */}
        {modelFindings.length > 0 && (
          <SurfaceCard title="Open Findings" className={model.selectedTests ? '' : 'md:col-span-2'}>
            <div className="space-y-2">
              {modelFindings.slice(0, 5).map((f) => (
                <Link
                  key={f.id}
                  href={`/findings/${f.id}`}
                  className="-mx-2 flex items-start gap-3 rounded border-b px-2 py-2 transition-colors last:border-b-0 hover:bg-[var(--canvas)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <span
                    className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-caption font-semibold"
                    style={{
                      backgroundColor:
                        f.sev === 'Critical' || f.sev === 'High'
                          ? 'var(--status-fail-bg)'
                          : 'var(--status-warn-bg)',
                      color:
                        f.sev === 'Critical' || f.sev === 'High'
                          ? 'var(--status-fail)'
                          : 'var(--status-warn)',
                    }}
                  >
                    {f.sev}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-small text-ink">{f.title}</p>
                    <p className="text-caption text-ink-muted">
                      {f.id} · Due {f.dueDate}
                    </p>
                  </div>
                </Link>
              ))}
              {modelFindings.length > 5 && (
                <Link
                  href={`/findings?model=${model.id}`}
                  className="mt-1 inline-flex items-center gap-1 text-small text-ink-muted transition-colors hover:text-ink"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  View all {modelFindings.length} findings
                </Link>
              )}
            </div>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
