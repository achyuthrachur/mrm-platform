import { buildCSV, downloadCSV } from './export-csv';
import { buildXLSX, downloadXLSX } from './export-xlsx';
import { buildPDF, downloadPDF } from './export-pdf';
import type { TestResult } from '@/types';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export async function exportResult(
  result: TestResult,
  modelName: string,
  format: ExportFormat
): Promise<void> {
  const slug = `${result.modelId}-${result.testType}-${result.period.replace(/\s/g, '-')}`;

  if (format === 'csv') {
    const csv = buildCSV(result, modelName);
    downloadCSV(csv, `${slug}.csv`);
    return;
  }

  if (format === 'xlsx') {
    const wb = buildXLSX(result, modelName);
    downloadXLSX(wb, `${slug}.xlsx`);
    return;
  }

  if (format === 'pdf') {
    const doc = buildPDF(result, modelName);
    downloadPDF(doc, `${slug}.pdf`);
    return;
  }
}

export { buildCSV };
