import * as XLSX from 'xlsx';
import type { TestResult } from '@/types';

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '011E41' } },
  alignment: { horizontal: 'left' as const },
};

function styledSheet(ws: XLSX.WorkSheet, headerRow: number, headerCols: number): XLSX.WorkSheet {
  // Apply header styling to first N columns of the header row
  for (let c = 0; c < headerCols; c++) {
    const ref = XLSX.utils.encode_cell({ r: headerRow, c });
    if (!ws[ref]) continue;
    ws[ref].s = HEADER_STYLE;
  }
  return ws;
}

export function buildXLSX(result: TestResult, modelName: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ─────────────────────────────────────────────
  const summaryData = [
    ['Model', modelName],
    ['Model ID', result.modelId],
    ['Test Type', result.testType],
    ['Period', result.period],
    ['Run Date', result.runDate],
    ['Verdict', result.verdict.toUpperCase()],
    ['Traffic Light', result.trafficLight],
    ['Data Confidence', result.dataConf],
    ['Computed', result.computed ? 'Yes' : 'No (Illustrative)'],
    ['Data Sources', result.dataSources.join('; ')],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet([['Field', 'Value'], ...summaryData]);
  styledSheet(wsSummary, 0, 2);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Metrics ──────────────────────────────────────────────
  const metricsData = result.metrics.map((m) => [
    m.label,
    m.value,
    m.threshold,
    m.status.toUpperCase(),
    m.note ?? '',
  ]);
  const wsMetrics = XLSX.utils.aoa_to_sheet([
    ['Metric', 'Value', 'Threshold', 'Status', 'Note'],
    ...metricsData,
  ]);
  styledSheet(wsMetrics, 0, 5);
  wsMetrics['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 30 }, { wch: 10 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metrics');

  // ── Sheet 3: Formula Trace (computed only) ────────────────────────
  if (result.computed && result.formula) {
    const f = result.formula;
    const traceData: unknown[][] = [
      ['FORMULA INFORMATION'],
      ['Name', f.name],
      ['Equation', f.equation],
      ['Reference', f.reference],
      [],
      ['INPUTS'],
      ['Input Name', 'Value'],
      ...Object.entries(f.inputs).map(([k, v]) => [k, v]),
      [],
      ['COMPUTATION STEPS'],
      ['Step', 'Label', 'Expression', 'Value'],
      ...f.steps.map((s, i) => [i + 1, s.label, s.expression, String(s.value)]),
      [],
      ['RESULT', f.result],
    ];
    const wsTrace = XLSX.utils.aoa_to_sheet(traceData);
    styledSheet(wsTrace, 0, 1);
    styledSheet(wsTrace, 5, 2);
    styledSheet(wsTrace, 7 + Object.keys(f.inputs).length + 2, 4);
    wsTrace['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsTrace, 'Formula Trace');
  }

  // ── Sheet 4: Findings & Recommendation ───────────────────────────
  if (result.findings.length > 0 || result.recommendation) {
    const narrativeData: unknown[][] = [];
    if (result.findings.length > 0) {
      narrativeData.push(['FINDINGS']);
      for (const f of result.findings) narrativeData.push(['', f]);
      narrativeData.push([]);
    }
    if (result.recommendation) {
      narrativeData.push(['RECOMMENDATION']);
      narrativeData.push(['', result.recommendation]);
    }
    const wsNarrative = XLSX.utils.aoa_to_sheet(narrativeData);
    wsNarrative['!cols'] = [{ wch: 15 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, wsNarrative, 'Findings');
  }

  return wb;
}

export function downloadXLSX(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}
