'use client';

import Link from 'next/link';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { PIPELINE_STEPS, PIPELINE_QUEUE } from '@/lib/data/governance';

export function ApprovalPipeline() {
  return (
    <SurfaceCard title="Model Approval Pipeline" eyebrow="SR 11-7 Model Lifecycle">
      <div className="space-y-6">
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} className="flex shrink-0 items-center">
              <div className="flex flex-col items-center text-center" style={{ minWidth: 100 }}>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-small font-bold"
                  style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
                >
                  {step.id}
                </div>
                <p className="mt-1 text-caption font-semibold text-ink">{step.label}</p>
                <p className="mt-0.5 max-w-[90px] text-caption text-ink-muted">
                  {step.description}
                </p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className="mx-1 h-px w-8 shrink-0"
                  style={{ backgroundColor: 'var(--border-hairline)' }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Current Queue
          </p>
          {PIPELINE_QUEUE.map((item) => (
            <div
              key={item.modelId}
              className="flex items-start gap-4 rounded-md p-3"
              style={{ backgroundColor: 'var(--canvas)' }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-small font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                {item.currentStep}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-small font-medium text-ink">{item.modelName}</p>
                    <p className="text-caption text-ink-muted">
                      {item.modelId} · Submitted {item.submittedDate}
                    </p>
                  </div>
                  <Link
                    href={`/inventory/${item.modelId}`}
                    className="shrink-0 rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  >
                    View
                  </Link>
                </div>
                {item.notes && <p className="mt-1 text-caption text-ink-muted">{item.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                {PIPELINE_STEPS.map((step) => {
                  const done = step.id < item.currentStep;
                  const current = step.id === item.currentStep;
                  return (
                    <span
                      key={step.id}
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: done
                          ? 'var(--status-pass)'
                          : current
                            ? 'var(--accent)'
                            : 'var(--border-hairline)',
                      }}
                      aria-label={`Step ${step.id}: ${done ? 'complete' : current ? 'current' : 'pending'}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {PIPELINE_QUEUE.length === 0 && (
            <p className="text-small text-ink-muted">No models in the approval queue.</p>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
