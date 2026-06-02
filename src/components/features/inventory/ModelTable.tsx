'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { TierBadge } from '@/components/ui/TierBadge';
import { useRole } from '@/components/features/shell/RoleProvider';
import type { Model } from '@/types';

interface ModelTableProps {
  models: Model[];
}

function RiskChip({ risk }: { risk: 'High' | 'Medium' | 'Low' }) {
  const color =
    risk === 'High'
      ? 'var(--status-fail)'
      : risk === 'Medium'
        ? 'var(--status-warn)'
        : 'var(--status-pass)';
  return (
    <span className="text-caption font-semibold" style={{ color }} aria-label={`${risk} risk`}>
      {risk}
    </span>
  );
}

export function ModelTable({ models }: ModelTableProps) {
  const { role } = useRole();
  const router = useRouter();
  const isMRM = role === 'mrm';

  const columns: ColumnDef<Model>[] = [
    {
      key: 'id',
      header: 'Model ID',
      accessor: (m) => <span className="font-mono text-small font-medium text-ink">{m.id}</span>,
      sortValue: (m) => m.id,
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (m) => (
        <Link
          href={`/inventory/${m.id}`}
          className="rounded text-small font-medium text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ink)]"
          onClick={(e) => e.stopPropagation()}
        >
          {m.name}
        </Link>
      ),
      sortValue: (m) => m.name,
    },
    {
      key: 'cat',
      header: 'Category',
      accessor: (m) => <span className="text-small text-ink-secondary">{m.cat}</span>,
      sortValue: (m) => m.cat,
    },
    {
      key: 'tier',
      header: 'Tier',
      accessor: (m) => <TierBadge tier={m.tier} />,
      sortValue: (m) => m.tier,
    },
    {
      key: 'risk',
      header: 'Risk',
      accessor: (m) => <RiskChip risk={m.risk} />,
      sortValue: (m) => m.risk,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (m) => (
        <span className="whitespace-nowrap text-small text-ink-secondary">{m.status}</span>
      ),
      sortValue: (m) => m.status,
    },
    {
      key: 'valStatus',
      header: 'Validation',
      accessor: (m) => <span className="text-small text-ink-secondary">{m.valStatus}</span>,
      sortValue: (m) => m.valStatus,
    },
    {
      key: 'nextVal',
      header: 'Next Validation',
      accessor: (m) => (
        <span className="text-small tabular-nums text-ink-secondary">{m.nextVal || '—'}</span>
      ),
      sortValue: (m) => m.nextVal,
    },
    {
      key: 'openFx',
      header: 'Open Findings',
      numeric: true,
      accessor: (m) => (
        <span
          className="text-small font-medium tabular-nums"
          style={{ color: m.openFx > 0 ? 'var(--status-fail)' : 'var(--ink-muted)' }}
        >
          {m.openFx > 0 ? (
            <span className="flex items-center justify-end gap-1">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {m.openFx}
            </span>
          ) : (
            '0'
          )}
        </span>
      ),
      sortValue: (m) => m.openFx,
    },
    {
      key: 'owner',
      header: 'Owner',
      accessor: (m) => <span className="text-small text-ink-secondary">{m.owner}</span>,
      sortValue: (m) => m.owner,
      hideWhen: !isMRM,
    },
    {
      key: 'actions',
      header: '',
      accessor: (m) => (
        <Link
          href={`/inventory/${m.id}`}
          className="inline-flex items-center gap-1 rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open ${m.name} detail`}
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      data={models}
      columns={columns}
      rowKey={(m) => m.id}
      onRowClick={(m) => router.push(`/inventory/${m.id}`)}
      emptyState={
        <span>
          No models match the current filters.{' '}
          <button className="text-ink underline">Clear filters</button>
        </span>
      }
      caption="Model inventory"
    />
  );
}
