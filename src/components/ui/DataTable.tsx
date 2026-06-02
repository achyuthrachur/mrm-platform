'use client';

import { useState, useMemo } from 'react';
import {
  DataTableShell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from './DataTableShell';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  numeric?: boolean;
  hideWhen?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  caption?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  emptyState,
  caption,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  const visibleColumns = columns.filter((c) => !c.hideWhen);

  return (
    <DataTableShell className={className} caption={caption}>
      <DataTableHead>
        <tr>
          {visibleColumns.map((col) => (
            <DataTableHeaderCell key={col.key} numeric={col.numeric}>
              {col.sortValue ? (
                <button
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    'inline-flex items-center gap-1 transition-colors hover:text-ink',
                    sortKey === col.key && 'text-ink'
                  )}
                  aria-label={`Sort by ${col.header}`}
                >
                  {col.header}
                  {sortKey === col.key && sortDir === 'asc' ? (
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  ) : sortKey === col.key && sortDir === 'desc' ? (
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <ChevronsUpDown className="h-3 w-3 opacity-30" aria-hidden="true" />
                  )}
                </button>
              ) : (
                col.header
              )}
            </DataTableHeaderCell>
          ))}
        </tr>
      </DataTableHead>
      <DataTableBody>
        {sorted.length === 0 ? (
          <tr>
            <td
              colSpan={visibleColumns.length}
              className="px-4 py-12 text-center text-small text-ink-muted"
            >
              {emptyState ?? 'No results found.'}
            </td>
          </tr>
        ) : (
          sorted.map((row) => (
            <DataTableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {visibleColumns.map((col) => (
                <DataTableCell key={col.key} numeric={col.numeric} className={col.className}>
                  {col.accessor(row)}
                </DataTableCell>
              ))}
            </DataTableRow>
          ))
        )}
      </DataTableBody>
    </DataTableShell>
  );
}
