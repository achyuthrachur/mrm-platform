'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronRight, BookOpen, Database } from 'lucide-react';
import { useModels } from '@/lib/store/models-context';
import { usePermissions } from '@/hooks/usePermissions';
import { useRole } from '@/components/features/shell/RoleProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TierBadge } from '@/components/ui/TierBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TestRunner } from '@/components/features/workbench/TestRunner';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';
import { TEST_METHODOLOGY } from '@/lib/data/test-methodology';
import type { Model, TestType } from '@/types';

/** Shows methodology description before the test has been run. */
function MethodologyPanel({ model, testType }: { model: Model; testType: TestType }) {
  const { canRunTests } = usePermissions();
  const info = TEST_METHODOLOGY[testType];

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 pb-4"
        style={{ borderBottom: '1px solid var(--border-hairline)' }}
      >
        <TierBadge tier={model.tier} />
        <div>
          <h2 className="text-h3 font-semibold text-ink">{model.name}</h2>
          <p className="text-body-sm text-ink-muted">
            {model.id} · {model.cat}
          </p>
        </div>
      </div>

      {!canRunTests && (
        <div
          className="flex items-start gap-2.5 rounded-control px-4 py-3 text-body-sm"
          style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
        >
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>MRM Officers view test results only. Switch to Model Owner to execute tests.</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
            What this test measures
          </p>
          <p className="text-body leading-relaxed text-ink-body">{info.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-control p-4" style={{ backgroundColor: 'var(--surface-sunken)' }}>
            <p className="mb-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
              Regulatory Reference
            </p>
            <p className="text-body-sm font-medium text-ink">{info.srRef}</p>
          </div>
          <div className="rounded-control p-4" style={{ backgroundColor: 'var(--surface-sunken)' }}>
            <p className="mb-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
              Data Used
            </p>
            <p className="text-body-sm text-ink-body">{info.dataUsed}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
            Key Metrics Computed
          </p>
          <div className="flex flex-wrap gap-2">
            {info.metrics.map((m) => (
              <span
                key={m}
                className="rounded-chip px-2.5 py-1 text-body-sm"
                style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink-secondary)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-control p-4" style={{ backgroundColor: 'var(--surface-sunken)' }}>
          <p className="mb-1 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
            Verdict Bands
          </p>
          <p className="font-mono text-body-sm text-ink-body">{info.verdictBands}</p>
        </div>
      </div>

      {canRunTests && (
        <p className="text-body-sm text-ink-muted">
          Click <strong className="text-ink">Run {TEST_LABELS[testType]}</strong> to execute against
          the generated dataset.
        </p>
      )}
    </div>
  );
}

function WorkbenchContent() {
  const { models, loading } = useModels();
  const { canViewAllModels, canRunTests } = usePermissions();
  const { currentUser } = useRole();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [modelSearch, setModelSearch] = useState('');

  // Role scoping:
  // Model Owner  → only their own models (canViewAllModels = false)
  // MRM Officer  → full portfolio (canViewAllModels = true), but Run button locked inside TestRunner
  const scopedModels = canViewAllModels ? models : models.filter((m) => m.owner === currentUser);

  const filteredModels = scopedModels.filter((m) => {
    if (!modelSearch) return true;
    const q = modelSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.cat.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const modelId = searchParams.get('model');
    const testParam = searchParams.get('test');
    if (modelId && models.length > 0) {
      // Look up within scoped models only — owners can't deep-link to others' models
      const allowed = canViewAllModels ? models : models.filter((m) => m.owner === currentUser);
      const model = allowed.find((m) => m.id === modelId);
      if (model) {
        setSelectedModel(model);
        if (testParam) setSelectedTest(testParam as TestType);
      }
    }
  }, [searchParams, models, canViewAllModels, currentUser]);

  const availableTests: TestType[] = selectedModel?.selectedTests?.map((t) => t.testType) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Validation</Eyebrow>
          <h1 className="mt-1 text-h1 font-bold text-ink">Testing Workbench</h1>
        </div>
        {!canRunTests && (
          <span
            className="mt-1 rounded-control px-3 py-1.5 text-body-sm font-medium"
            style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
          >
            View-only — MRM Officer
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left: model + test selector */}
        <div className="space-y-3">
          <SurfaceCard noPadding>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
              <p className="mb-2 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                {canViewAllModels ? 'All Models' : 'Your Models'}
                <span className="ml-1.5">({filteredModels.length})</span>
              </p>
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Search models…"
                  className="placeholder-ink-muted w-full rounded-control border bg-surface-sunken py-1.5 pl-8 pr-3 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                  aria-label="Search models"
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
              {loading ? (
                <p className="px-4 py-3 text-body-sm text-ink-muted">Loading…</p>
              ) : filteredModels.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Database className="mb-2 h-6 w-6 text-ink-muted" aria-hidden="true" />
                  <p className="text-body-sm text-ink-muted">No models found.</p>
                </div>
              ) : (
                <ul role="list">
                  {filteredModels.map((model) => {
                    const isSelected = selectedModel?.id === model.id;
                    return (
                      <li key={model.id} role="listitem">
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setSelectedTest(null);
                          }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'}`}
                          aria-pressed={isSelected}
                          style={
                            isSelected
                              ? { borderLeft: '3px solid var(--accent)' }
                              : { borderLeft: '3px solid transparent' }
                          }
                        >
                          <TierBadge tier={model.tier} />
                          <div className="min-w-0">
                            <p className="truncate text-body-sm font-medium text-ink">
                              {model.name}
                            </p>
                            <p className="text-caption text-ink-muted">{model.id}</p>
                          </div>
                          {isSelected && (
                            <ChevronRight
                              className="ml-auto h-3.5 w-3.5 shrink-0 text-ink-muted"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </SurfaceCard>

          {selectedModel && availableTests.length > 0 && (
            <SurfaceCard noPadding>
              <div
                className="px-4 py-2.5"
                style={{ borderBottom: '1px solid var(--border-hairline)' }}
              >
                <p className="text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                  Select Test
                </p>
              </div>
              <ul role="list">
                {availableTests.map((testType) => {
                  const isSelected = selectedTest === testType;
                  return (
                    <li key={testType} role="listitem">
                      <button
                        onClick={() => setSelectedTest(testType)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'}`}
                        aria-pressed={isSelected}
                        style={
                          isSelected
                            ? { borderLeft: '3px solid var(--accent)' }
                            : { borderLeft: '3px solid transparent' }
                        }
                      >
                        <span className="text-body-sm font-medium text-ink">
                          {TEST_LABELS[testType]}
                        </span>
                        {isSelected && (
                          <ChevronRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SurfaceCard>
          )}
        </div>

        {/* Right panel */}
        <div>
          {!selectedModel ? (
            <SurfaceCard>
              <div className="flex flex-col items-center py-16 text-center">
                <Database className="mb-3 h-8 w-8 text-ink-muted" aria-hidden="true" />
                <p className="text-body font-medium text-ink">Select a model to begin</p>
                <p className="mt-1 max-w-xs text-body-sm text-ink-muted">
                  {canRunTests
                    ? 'Choose a model, select a test type, and run the validation engine.'
                    : 'Choose a model to view available tests and their results.'}
                </p>
              </div>
            </SurfaceCard>
          ) : !selectedTest ? (
            <SurfaceCard>
              <div
                className="mb-4 flex items-start gap-3 pb-4"
                style={{ borderBottom: '1px solid var(--border-hairline)' }}
              >
                <TierBadge tier={selectedModel.tier} />
                <div>
                  <h2 className="text-h2 font-semibold text-ink">{selectedModel.name}</h2>
                  <p className="text-body-sm text-ink-muted">{selectedModel.id}</p>
                </div>
              </div>
              <p className="text-body-sm text-ink-muted">
                {availableTests.length === 0
                  ? 'No scheduled tests configured for this model.'
                  : `${availableTests.length} test${availableTests.length !== 1 ? 's' : ''} available — select one from the list to see its methodology.`}
              </p>
            </SurfaceCard>
          ) : (
            <SurfaceCard
              title={TEST_LABELS[selectedTest]}
              eyebrow={`${selectedModel.name} · ${selectedModel.id}`}
            >
              {/*
                key = model+test — forces TestRunner to fully remount when
                either changes, clearing the previous result automatically.
                MethodologyPanel shows before the first run; TestRunner
                replaces it once the user executes or selects a past run.
              */}
              <TestRunner
                key={`${selectedModel.id}:${selectedTest}`}
                model={selectedModel}
                testType={selectedTest}
                methodologyPanel={
                  <MethodologyPanel model={selectedModel} testType={selectedTest} />
                }
              />
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-body-sm text-ink-muted">Loading workbench…</div>}>
      <WorkbenchContent />
    </Suspense>
  );
}
