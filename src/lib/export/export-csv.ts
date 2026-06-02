import type { TestResult } from '@/types';

function esc(v: unknown): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(...cols: unknown[]): string {
  return cols.map(esc).join(',');
}

export function buildCSV(result: TestResult, modelName: string): string {
  const lines: string[] = [];

  // Header metadata
  lines.push(row('Model', modelName, 'ID', result.modelId));
  lines.push(row('Test', result.testType, 'Period', result.period));
  lines.push(row('Verdict', result.verdict, 'Traffic Light', result.trafficLight));
  lines.push(row('Data Confidence', result.dataConf, 'Run Date', result.runDate));
  lines.push(
    row('Computed', result.computed, 'Type', result.computed ? 'Engine Output' : 'Illustrative')
  );
  lines.push('');

  // Metrics
  lines.push(row('Metric', 'Value', 'Threshold', 'Status', 'Note'));
  for (const m of result.metrics) {
    lines.push(row(m.label, m.value, m.threshold, m.status, m.note ?? ''));
  }
  lines.push('');

  // Formula trace (computed only)
  if (result.computed && result.formula) {
    const f = result.formula;
    lines.push(row('FORMULA TRACE'));
    lines.push(row('Name', f.name));
    lines.push(row('Equation', f.equation));
    lines.push(row('Reference', f.reference));
    lines.push('');
    lines.push(row('INPUTS'));
    lines.push(row('Input', 'Value'));
    for (const [k, v] of Object.entries(f.inputs)) {
      lines.push(row(k, v));
    }
    lines.push('');
    lines.push(row('STEPS'));
    lines.push(row('#', 'Label', 'Expression', 'Value'));
    for (let i = 0; i < f.steps.length; i++) {
      const s = f.steps[i];
      lines.push(row(i + 1, s.label, s.expression, s.value));
    }
    lines.push(row('Result', f.result));
    lines.push('');
  }

  // Findings
  if (result.findings.length > 0) {
    lines.push(row('FINDINGS'));
    for (const finding of result.findings) {
      lines.push(row(finding));
    }
    lines.push('');
  }

  // Recommendation
  if (result.recommendation) {
    lines.push(row('RECOMMENDATION'));
    lines.push(row(result.recommendation));
    lines.push('');
  }

  // Data sources
  lines.push(row('DATA SOURCES'));
  for (const src of result.dataSources) {
    lines.push(row(src));
  }

  return lines.join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
