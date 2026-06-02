'use client';

import type React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import type { TestResult } from '@/types';

interface STMResultViewProps {
  result: TestResult;
}

/** Rich Source-to-Model result view — reconciliation tiles, pipeline, discrepancy table. */
export function STMResultView({ result }: STMResultViewProps): React.JSX.Element {
  const metrics = result.metrics;

  // Pull out key counts from metrics
  const sourceCount = metrics.find((m) => m.label === 'Source Record Count')?.value ?? '—';
  const modelCount = metrics.find((m) => m.label === 'Model Record Count')?.value ?? '—';
  const completenessRow = metrics.find((m) => m.label === 'Completeness Rate');
  const missingRow = metrics.find((m) => m.label.includes('Missing'));
  const phantomRow = metrics.find((m) => m.label === 'Phantom Records');
  const numericRow = metrics.find((m) => m.label.includes('Numeric Discrepanc'));
  const textRow = metrics.find((m) => m.label.includes('Text'));

  const statusColor = (status: string) =>
    status === 'pass'
      ? 'var(--status-pass)'
      : status === 'warn'
        ? 'var(--status-warn)'
        : 'var(--status-fail)';

  return (
    <div className="space-y-4">
      {/* Record-count reconciliation tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Source Records', value: sourceCount, color: 'var(--status-info)' },
          { label: 'Matched Records', value: modelCount, color: 'var(--status-pass)' },
          {
            label: 'Missing',
            value: missingRow?.value ?? '—',
            color: missingRow?.status === 'pass' ? 'var(--status-pass)' : 'var(--status-fail)',
          },
          {
            label: 'Phantom',
            value: phantomRow?.value ?? '—',
            color: phantomRow?.status === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)',
          },
        ].map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col gap-1 rounded-card p-4"
            style={{ boxShadow: 'var(--shadow-card)', backgroundColor: 'var(--surface)' }}
          >
            <span className="text-caption uppercase tracking-wide text-ink-muted">
              {tile.label}
            </span>
            <span className="text-h2 font-bold tabular-nums" style={{ color: tile.color }}>
              {tile.value}
            </span>
          </div>
        ))}
      </div>

      {/* Data lineage pipeline */}
      <SurfaceCard title="Data Lineage" eyebrow="Source → Model">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Source System', note: result.dataSources[0] ?? 'Source' },
            { label: 'Extract', note: 'Monthly batch' },
            { label: 'Validate', note: completenessRow ? `${completenessRow.value}` : '—' },
            { label: 'Model Input', note: result.dataSources[1] ?? 'Model' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="text-center">
                <div
                  className="rounded px-3 py-2 text-center"
                  style={{ backgroundColor: 'var(--canvas)', minWidth: 100 }}
                >
                  <p className="text-small font-semibold text-ink">{step.label}</p>
                  <p className="max-w-[120px] truncate text-caption text-ink-muted">{step.note}</p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* Completeness status */}
      {completenessRow && (
        <div
          className="flex items-center gap-3 rounded-card p-4"
          style={{ backgroundColor: 'var(--canvas)' }}
        >
          {completenessRow.status === 'pass' ? (
            <CheckCircle2
              className="h-5 w-5 shrink-0"
              style={{ color: 'var(--status-pass)' }}
              aria-hidden="true"
            />
          ) : completenessRow.status === 'warn' ? (
            <AlertTriangle
              className="h-5 w-5 shrink-0"
              style={{ color: 'var(--status-warn)' }}
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="h-5 w-5 shrink-0"
              style={{ color: 'var(--status-fail)' }}
              aria-hidden="true"
            />
          )}
          <div>
            <p className="text-small font-semibold text-ink">
              Completeness: {completenessRow.value}
            </p>
            <p className="text-caption text-ink-muted">{completenessRow.threshold}</p>
          </div>
          {completenessRow.note && (
            <span
              className="ml-auto rounded px-2 py-0.5 text-caption"
              style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
            >
              {completenessRow.note}
            </span>
          )}
        </div>
      )}

      {/* Field-level discrepancy table */}
      {((numericRow && numericRow.value !== '0') || (textRow && textRow.value !== '0')) && (
        <SurfaceCard title="Field-Level Discrepancies">
          <div className="space-y-2">
            {[numericRow, textRow].filter(Boolean).map((row) => (
              <div
                key={row!.label}
                className="flex items-center justify-between border-b py-1.5 last:border-b-0"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <div>
                  <p className="text-small font-medium text-ink">{row!.label}</p>
                  <p className="text-caption text-ink-muted">{row!.threshold}</p>
                </div>
                <span
                  className="text-small font-bold tabular-nums"
                  style={{ color: statusColor(row!.status) }}
                >
                  {row!.value}
                </span>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
