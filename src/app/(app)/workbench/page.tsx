'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { useModels } from '@/lib/store/models-context';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TierBadge } from '@/components/ui/TierBadge';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TestRunner } from '@/components/features/workbench/TestRunner';
import { TEST_LABELS } from '@/lib/data/monitoring-calendar';
import type { Model, TestType } from '@/types';

export default function WorkbenchPage() {
  const { models, loading } = useModels();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [modelSearch, setModelSearch] = useState('');

  // Pre-select from URL params (deep-link from inventory, calendar, test-health chips)
  useEffect(() => {
    const modelId = searchParams.get('model');
    const testParam = searchParams.get('test');
    if (modelId && models.length > 0) {
      const model = models.find((m) => m.id === modelId);
      if (model) {
        setSelectedModel(model);
        if (testParam) setSelectedTest(testParam as TestType);
      }
    }
  }, [searchParams, models]);

  const filteredModels = models.filter((m) => {
    if (!modelSearch) return true;
    const q = modelSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.cat.toLowerCase().includes(q)
    );
  });

  const availableTests: TestType[] = selectedModel?.selectedTests?.map((t) => t.testType) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Validation</Eyebrow>
        <h1 className="mt-1 text-h1 font-bold text-ink">Testing Workbench</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* ── Left panel: model selector ── */}
        <div className="space-y-3">
          <SurfaceCard title="Select Model" noPadding>
            <div className="px-4 py-3">
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
                  className="placeholder-ink-muted w-full rounded border bg-surface py-1.5 pl-8 pr-3 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                  aria-label="Search models"
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
              {loading ? (
                <p className="px-4 py-3 text-small text-ink-muted">Loading…</p>
              ) : filteredModels.length === 0 ? (
                <p className="px-4 py-3 text-small text-ink-muted">No models found.</p>
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
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                            isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'
                          }`}
                          aria-pressed={isSelected}
                          style={
                            isSelected
                              ? { borderLeft: '3px solid var(--accent)' }
                              : { borderLeft: '3px solid transparent' }
                          }
                        >
                          <TierBadge tier={model.tier} />
                          <div className="min-w-0">
                            <p className="truncate text-small font-medium text-ink">{model.name}</p>
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

          {/* Test picker */}
          {selectedModel && availableTests.length > 0 && (
            <SurfaceCard title="Select Test" noPadding>
              <ul role="list">
                {availableTests.map((testType) => {
                  const isSelected = selectedTest === testType;
                  return (
                    <li key={testType} role="listitem">
                      <button
                        onClick={() => setSelectedTest(testType)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                          isSelected ? 'bg-[var(--canvas)]' : 'hover:bg-[var(--canvas)]'
                        }`}
                        aria-pressed={isSelected}
                        style={
                          isSelected
                            ? { borderLeft: '3px solid var(--accent)' }
                            : { borderLeft: '3px solid transparent' }
                        }
                      >
                        <span className="text-small font-medium text-ink">
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

        {/* ── Right panel: runner + results ── */}
        <div>
          {!selectedModel ? (
            <SurfaceCard>
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-small text-ink-secondary">
                  Select a model from the list to begin.
                </p>
              </div>
            </SurfaceCard>
          ) : !selectedTest ? (
            <SurfaceCard>
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <TierBadge tier={selectedModel.tier} />
                  <span
                    className="text-caption font-medium"
                    style={{
                      color:
                        selectedModel.risk === 'High'
                          ? 'var(--status-fail)'
                          : selectedModel.risk === 'Medium'
                            ? 'var(--status-warn)'
                            : 'var(--status-pass)',
                    }}
                  >
                    {selectedModel.risk} Risk
                  </span>
                </div>
                <h2 className="text-h2 font-semibold text-ink">{selectedModel.name}</h2>
                <p className="mt-0.5 text-small text-ink-muted">{selectedModel.id}</p>
              </div>
              <p className="text-small text-ink-secondary">
                Select a test from the list to run it.
              </p>
            </SurfaceCard>
          ) : (
            <SurfaceCard
              title={TEST_LABELS[selectedTest]}
              eyebrow={`${selectedModel.name} · ${selectedModel.id}`}
            >
              <TestRunner model={selectedModel} testType={selectedTest} />
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
}
