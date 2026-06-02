'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { FormulaTrace } from '@/types';

interface FormulaPanelProps {
  formula: FormulaTrace;
  className?: string;
}

export function FormulaPanel({ formula, className }: FormulaPanelProps) {
  const [expanded, setExpanded] = useState(true);

  function copyToClipboard() {
    const text = [
      `Formula: ${formula.name}`,
      `Equation: ${formula.equation}`,
      '',
      'Inputs:',
      ...Object.entries(formula.inputs).map(([k, v]) => `  ${k}: ${v}`),
      '',
      'Computation steps:',
      ...formula.steps.map((s, i) => `  ${i + 1}. ${s.label}\n     ${s.expression} = ${s.value}`),
      '',
      `Result: ${formula.result}`,
      `Reference: ${formula.reference}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Formula copied to clipboard');
  }

  return (
    <div
      className={cn('rounded-card border', className)}
      style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-sunken)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-card px-5 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        aria-expanded={expanded}
        aria-controls="formula-panel-content"
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          <span className="text-small font-semibold text-ink">{formula.name}</span>
          <span className="hidden text-caption text-ink-muted sm:block">— {formula.reference}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="flex items-center gap-1 rounded px-2 py-1 text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            aria-label="Copy formula and inputs"
          >
            <Copy className="h-3 w-3" aria-hidden="true" />
            Copy
          </button>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          id="formula-panel-content"
          className="space-y-4 border-t px-5 pb-5 pt-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          {/* Equation */}
          <div>
            <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Equation
            </p>
            <code
              className="text-small block rounded px-3 py-2 font-mono text-ink"
              style={{ backgroundColor: 'var(--surface-sunken)' }}
            >
              {formula.equation}
            </code>
          </div>

          {/* Inputs table */}
          <div>
            <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Inputs
            </p>
            <div
              className="overflow-hidden rounded border"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {Object.entries(formula.inputs).map(([key, val], i) => (
                <div
                  key={key}
                  className={cn('flex items-center justify-between px-3 py-2', i > 0 && 'border-t')}
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <span className="text-small text-ink-secondary">{key}</span>
                  <span className="text-small font-medium tabular-nums text-ink">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Computation steps */}
          <div>
            <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Computation Steps
            </p>
            <div className="space-y-2">
              {formula.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption font-bold"
                    style={{
                      backgroundColor: 'var(--canvas)',
                      color: 'var(--ink-muted)',
                    }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-small text-ink-secondary">{step.label}</p>
                    <code className="mt-0.5 block font-mono text-caption text-ink-muted">
                      {step.expression}
                    </code>
                    <p className="text-small mt-0.5 font-semibold tabular-nums text-ink">
                      = {String(step.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div
            className="flex items-center justify-between rounded px-4 py-3"
            style={{ backgroundColor: 'var(--surface-sunken)' }}
          >
            <span className="text-small font-semibold text-ink-secondary">Result</span>
            <span className="text-small font-bold tabular-nums text-ink">
              {String(formula.result)}
            </span>
          </div>

          {/* Reference */}
          <p className="text-caption text-ink-muted">
            Regulatory reference:{' '}
            <span className="font-medium text-ink-secondary">{formula.reference}</span>
          </p>
        </div>
      )}
    </div>
  );
}
