'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useFindings } from '@/lib/store/findings-context';
import { useModels } from '@/lib/store/models-context';
import { useRole } from '@/components/features/shell/RoleProvider';
import { buildFindingFromRun } from '@/lib/findings/create-from-run';
import type { TestResult } from '@/types';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  sev: z.enum(['Critical', 'High', 'Medium', 'Low']),
  type: z.string().min(1),
  desc: z.string().min(20, 'Description must be at least 20 characters'),
  remediation: z.string().min(10, 'Remediation plan must be at least 10 characters'),
  daysUntilDue: z.number().min(1).max(365),
});

type FormData = z.infer<typeof schema>;

interface CreateFindingSheetProps {
  runId: string;
  modelId: string;
  result: TestResult;
  onClose: () => void;
  onCreated?: (findingId: string) => void;
}

export function CreateFindingSheet({
  runId,
  modelId,
  result,
  onClose,
  onCreated,
}: CreateFindingSheetProps) {
  const { createFinding } = useFindings();
  const { getModel } = useModels();
  const { currentUser } = useRole();
  const model = getModel(modelId);

  const prebuilt = buildFindingFromRun({
    runId,
    modelId,
    modelName: model?.name ?? modelId,
    result,
    createdBy: currentUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: prebuilt.title,
      sev: prebuilt.sev,
      type: prebuilt.type,
      desc: prebuilt.desc,
      remediation: prebuilt.remediation,
      daysUntilDue: 60,
    },
  });

  async function onSubmit(data: FormData) {
    const dueDate = new Date(prebuilt.openDate);
    dueDate.setDate(dueDate.getDate() + data.daysUntilDue);

    const finding = {
      ...prebuilt,
      title: data.title,
      sev: data.sev,
      type: data.type,
      desc: data.desc,
      remediation: data.remediation,
      dueDate: dueDate.toISOString().slice(0, 10),
    };

    await createFinding(finding);
    toast.success(`Finding ${finding.id} created`);
    onCreated?.(finding.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end sm:items-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-finding-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative h-full w-full max-w-lg overflow-y-auto shadow-card-lg sm:h-auto sm:max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div>
            <h2 id="create-finding-title" className="text-h3 font-semibold text-ink">
              Create Finding
            </h2>
            <p className="mt-0.5 text-caption text-ink-muted">
              From run: {runId} · {result.testType} · {result.verdict.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-ink-muted transition-colors hover:bg-[var(--canvas)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5" noValidate>
          {/* Source link info */}
          <div
            className="rounded p-3 text-small"
            style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}
          >
            Pre-filled from {result.testType} run · Verdict: {result.verdict.toUpperCase()}
          </div>

          <div>
            <label className="mb-1.5 block text-small font-medium text-ink" htmlFor="cf-title">
              Title
            </label>
            <input
              id="cf-title"
              {...register('title')}
              className="w-full rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
            {errors.title && (
              <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-small font-medium text-ink" htmlFor="cf-sev">
                Severity
              </label>
              <select
                id="cf-sev"
                {...register('sev')}
                className="w-full rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-small font-medium text-ink" htmlFor="cf-type">
                Type
              </label>
              <select
                id="cf-type"
                {...register('type')}
                className="w-full rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <option value="Data Quality">Data Quality</option>
                <option value="Model Performance">Model Performance</option>
                <option value="Model Stability">Model Stability</option>
                <option value="Model Governance">Model Governance</option>
                <option value="Risk Limit">Risk Limit</option>
                <option value="Model Assumptions">Model Assumptions</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-small font-medium text-ink" htmlFor="cf-desc">
              Description
            </label>
            <textarea
              id="cf-desc"
              {...register('desc')}
              rows={4}
              className="w-full resize-none rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
            {errors.desc && (
              <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                {errors.desc.message}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 block text-small font-medium text-ink"
              htmlFor="cf-remediation"
            >
              Remediation Plan
            </label>
            <textarea
              id="cf-remediation"
              {...register('remediation')}
              rows={3}
              className="w-full resize-none rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
            {errors.remediation && (
              <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                {errors.remediation.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-small font-medium text-ink" htmlFor="cf-due">
              Days Until Due
            </label>
            <input
              id="cf-due"
              type="number"
              {...register('daysUntilDue', { valueAsNumber: true })}
              min={1}
              max={365}
              className="w-32 rounded-md border bg-surface px-3 py-2 text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            />
          </div>

          <div
            className="flex justify-end gap-3 border-t pt-2"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Create Finding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
