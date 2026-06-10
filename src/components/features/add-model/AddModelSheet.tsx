'use client';

/**
 * Model Onboarding Drawer (PRD-12).
 * Multi-step sheet: A) Model Identity → B) Test Selection → C) Test Config → D) Review & Submit.
 * Exported as `AddModelSheet` for backward compatibility.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { TestConfigPanel } from './TestConfigPanel';
import { useSubmissions } from '@/lib/store/submissions-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { MODEL_TEST_MENU } from '@/lib/data/monitoring-calendar';
import { getDefaultThresholds, hasOverrides } from '@/lib/data/test-threshold-schema';
import { getToday } from '@/lib/clock';
import type { TestType, SelectedTest, ModelSubmission, ThresholdConfig } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────

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

const CATEGORIES = Object.keys(MODEL_TEST_MENU);

const TIER_DESCRIPTIONS: Record<string, string> = {
  '1': 'Tier 1 — Highest Risk (SR 11-7: significant impact on financial condition)',
  '2': 'Tier 2 — Significant (moderate complexity and materiality)',
  '3': 'Tier 3 — Low Risk (limited impact, simple methodology)',
};

const FRAMEWORKS = ['Internal', 'Vendor', 'Hybrid'];

// ── Validation schema (Section A) ────────────────────────────────────────

const schema = z.object({
  name: z.string().min(3, 'Model name must be at least 3 characters'),
  cat: z.string().min(1, 'Category is required'),
  sub: z.string().optional(),
  tier: z.enum(['1', '2', '3']),
  ownerTitle: z.string().min(1, 'Owner title is required'),
  framework: z.enum(['Internal', 'Vendor', 'Hybrid']),
  method: z.string().min(20, 'Methodology must be at least 20 characters'),
  desc: z.string().min(50, 'Description must be at least 50 characters'),
  limits: z.string().min(1, 'Limitations are required'),
  dataLimits: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Step indicators ───────────────────────────────────────────────────────

const STEPS = [
  { id: 'identity', label: 'Identity' },
  { id: 'tests', label: 'Tests' },
  { id: 'config', label: 'Configure' },
  { id: 'review', label: 'Review' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ── Props ────────────────────────────────────────────────────────────────

interface AddModelSheetProps {
  onClose: () => void;
  onSaved?: (modelId: string) => void;
  /** Pre-fill from an existing draft (Changes Requested re-entry) */
  existingSubmission?: ModelSubmission;
}

// ── Component ────────────────────────────────────────────────────────────

export function AddModelSheet({ onClose, onSaved, existingSubmission }: AddModelSheetProps) {
  const { saveDraft, submitForReview } = useSubmissions();
  const { currentUser } = useRole();
  const { canAddModel } = usePermissions();

  const [step, setStep] = useState<StepId>('identity');
  const [selectedTests, setSelectedTests] = useState<Record<TestType, string>>(() => {
    if (!existingSubmission) return {} as Record<TestType, string>;
    return Object.fromEntries(
      existingSubmission.selectedTests.map((t) => [t.testType, t.frequency])
    ) as Record<TestType, string>;
  });
  const [thresholdConfigs, setThresholdConfigs] = useState<Record<TestType, ThresholdConfig>>(
    () => {
      if (!existingSubmission) return {} as Record<TestType, ThresholdConfig>;
      return Object.fromEntries(
        existingSubmission.thresholdConfigs.map((c) => [c.testType, c])
      ) as Record<TestType, ThresholdConfig>;
    }
  );
  const [dataSources, setDataSources] = useState<string[]>(existingSubmission?.model.sources ?? []);
  const [newSource, setNewSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const today = getToday();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existingSubmission?.model.name ?? '',
      cat: existingSubmission?.model.cat ?? 'CECL',
      sub: existingSubmission?.model.sub ?? '',
      tier: String(existingSubmission?.model.tier ?? '2') as '1' | '2' | '3',
      ownerTitle: existingSubmission?.model.ownerTitle ?? 'Model Owner',
      framework: (existingSubmission?.model.framework ?? 'Internal') as
        | 'Internal'
        | 'Vendor'
        | 'Hybrid',
      method: existingSubmission?.model.method ?? '',
      desc: existingSubmission?.model.desc ?? '',
      limits: existingSubmission?.model.limits ?? '',
      dataLimits: existingSubmission?.model.dataLimits ?? '',
    },
  });

  const watchCat = watch('cat');
  const availableTests = (MODEL_TEST_MENU[watchCat] ?? []) as TestType[];

  // ── Permission wall ────────────────────────────────────────────────────

  if (!canAddModel) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-model-title"
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
        <div
          className="relative flex h-full w-full max-w-lg flex-col items-center justify-center gap-4 p-8 shadow-[var(--elev-4)]"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--status-fail-bg)' }}
          >
            <X className="h-6 w-6" style={{ color: 'var(--status-fail)' }} aria-hidden="true" />
          </div>
          <p className="text-h3 font-semibold text-ink" id="add-model-title">
            Access Restricted
          </p>
          <p className="text-center text-body text-ink-secondary">
            Only Model Owners can onboard new models. MRM Officers review and approve submissions.
          </p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function getOrInitThresholdConfig(testType: TestType): ThresholdConfig {
    return (
      thresholdConfigs[testType] ?? {
        testKey: testType,
        testType,
        fields: getDefaultThresholds(testType),
        overridesDefault: false,
      }
    );
  }

  function updateThreshold(testType: TestType, key: string, value: number) {
    const current = getOrInitThresholdConfig(testType);
    const newFields = { ...current.fields, [key]: value };
    const overrides = hasOverrides(newFields, testType);
    setThresholdConfigs((prev) => ({
      ...prev,
      [testType]: { ...current, fields: newFields, overridesDefault: overrides },
    }));
  }

  function updateFrequency(testType: TestType, freq: string) {
    setSelectedTests((prev) => ({ ...prev, [testType]: freq }));
  }

  function toggleTest(testType: TestType) {
    setSelectedTests((prev) => {
      if (testType in prev) {
        const next = { ...prev };
        delete next[testType];
        return next;
      }
      return { ...prev, [testType]: DEFAULT_FREQ[testType] ?? 'Quarterly' };
    });
  }

  function handleCategoryChange() {
    if (Object.keys(selectedTests).length > 0) {
      const confirmed = window.confirm('Changing category clears your test selections. Continue?');
      if (!confirmed) return;
      setSelectedTests({} as Record<TestType, string>);
      setThresholdConfigs({} as Record<TestType, ThresholdConfig>);
    }
  }

  function addSource() {
    if (newSource.trim() && !dataSources.includes(newSource.trim())) {
      setDataSources((prev) => [...prev, newSource.trim()]);
      setNewSource('');
    }
  }

  function removeSource(s: string) {
    setDataSources((prev) => prev.filter((x) => x !== s));
  }

  function buildSelectedTests(): SelectedTest[] {
    return Object.entries(selectedTests).map(([testType, frequency]) => ({
      testType: testType as TestType,
      frequency,
      srRef: SR_REF[testType as TestType] ?? 'SR 11-7',
    }));
  }

  function buildThresholdConfigs(): ThresholdConfig[] {
    return Object.values(thresholdConfigs);
  }

  async function goToStep(targetStep: StepId, _formData?: FormData) {
    const stepsOrder: StepId[] = ['identity', 'tests', 'config', 'review'];
    const currentIdx = stepsOrder.indexOf(step);
    const targetIdx = stepsOrder.indexOf(targetStep);

    if (targetIdx > currentIdx) {
      // Validate current step before advancing
      if (step === 'identity') {
        const valid = await trigger();
        if (!valid) return;
      }
      if (step === 'tests' && Object.keys(selectedTests).length === 0) {
        toast.error('Select at least one test before proceeding');
        return;
      }
    }
    setStep(targetStep);
  }

  async function handleSaveDraft(formData: FormData) {
    setSaving(true);
    try {
      const submission: ModelSubmission = buildSubmission(formData, 'draft');
      await saveDraft(submission);
      toast.success('Draft saved');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview(formData: FormData) {
    if (!confirmed) {
      toast.error('Please confirm the declaration before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const submission: ModelSubmission = buildSubmission(formData, 'draft');
      await saveDraft(submission);
      await submitForReview(submission.id, currentUser);
      toast.success('Submitted for MRM review');
      onSaved?.(submission.modelId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  function buildSubmission(formData: FormData, status: 'draft'): ModelSubmission {
    const modelId =
      existingSubmission?.modelId ??
      `${formData.cat
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase()
        .slice(0, 6)}-${today.slice(0, 4)}-${String(Date.now()).slice(-3)}`;

    const id = existingSubmission?.id ?? `SUB-${today.slice(0, 4)}-${String(Date.now()).slice(-4)}`;

    return {
      id,
      modelId,
      status,
      model: {
        id: modelId,
        name: formData.name,
        cat: formData.cat,
        sub: formData.sub ?? '',
        tier: Number(formData.tier) as 1 | 2 | 3,
        owner: currentUser,
        ownerTitle: formData.ownerTitle,
        framework: formData.framework,
        method: formData.method,
        desc: formData.desc,
        limits: formData.limits,
        dataLimits: formData.dataLimits ?? '',
        sources: dataSources,
      },
      selectedTests: buildSelectedTests(),
      thresholdConfigs: buildThresholdConfigs(),
      mrmNotes: '',
      priorNotes: existingSubmission?.priorNotes ?? [],
      auditTrail: existingSubmission?.auditTrail ?? [],
      dataGenStatus: undefined,
      dataGenProgress: undefined,
    };
  }

  // ── Render helpers ─────────────────────────────────────────────────────

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  function StepIndicator() {
    return (
      <nav className="flex items-center gap-0" aria-label="Onboarding steps">
        {STEPS.map((s, i) => {
          const done = i < stepIdx;
          const current = s.id === step;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-caption font-semibold transition-colors"
                style={{
                  backgroundColor: current
                    ? 'var(--ink)'
                    : done
                      ? 'var(--status-pass)'
                      : 'var(--neutral-200)',
                  color: current || done ? 'white' : 'var(--ink-muted)',
                }}
                aria-current={current ? 'step' : undefined}
              >
                {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </div>
              <span
                className="ml-1.5 text-caption font-medium"
                style={{ color: current ? 'var(--ink)' : 'var(--ink-muted)' }}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-3 h-px w-6"
                  style={{
                    backgroundColor: done ? 'var(--status-pass)' : 'var(--border-hairline)',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // ── Section A: Model Identity ──────────────────────────────────────────

  function SectionA() {
    return (
      <div className="space-y-5">
        {/* MRM Notes callout if resubmitting */}
        {existingSubmission?.mrmNotes && (
          <div
            className="rounded-card border p-4"
            style={{
              borderColor: 'var(--status-warn)',
              backgroundColor: 'var(--status-warn-bg)',
            }}
            role="alert"
          >
            <p
              className="mb-1 flex items-center gap-1.5 text-body-sm font-semibold"
              style={{ color: 'var(--status-warn)' }}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              MRM Reviewer Notes
            </p>
            <p className="text-body-sm text-ink-secondary">{existingSubmission.mrmNotes}</p>
            {existingSubmission.priorNotes.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-caption text-ink-muted">
                  Prior rounds ({existingSubmission.priorNotes.length})
                </summary>
                {existingSubmission.priorNotes.map((note, i) => (
                  <p key={i} className="mt-1 text-caption text-ink-secondary">
                    Round {i + 1}: {note}
                  </p>
                ))}
              </details>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-name">
              Model Name{' '}
              <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
                *
              </span>
            </label>
            <input
              id="am-name"
              {...register('name')}
              className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: errors.name ? 'var(--status-fail)' : 'var(--border-hairline)' }}
            />
            {errors.name && (
              <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-cat">
              Category{' '}
              <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
                *
              </span>
            </label>
            <select
              id="am-cat"
              {...register('cat')}
              onChange={(e) => {
                register('cat').onChange(e);
                handleCategoryChange();
              }}
              className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-sub">
              Sub-category
            </label>
            <input
              id="am-sub"
              {...register('sub')}
              placeholder="Optional"
              className="placeholder-ink-muted w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-tier">
              Tier{' '}
              <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
                *
              </span>
            </label>
            <select
              id="am-tier"
              {...register('tier')}
              className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {(['1', '2', '3'] as const).map((t) => (
                <option key={t} value={t} title={TIER_DESCRIPTIONS[t]}>
                  {TIER_DESCRIPTIONS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1.5 block text-body-sm font-medium text-ink"
              htmlFor="am-framework"
            >
              Development Framework{' '}
              <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
                *
              </span>
            </label>
            <select
              id="am-framework"
              {...register('framework')}
              className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {FRAMEWORKS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-owner">
              Model Owner
            </label>
            <input
              id="am-owner"
              value={currentUser}
              readOnly
              className="w-full rounded-control border bg-neutral-50 px-3 py-2 text-body-sm text-ink-secondary"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-title">
              Owner Title{' '}
              <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
                *
              </span>
            </label>
            <input
              id="am-title"
              {...register('ownerTitle')}
              className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{
                borderColor: errors.ownerTitle ? 'var(--status-fail)' : 'var(--border-hairline)',
              }}
            />
            {errors.ownerTitle && (
              <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                {errors.ownerTitle.message}
              </p>
            )}
          </div>
        </div>

        {/* Data sources tag input */}
        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-ink">
            Data Sources{' '}
            <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
              *
            </span>
          </label>
          <div className="flex gap-2">
            <input
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSource();
                }
              }}
              placeholder="Add data source and press Enter"
              className="placeholder-ink-muted flex-1 rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
            <Button type="button" variant="secondary" size="sm" onClick={addSource}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </Button>
          </div>
          {dataSources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dataSources.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-chip border px-2.5 py-0.5 text-caption text-ink-secondary"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <Tag className="h-3 w-3 text-ink-muted" aria-hidden="true" />
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSource(s)}
                    className="ml-0.5 rounded hover:text-ink focus-visible:outline"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {dataSources.length === 0 && (
            <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
              At least one data source is required
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-method">
            Methodology{' '}
            <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
              *
            </span>
          </label>
          <textarea
            id="am-method"
            {...register('method')}
            rows={3}
            placeholder="Describe the model methodology (minimum 20 characters)"
            className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            style={{ borderColor: errors.method ? 'var(--status-fail)' : 'var(--border-hairline)' }}
          />
          {errors.method && (
            <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
              {errors.method.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-desc">
            Description{' '}
            <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
              *
            </span>
          </label>
          <textarea
            id="am-desc"
            {...register('desc')}
            rows={4}
            placeholder="Describe what this model does and how it is used (minimum 50 characters)"
            className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            style={{ borderColor: errors.desc ? 'var(--status-fail)' : 'var(--border-hairline)' }}
          />
          {errors.desc && (
            <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
              {errors.desc.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-limits">
            Known Limitations{' '}
            <span aria-hidden="true" style={{ color: 'var(--status-fail)' }}>
              *
            </span>
          </label>
          <textarea
            id="am-limits"
            {...register('limits')}
            rows={3}
            className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            style={{ borderColor: errors.limits ? 'var(--status-fail)' : 'var(--border-hairline)' }}
          />
          {errors.limits && (
            <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
              {errors.limits.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-ink" htmlFor="am-datalimits">
            Data Limitations <span className="text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="am-datalimits"
            {...register('dataLimits')}
            rows={2}
            className="placeholder-ink-muted w-full resize-none rounded-control border bg-surface-sunken px-3 py-2 text-body-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            style={{ borderColor: 'var(--border-hairline)' }}
          />
        </div>
      </div>
    );
  }

  // ── Section B: Test Selection ──────────────────────────────────────────

  function SectionB() {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-ink-secondary">
          Select the validation tests to schedule for this model. Tests available depend on the
          selected category ({watchCat}).
        </p>
        {availableTests.length === 0 ? (
          <p className="text-body-sm text-ink-muted">No tests defined for this category.</p>
        ) : (
          <div className="space-y-2">
            {availableTests.map((testType) => {
              const isSelected = testType in selectedTests;
              const isNonDefault = isSelected && selectedTests[testType] !== DEFAULT_FREQ[testType];

              return (
                <div
                  key={testType}
                  className="flex cursor-pointer items-center gap-3 rounded-card border p-3 transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--ink)' : 'var(--border-hairline)',
                    backgroundColor: isSelected ? 'var(--canvas)' : 'var(--surface)',
                  }}
                  onClick={() => toggleTest(testType)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleTest(testType);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="pointer-events-none rounded"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-ink">
                      {testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-caption text-ink-muted">
                      <span className="font-mono">{SR_REF[testType]}</span>
                      {' · '}
                      Default: {DEFAULT_FREQ[testType] ?? 'Quarterly'}
                    </p>
                  </div>
                  {isNonDefault && (
                    <span
                      className="rounded-chip px-2 py-0.5 text-caption font-medium"
                      style={{
                        backgroundColor: 'var(--status-warn-bg)',
                        color: 'var(--status-warn)',
                      }}
                    >
                      needs approval
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {Object.keys(selectedTests).length === 0 && (
          <p className="text-caption" style={{ color: 'var(--status-warn)' }}>
            ⚠ At least one test must be selected to proceed
          </p>
        )}
      </div>
    );
  }

  // ── Section C: Per-test configuration ─────────────────────────────────

  function SectionC() {
    const selected = Object.keys(selectedTests) as TestType[];
    if (selected.length === 0) {
      return (
        <p className="text-body-sm text-ink-muted">No tests selected. Go back to Section B.</p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-body-sm text-ink-secondary">
          Configure frequency and thresholds for each selected test. Non-default values are flagged
          and visible to MRM during review.
        </p>
        {selected.map((testType) => (
          <TestConfigPanel
            key={testType}
            testType={testType}
            category={watchCat}
            frequency={selectedTests[testType]}
            thresholdConfig={getOrInitThresholdConfig(testType)}
            onFrequencyChange={updateFrequency}
            onThresholdChange={updateThreshold}
          />
        ))}
      </div>
    );
  }

  // ── Section D: Review & Submit ─────────────────────────────────────────

  function SectionD({ formData }: { formData: FormData }) {
    const tests = buildSelectedTests();
    const configs = buildThresholdConfigs();
    const freqOverrides = tests.filter((t) => t.frequency !== DEFAULT_FREQ[t.testType]);
    const thresholdOverrides = configs.filter((c) => c.overridesDefault);

    return (
      <div className="space-y-5">
        {/* Model summary */}
        <div
          className="space-y-3 rounded-card p-4"
          style={{ backgroundColor: 'var(--surface-sunken)' }}
        >
          <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Model Summary
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-body-sm">
            <div>
              <dt className="text-ink-muted">Name</dt>
              <dd className="font-medium text-ink">{formData.name}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Category</dt>
              <dd className="font-medium text-ink">{formData.cat}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Tier</dt>
              <dd className="font-medium text-ink">Tier {formData.tier}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Framework</dt>
              <dd className="font-medium text-ink">{formData.framework}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Owner</dt>
              <dd className="font-medium text-ink">{currentUser}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Data Sources</dt>
              <dd className="font-medium text-ink">{dataSources.length}</dd>
            </div>
          </dl>
        </div>

        {/* Selected tests */}
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Tests ({tests.length})
          </p>
          <div className="space-y-1">
            {tests.map((t) => {
              const isFreqOverride = t.frequency !== DEFAULT_FREQ[t.testType];
              const cfg = configs.find((c) => c.testType === t.testType);
              return (
                <div key={t.testType} className="flex items-center gap-2 text-body-sm">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--status-pass)' }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-ink">
                    {t.testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span
                    className="text-caption"
                    style={{ color: isFreqOverride ? 'var(--status-warn)' : 'var(--ink-muted)' }}
                  >
                    {t.frequency}
                    {isFreqOverride && ' ⚠'}
                  </span>
                  {cfg?.overridesDefault && (
                    <span className="text-caption" style={{ color: 'var(--status-warn)' }}>
                      threshold override
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Flagged items */}
        {(freqOverrides.length > 0 || thresholdOverrides.length > 0) && (
          <div
            className="rounded-card border p-3"
            style={{ borderColor: 'var(--status-warn)', backgroundColor: 'var(--status-warn-bg)' }}
          >
            <p
              className="mb-1 flex items-center gap-1.5 text-body-sm font-semibold"
              style={{ color: 'var(--status-warn)' }}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Items flagged for MRM review
            </p>
            {freqOverrides.map((t) => (
              <p key={t.testType} className="text-caption text-ink-secondary">
                Non-default frequency: {t.testType} → {t.frequency}
              </p>
            ))}
            {thresholdOverrides.map((c) => (
              <p key={c.testType} className="text-caption text-ink-secondary">
                Threshold override: {c.testType}
              </p>
            ))}
          </div>
        )}

        {/* Declaration */}
        <label
          className="flex cursor-pointer items-start gap-3 rounded-card border p-4"
          style={{
            borderColor: confirmed ? 'var(--ink)' : 'var(--border-hairline)',
            backgroundColor: confirmed ? 'var(--canvas)' : 'var(--surface)',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <span className="text-body-sm text-ink">
            I confirm this model submission is accurate and complete. I understand that the model
            will enter MRM review and will not appear in the live inventory until approved.
          </span>
        </label>
      </div>
    );
  }

  // ── Main form render ───────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-model-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className="relative flex h-full w-full max-w-2xl flex-col shadow-[var(--elev-4)]"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
        >
          <div>
            <h2 id="add-model-title" className="text-h3 font-bold text-ink">
              {existingSubmission?.status === 'changes_requested'
                ? 'Revise Model Submission'
                : 'Add Model'}
            </h2>
            <div className="mt-2">
              <StepIndicator />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-control p-1.5 text-ink-muted transition-colors hover:bg-[var(--canvas)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form
            id="onboarding-form"
            onSubmit={handleSubmit((data) => {
              if (step === 'review') {
                handleSubmitForReview(data);
              }
            })}
            noValidate
          >
            {step === 'identity' && <SectionA />}
            {step === 'tests' && <SectionB />}
            {step === 'config' && <SectionC />}
            {step === 'review' && <SectionD formData={watch() as FormData} />}
          </form>
        </div>

        {/* Sticky footer */}
        <div
          className="sticky bottom-0 flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex gap-2">
            {step !== 'identity' && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const order: StepId[] = ['identity', 'tests', 'config', 'review'];
                  const idx = order.indexOf(step);
                  if (idx > 0) setStep(order[idx - 1]);
                }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step === 'review' ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  loading={saving}
                  onClick={handleSubmit((data) => handleSaveDraft(data))}
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  form="onboarding-form"
                  variant="primary"
                  loading={submitting}
                  disabled={!confirmed}
                >
                  Submit for MRM Review
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit(async (data) => {
                    const order: StepId[] = ['identity', 'tests', 'config', 'review'];
                    const idx = order.indexOf(step);
                    const next = order[idx + 1];
                    if (next) await goToStep(next, data);
                  })}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
