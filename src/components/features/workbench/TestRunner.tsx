'use client';

import { useState, useRef } from 'react';
import { Play, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TestResultView } from '@/components/features/results/TestResultView';
import { RunHistory } from '@/components/features/results/RunHistory';
import { ExportButton } from '@/components/features/results/ExportButton';
import { usePermissions } from '@/hooks/usePermissions';
import { useRole } from '@/components/features/shell/RoleProvider';
import { useRunStore } from '@/lib/store/run-store';
import { getEngine } from '@/lib/engines';
import { ILLUSTRATIVE_RESULTS } from '@/lib/data/illustrative-results';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';
import type { Model, TestType, TestResult, TestRun } from '@/types';

interface TestRunnerProps {
  model: Model;
  testType: TestType;
}

export function TestRunner({ model, testType }: TestRunnerProps) {
  const { canRunTests } = usePermissions();
  const { currentUser } = useRole();
  const { runTest, isRunning } = useRunStore();
  const [result, setResult] = useState<TestResult | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined);
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
        const illustrative = ILLUSTRATIVE_RESULTS.find(
          (r) => r.modelId === model.id && r.testType === testType
        );
        if (!illustrative) {
          toast.error('No result available for this test');
          return;
        }
        testResult = { ...illustrative };
      }

      const run = await runTest({
        modelId: model.id,
        testType,
        result: testResult,
        runBy: currentUser,
      });
      setResult(testResult);
      setSelectedRunId(run.id);
      toast.success(`${TEST_LABELS[testType]} completed — ${testResult.verdict.toUpperCase()}`);
    } catch (err) {
      toast.error('Engine error — see console for details');
      console.error(err);
    }
  }

  function handleSelectRun(run: TestRun) {
    setResult(run.result);
    setSelectedRunId(run.id);
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
                : 'border-[var(--border-hairline)] bg-surface text-ink hover:border-[var(--ink)]'
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
          {result && <ExportButton result={result} modelName={model.name} />}
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

      {/* Engine status */}
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

      {/* Main result + run history side by side */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <div>
          {result ? (
            <TestResultView result={result} />
          ) : (
            <SurfaceCard>
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-small text-ink-muted">
                  {canRunTests
                    ? 'Click Run to execute the test.'
                    : 'Switch to Owner role to run tests.'}
                </p>
              </div>
            </SurfaceCard>
          )}
        </div>

        {/* Run history sidebar */}
        <div>
          <RunHistory
            modelId={model.id}
            testType={testType}
            selectedRunId={selectedRunId}
            onSelectRun={handleSelectRun}
          />
        </div>
      </div>
    </div>
  );
}
