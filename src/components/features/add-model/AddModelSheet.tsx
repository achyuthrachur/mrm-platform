'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useModels } from '@/lib/store/models-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { useFrequencyApprovals } from '@/lib/store/frequency-approvals-context';
import { MODEL_TEST_MENU } from '@/lib/data/monitoring-calendar';
import type { Model, TestType, SelectedTest } from '@/types';
import { getToday } from '@/lib/clock';

const DEFAULT_FREQ: Record<string, string> = {
  'source-to-model': 'Monthly',
  backtesting: 'Quarterly',
  benchmarking: 'Quarterly',
  sensitivity: 'Quarterly',
  stress: 'Semi-annual',
  override: 'Quarterly',
  psi: 'Monthly',
  csi: 'Quarterly',
};

const SR_REF: Record<string, string> = {
  'source-to-model': 'SR 11-7 §I.D',
  backtesting: 'SR 11-7 §II.B',
  benchmarking: 'SR 11-7 §I.A',
  sensitivity: 'SR 11-7 §II.C',
  stress: 'SR 11-7 §I.E',
  override: 'SR 11-7 §II.C',
  psi: 'SR 26-2 §II.D',
  csi: 'SR 26-2 §II.D',
};

const FREQ_OPTIONS = ['Monthly', 'Quarterly', 'Semi-annual', 'Annual'];
const CATEGORIES = Object.keys(MODEL_TEST_MENU);

const schema = z.object({
  name: z.string().min(3, 'Model name required'),
  cat: z.string().min(1, 'Category required'),
  sub: z.string().min(1, 'Sub-category required'),
  tier: z.enum(['1', '2', '3']),
  framework: z.string().min(1, 'Framework required'),
  method: z.string().min(3, 'Method required'),
  desc: z.string().min(10, 'Description required'),
  monFreq: z.string().min(1, 'Frequency required'),
});

type FormData = z.infer<typeof schema>;

interface AddModelSheetProps {
  onClose: () => void;
  onSaved?: (modelId: string) => void;
}

export function AddModelSheet({ onClose, onSaved }: AddModelSheetProps) {
  const { updateModel } = useModels();
  const { currentUser } = useRole();
  const { submitRequest } = useFrequencyApprovals();
  const [selectedTests, setSelectedTests] = useState<Record<string, string>>({});
  const today = getToday();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tier: '2',
      cat: 'CECL',
      framework: 'SR 11-7',
      monFreq: 'Quarterly',
    },
  });

  const watchCat = watch('cat');
  const availableTests: TestType[] = (MODEL_TEST_MENU[watchCat] as TestType[]) ?? [];

  function toggleTest(testType: string) {
    setSelectedTests((prev) => {
      if (testType in prev) {
        const next = { ...prev };
        delete next[testType];
        return next;
      }
      return { ...prev, [testType]: DEFAULT_FREQ[testType] ?? 'Quarterly' };
    });
  }

  function setFreq(testType: string, freq: string) {
    setSelectedTests((prev) => ({ ...prev, [testType]: freq }));
  }

  async function onSubmit(data: FormData) {
    const modelId = `${data.cat.replace(/[^A-Z0-9]/gi, '')}-${today.slice(0, 4)}-${String(Date.now()).slice(-3)}`;

    const builtTests: SelectedTest[] = Object.entries(selectedTests).map(([testType, freq]) => ({
      testType: testType as TestType,
      frequency: freq,
      srRef: SR_REF[testType] ?? 'SR 11-7',
    }));

    const model: Model = {
      id: modelId,
      name: data.name,
      cat: data.cat,
      sub: data.sub,
      tier: Number(data.tier) as 1 | 2 | 3,
      owner: currentUser,
      ownerTitle: 'Model Owner',
      status: 'Active — Monitoring',
      risk: data.tier === '1' ? 'High' : data.tier === '2' ? 'Medium' : 'Low',
      valStatus: 'Pending Initial Validation',
      lastVal: '',
      nextVal: '',
      framework: data.framework,
      method: data.method,
      sources: [],
      openFx: 0,
      totalFx: 0,
      desc: data.desc,
      limits: '',
      dataLimits: '',
      monFreq: data.monFreq,
      approvedBy: '',
      approvalDate: '',
      userDefined: true,
      selectedTests: builtTests,
    };

    await updateModel(model);

    // Submit frequency-approval requests for any non-default frequencies
    const freqRequests: Promise<unknown>[] = [];
    for (const { testType, frequency } of builtTests) {
      const defaultFreq = DEFAULT_FREQ[testType] ?? 'Quarterly';
      if (frequency !== defaultFreq) {
        freqRequests.push(
          submitRequest({
            modelId: model.id,
            testType,
            requestedFrequency: frequency,
            defaultFrequency: defaultFreq,
            justification: `Model owner requested ${frequency} monitoring frequency for ${testType}.`,
            requestedBy: currentUser,
          })
        );
      }
    }
    await Promise.all(freqRequests);

    toast.success(`Model ${model.id} added to inventory`);
    onSaved?.(model.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-model-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className="relative h-full w-full max-w-xl overflow-y-auto shadow-card-lg"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface)' }}
        >
          <h2 id="add-model-title" className="text-h3 font-semibold text-ink">
            Add Model
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-ink-muted transition-colors hover:bg-[var(--canvas)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-5" noValidate>
          <div className="space-y-4">
            <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Model Identity
            </p>

            <div>
              <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-name">
                Model Name
              </label>
              <input
                id="am-name"
                {...register('name')}
                className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
              {errors.name && (
                <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-cat">
                  Category
                </label>
                <select
                  id="am-cat"
                  {...register('cat')}
                  className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
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
                <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-sub">
                  Sub-category
                </label>
                <input
                  id="am-sub"
                  {...register('sub')}
                  className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-tier">
                  Tier
                </label>
                <select
                  id="am-tier"
                  {...register('tier')}
                  className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <option value="1">Tier 1 — Highest Risk</option>
                  <option value="2">Tier 2 — Significant</option>
                  <option value="3">Tier 3 — Low Risk</option>
                </select>
              </div>
              <div>
                <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-freq">
                  Monitoring Frequency
                </label>
                <select
                  id="am-freq"
                  {...register('monFreq')}
                  className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  {FREQ_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="text-small mb-1.5 block font-medium text-ink"
                htmlFor="am-framework"
              >
                Framework
              </label>
              <input
                id="am-framework"
                {...register('framework')}
                className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
            </div>

            <div>
              <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-method">
                Methodology
              </label>
              <input
                id="am-method"
                {...register('method')}
                className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
            </div>

            <div>
              <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="am-desc">
                Description
              </label>
              <textarea
                id="am-desc"
                {...register('desc')}
                rows={3}
                className="text-small w-full resize-none rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
              {errors.desc && (
                <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                  {errors.desc.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
              Scheduled Tests
            </p>
            <p className="text-caption text-ink-muted">
              Select tests to monitor. Frequencies that differ from the default require MRM
              approval.
            </p>

            {availableTests.length === 0 ? (
              <p className="text-small text-ink-muted">No tests available for this category.</p>
            ) : (
              <div className="space-y-2">
                {availableTests.map((testType) => {
                  const isSelected = testType in selectedTests;
                  const defaultFreq = DEFAULT_FREQ[testType] ?? 'Quarterly';
                  const currentFreq = selectedTests[testType] ?? defaultFreq;
                  const isNonDefault = isSelected && currentFreq !== defaultFreq;

                  return (
                    <div
                      key={testType}
                      className="flex items-center gap-3 rounded-md border p-3 transition-colors"
                      style={{
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border-hairline)',
                        backgroundColor: isSelected ? 'var(--canvas)' : 'var(--surface)',
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`test-${testType}`}
                        checked={isSelected}
                        onChange={() => toggleTest(testType)}
                        className="rounded"
                        aria-label={`Select ${testType} test`}
                      />
                      <label
                        htmlFor={`test-${testType}`}
                        className="text-small flex-1 cursor-pointer font-medium text-ink"
                      >
                        {testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        <span className="ml-2 font-mono text-caption text-ink-muted">
                          {SR_REF[testType]}
                        </span>
                      </label>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <select
                            value={currentFreq}
                            onChange={(e) => setFreq(testType, e.target.value)}
                            className="rounded border bg-surface-sunken px-2 py-1 text-caption text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                            style={{ borderColor: 'var(--border-hairline)' }}
                            aria-label={`Frequency for ${testType}`}
                          >
                            {FREQ_OPTIONS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                          {isNonDefault && (
                            <span
                              className="rounded px-1.5 py-0.5 text-caption"
                              style={{
                                backgroundColor: 'var(--status-warn-bg)',
                                color: 'var(--status-warn)',
                              }}
                              title="Non-default frequency requires MRM approval"
                            >
                              needs approval
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="flex justify-end gap-3 border-t pt-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Model
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
