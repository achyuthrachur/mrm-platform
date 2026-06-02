'use client';

import { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { exportResult, type ExportFormat } from '@/lib/export';
import type { TestResult } from '@/types';

interface ExportButtonProps {
  result: TestResult;
  modelName: string;
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; icon: React.ElementType }[] = [
  { format: 'csv', label: 'CSV', icon: Table },
  { format: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { format: 'pdf', label: 'PDF Report', icon: FileText },
];

export function ExportButton({ result, modelName }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    setOpen(false);
    try {
      let chartImageDataUrl: string | undefined;

      // For PDF: capture the chart DOM element with html2canvas before building the PDF
      if (format === 'pdf' && result.chartType) {
        const chartEl = document.getElementById(`result-chart-${result.chartType}`);
        if (chartEl) {
          try {
            // Dynamic import keeps html2canvas (~400kB) out of the main bundle
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(chartEl, {
              backgroundColor: '#011E41',
              scale: 1.5,
              useCORS: true,
              logging: false,
            });
            chartImageDataUrl = canvas.toDataURL('image/png');
          } catch {
            // Chart capture failed — continue without it; PDF will still export
          }
        }
      }

      await exportResult(result, modelName, format, chartImageDataUrl);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed — see console');
      console.error(err);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!!exporting}
        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-small font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] disabled:opacity-50"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink)',
        }}
        aria-label="Export result"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {exporting ? `Exporting ${exporting.toUpperCase()}…` : 'Export'}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-card shadow-card-lg"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-hairline)',
              minWidth: 140,
            }}
            role="menu"
            aria-label="Export format options"
          >
            {FORMAT_OPTIONS.map(({ format, label, icon: Icon }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-small text-ink transition-colors hover:bg-[var(--canvas)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                role="menuitem"
              >
                <Icon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
