'use client';

import { useState, useRef } from 'react';
import { Play, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { VerdictChip } from '@/components/ui/VerdictChip';
import { TrafficLight } from '@/components/ui/TrafficLight';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { FormulaPanel } from './FormulaPanel';
import { usePermissions } from '@/hooks/usePermissions';
import { useRole } from '@/components/features/shell/RoleProvider';
import { useRunStore } from '@/lib/store/run-store';
import { getEngine } from '@/lib/engines';
import { ILLUSTRATIVE_RESULTS } from '@/lib/data/illustrative-results';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';
import type { Model, TestType, TestResult } from '@/types';

interface TestRunnerProps {
  model: Model;
  testType: TestType;
}

function ResultView({ result }: { result: TestResult }) {
  return (
    <div className="space-y-4">
      {/* Verdict header */}
      <div
        className="flex items-center gap-4 rounded-card border p-4"
        style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--canvas)' }}
      >
        <VerdictChip verdict={result.verdict} size="lg" />
        <TrafficLight light={result.trafficLight} showLabel />
        <div className="ml-2 flex items-center gap-2">
          <StatusBadge status="info" label={result.dataConf} size="sm" />
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
              Illustrative — not computed from live data
            </span>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-caption text-ink-muted">Period</p>
          <p className="text-small font-medium text-ink">{result.period}</p>
        </div>
        <div className="text-right">
          <p className="text-caption text-ink-muted">Run Date</p>
          <p className="text-small font-medium text-ink">{result.runDate}</p>
        </div>
      </div>

      {/* Metrics table */}
      <SurfaceCard title="Metrics">
        <div className="space-y-0">
          {result.metrics.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 py-2.5 ${i > 0 ? 'border-t' : ''}`}
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="mt-0.5 w-6 shrink-0">
                <StatusBadge status={m.status === 'info' ? 'info' : m.status} size="sm" label="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-medium text-ink">{m.label}</p>
                {m.note && <p className="mt-0.5 text-caption text-ink-muted">{m.note}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-small font-semibold tabular-nums text-ink">{m.value}</p>
                {m.threshold && m.threshold !== '—' && (
                  <p className="mt-0.5 text-caption text-ink-muted">{m.threshold}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* Formula panel (only for computed) */}
      {result.computed && result.formula && <FormulaPanel formula={result.formula} />}

      {/* Findings and recommendation */}
      {result.findings.length > 0 && (
        <SurfaceCard title="Findings">
          <ul className="space-y-2">
            {result.findings.map((f, i) => (
              <li key={i} className="flex gap-2 text-small text-ink-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--status-fail)]" />
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

      {/* Data notes */}
      {(result.dataGaps?.length ?? 0) > 0 && (
        <SurfaceCard title="Data Gaps & Quality">
          {result.dataNote && (
            <p className="mb-2 text-small text-ink-secondary">{result.dataNote}</p>
          )}
          <ul className="space-y-1">
            {result.dataGaps?.map((g, i) => (
              <li key={i} className="flex gap-2 text-small text-ink-muted">
                <span className="text-[var(--status-warn)]">△</span>
                {g}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}
    </div>
  );
}

export function TestRunner({ model, testType }: TestRunnerProps) {
  const { canRunTests } = usePermissions();
  const { currentUser } = useRole();
  const { runTest, isRunning } = useRunStore();
  const [result, setResult] = useState<TestResult | null>(null);
  const [useUpload, setUseUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasEngine = getEngine(model.id, testType) !== null;

  async function handleRun() {
    if (!canRunTests) return;

    try {
      let testResult: TestResult;

      if (hasEngine) {
        const engine = getEngine(model.id, testType)!;
        testResult = engine({ modelId: model.id });
      } else {
        // Return illustrative result
        const illustrative = ILLUSTRATIVE_RESULTS.find(
          (r) => r.modelId === model.id && r.testType === testType
        );
        if (!illustrative) {
          toast.error('No result available for this test');
          return;
        }
        testResult = { ...illustrative };
      }

      await runTest({ modelId: model.id, testType, result: testResult, runBy: currentUser });
      setResult(testResult);
      toast.success(`${TEST_LABELS[testType]} completed — ${testResult.verdict.toUpperCase()}`);
    } catch (err) {
      toast.error('Engine error — see console for details');
      console.error(err);
    }
  }

  const canUploadCSV = ['source-to-model', 'psi', 'csi'].includes(testType);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {canUploadCSV && (
          <button
            onClick={() => setUseUpload((v) => !v)}
            className={`rounded-md border px-3 py-1.5 text-small transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              useUpload
                ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                : 'border-[var(--border-hairline)] bg-surface text-ink'
            }`}
          >
            {useUpload ? 'Using uploaded CSV' : 'Generated demo dataset'}
          </button>
        )}
        {!canUploadCSV && (
          <span className="text-small text-ink-muted">Data source: Generated demo dataset</span>
        )}

        {useUpload && (
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              aria-label="Upload CSV file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.success(`CSV loaded: ${file.name}`);
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Upload CSV
            </Button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!canRunTests && (
            <span
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-small text-ink-muted"
              style={{ backgroundColor: 'var(--canvas)' }}
              aria-label="Run tests requires Model Owner role"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              MRM Officers cannot run owner tests
            </span>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleRun}
            disabled={!canRunTests || isRunning}
            loading={isRunning}
            aria-label={`Run ${TEST_LABELS[testType]}`}
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Run {TEST_LABELS[testType]}
          </Button>
        </div>
      </div>

      {/* Engine status indicator */}
      <div className="flex items-center gap-2">
        {hasEngine ? (
          <span
            className="rounded px-2 py-0.5 text-caption font-medium"
            style={{ backgroundColor: 'var(--status-pass-bg)', color: 'var(--status-pass)' }}
          >
            ✓ Computed engine available
          </span>
        ) : (
          <span
            className="rounded px-2 py-0.5 text-caption font-medium"
            style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
          >
            △ Illustrative result only — no compute engine for this (model, test) pair
          </span>
        )}
      </div>

      {/* Results */}
      {result && <ResultView result={result} />}
    </div>
  );
}
