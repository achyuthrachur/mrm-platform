'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThresholdField } from '@/components/ui/ThresholdField';
import {
  THRESHOLD_SCHEMA_BY_TYPE,
  getDefaultThresholds,
  getVisibleFields,
  hasOverrides,
} from '@/lib/data/test-threshold-schema';
import type { ThresholdConfig, TestType } from '@/types';

const FREQ_OPTIONS = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Ad-Hoc'] as const;
const DEFAULT_FREQ: Record<string, string> = {
  'source-to-model': 'Monthly',
  backtesting: 'Quarterly',
  benchmarking: 'Quarterly',
  sensitivity: 'Quarterly',
  stress: 'Semi-Annual',
  override: 'Quarterly',
  psi: 'Monthly',
  csi: 'Quarterly',
};

const SR_REF: Record<TestType, string> = {
  'source-to-model': 'SR 11-7 §I.D',
  backtesting: 'SR 11-7 §II.B',
  benchmarking: 'SR 11-7 §I.A',
  sensitivity: 'SR 11-7 §II.C',
  stress: 'SR 11-7 §I.E',
  override: 'SR 11-7 §II.C',
  psi: 'SR 26-2 §II.D',
  csi: 'SR 26-2 §II.D',
};

interface TestConfigPanelProps {
  testType: TestType;
  category: string;
  frequency: string;
  thresholdConfig: ThresholdConfig;
  onFrequencyChange: (testType: TestType, freq: string) => void;
  onThresholdChange: (testType: TestType, key: string, value: number) => void;
}

export function TestConfigPanel({
  testType,
  category,
  frequency,
  thresholdConfig,
  onFrequencyChange,
  onThresholdChange,
}: TestConfigPanelProps) {
  const [open, setOpen] = useState(false);

  const schema = THRESHOLD_SCHEMA_BY_TYPE[testType];
  const defaultFreq = DEFAULT_FREQ[testType] ?? 'Quarterly';
  const isNonDefaultFreq = frequency !== defaultFreq;
  const defaults = getDefaultThresholds(testType);
  const overrideDetected = hasOverrides(thresholdConfig.fields, testType);
  const visibleFields = getVisibleFields(testType, category);

  const testLabel =
    schema?.label ?? testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className="rounded-card border"
      style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
    >
      {/* Header row */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`tcp-${testType}-body`}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
        )}

        <span className="flex-1 text-body-sm font-semibold text-ink">{testLabel}</span>

        <span className="font-mono text-caption text-ink-muted">{SR_REF[testType]}</span>

        <span
          className={cn(
            'rounded-chip px-2 py-0.5 text-caption font-medium',
            isNonDefaultFreq ? 'text-[var(--status-warn)]' : 'text-ink-secondary'
          )}
          style={{
            backgroundColor: isNonDefaultFreq ? 'var(--status-warn-bg)' : 'var(--neutral-100)',
          }}
        >
          {frequency}
        </span>

        {overrideDetected && (
          <span
            className="flex items-center gap-0.5 rounded-chip px-2 py-0.5 text-caption font-medium"
            style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn)' }}
            aria-label="Threshold overrides present"
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Overrides
          </span>
        )}
      </button>

      {/* Expandable body */}
      {open && (
        <div
          id={`tcp-${testType}-body`}
          className="space-y-5 border-t px-4 pb-5 pt-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          {/* Frequency selector */}
          <div>
            <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Frequency
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {FREQ_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFrequencyChange(testType, f)}
                  className={cn(
                    'rounded-control border px-3 py-1 text-body-sm transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]',
                    frequency === f
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                      : 'border-[var(--border-hairline)] bg-surface text-ink-secondary hover:border-[var(--border-strong)] hover:text-ink'
                  )}
                  aria-pressed={frequency === f}
                >
                  {f}
                </button>
              ))}
            </div>
            {isNonDefaultFreq && (
              <p
                className="mt-2 flex items-center gap-1 text-caption"
                style={{ color: 'var(--status-warn)' }}
              >
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                Non-default frequency — requires MRM approval
              </p>
            )}
          </div>

          {/* Threshold fields */}
          {visibleFields.length > 0 && (
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Thresholds
              </p>
              <div className="space-y-4">
                {visibleFields.map((field) => {
                  const currentVal =
                    thresholdConfig.fields[field.key] ?? defaults[field.key] ?? field.default;
                  const isOverride = currentVal !== defaults[field.key];
                  return (
                    <ThresholdField
                      key={field.key}
                      field={field}
                      value={currentVal}
                      onChange={(key, val) => onThresholdChange(testType, key, val)}
                      isOverride={isOverride}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
