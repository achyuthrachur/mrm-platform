'use client';

import { VerdictChip } from '@/components/ui/VerdictChip';
import { TrafficLight } from '@/components/ui/TrafficLight';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { FormulaPanel } from '@/components/features/workbench/FormulaPanel';
import { ResultChart } from './ResultChart';
import { STMResultView } from './STMResultView';
import type { TestResult } from '@/types';

interface TestResultViewProps {
  result: TestResult;
  /** When true, show the FormulaPanel (computed results only). Default true. */
  showFormula?: boolean;
  /** When true, show charts. Default true. */
  showCharts?: boolean;
}

export function TestResultView({
  result,
  showFormula = true,
  showCharts = true,
}: TestResultViewProps) {
  return (
    <div className="space-y-4" data-testid="test-result-view">
      <div
        className="flex flex-wrap items-center gap-4 rounded-card border p-4"
        style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--canvas)' }}
      >
        <VerdictChip verdict={result.verdict} size="lg" />
        <TrafficLight light={result.trafficLight} showLabel />
        <div className="ml-1 flex items-center gap-2">
          <StatusBadge status="info" label={`${result.dataConf} confidence`} size="sm" />
          {result.computed ? (
            <span
              className="rounded px-2 py-0.5 text-caption font-medium"
              style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
            >
              Computed
            </span>
          ) : (
            <span
              className="rounded px-2 py-0.5 text-caption font-medium"
              style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
            >
              Illustrative â€” not computed from live data
            </span>
          )}
        </div>
        <div className="ml-auto flex gap-6">
          <div className="text-right">
            <p className="text-caption text-ink-muted">Period</p>
            <p className="text-small font-medium tabular-nums text-ink">{result.period}</p>
          </div>
          <div className="text-right">
            <p className="text-caption text-ink-muted">Run Date</p>
            <p className="text-small font-medium tabular-nums text-ink">{result.runDate}</p>
          </div>
        </div>
      </div>

      {result.testType === 'source-to-model' ? <STMResultView result={result} /> : null}
      <SurfaceCard title="Metrics">
        <div className="space-y-0">
          {result.metrics.map((m, i) => (
            <div key={i} className="flex items-start gap-4 py-3">
              <div className="mt-0.5 shrink-0">
                <StatusBadge status={m.status} label="" size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-medium text-ink">{m.label}</p>
                {m.note && <p className="mt-0.5 text-caption text-ink-muted">{m.note}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-small font-semibold tabular-nums text-ink">{m.value}</p>
                {m.threshold && m.threshold !== 'â€”' && (
                  <p className="mt-0.5 text-caption text-ink-muted">{m.threshold}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
      {showCharts && result.chartType && result.chartData != null ? (
        <ResultChart chartType={result.chartType} chartData={result.chartData} />
      ) : null}
      {showFormula && result.computed && result.formula && (
        <FormulaPanel formula={result.formula} />
      )}
      {result.findings.length > 0 && (
        <SurfaceCard title="Findings">
          <ul className="space-y-2">
            {result.findings.map((f, i) => (
              <li key={i} className="flex gap-2 text-small text-ink-secondary">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--status-fail)' }}
                  aria-hidden="true"
                />
                {f}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}
      {result.recommendation && (
        <SurfaceCard title="Recommendation">
          <p className="text-small text-ink-secondary">{result.recommendation}</p>
        </SurfaceCard>
      )}
      {(result.dataGaps?.length ||
        result.dataNote ||
        result.proxyUsed?.length ||
        result.compensating?.length ||
        result.improvWith?.length) && (
        <SurfaceCard title="Data Confidence" eyebrow={`${result.dataConf} confidence`}>
          {result.dataNote && (
            <p className="mb-3 text-small text-ink-secondary">{result.dataNote}</p>
          )}
          {result.dataGaps?.length && (
            <div className="mb-3">
              <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Data Gaps
              </p>
              <ul className="space-y-1">
                {result.dataGaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-small text-ink-muted">
                    <span style={{ color: 'var(--status-warn)' }} aria-hidden="true">
                      â–³
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.proxyUsed?.length && (
            <div className="mb-3">
              <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Proxies Used
              </p>
              <ul className="space-y-1">
                {result.proxyUsed.map((p, i) => (
                  <li key={i} className="flex gap-2 text-small text-ink-muted">
                    <span aria-hidden="true">â†’</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.compensating?.length && (
            <div className="mb-3">
              <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Compensating Controls
              </p>
              <ul className="space-y-1">
                {result.compensating.map((c, i) => (
                  <li key={i} className="flex gap-2 text-small text-ink-muted">
                    <span style={{ color: 'var(--status-pass)' }} aria-hidden="true">
                      âœ“
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.improvWith?.length && (
            <div>
              <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Would Improve With
              </p>
              <ul className="space-y-1">
                {result.improvWith.map((w, i) => (
                  <li key={i} className="flex gap-2 text-small text-ink-muted">
                    <span aria-hidden="true">+</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SurfaceCard>
      )}
      <div className="mt-1 flex flex-wrap gap-2">
        <span className="text-caption text-ink-muted">Data sources:</span>
        {result.dataSources.map((src) => (
          <span
            key={src}
            className="rounded px-2 py-0.5 text-caption"
            style={{ backgroundColor: 'var(--canvas)', color: 'var(--ink-muted)' }}
          >
            {src}
          </span>
        ))}
      </div>
    </div>
  );
}
