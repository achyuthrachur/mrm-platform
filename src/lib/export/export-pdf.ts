import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TestResult } from '@/types';

const INDIGO = '#011E41';
const AMBER = '#F5A800';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F4F5F8';
const TEXT_DARK = '#011E41';
const TEXT_MID = '#4F4F4F';

function addCroweHeader(doc: jsPDF): void {
  // Indigo header bar
  doc.setFillColor(INDIGO);
  doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');

  // White "Crowe" wordmark placeholder (official SVG not embeddable in jsPDF without conversion)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Crowe', 10, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('MRM Platform™', 35, 15);

  // Right side: "CONFIDENTIAL / DEMO"
  doc.setFontSize(8);
  doc.setTextColor(AMBER);
  const pageW = doc.internal.pageSize.width;
  doc.text('NOT FOR DISTRIBUTION — DEMO', pageW - 10, 15, { align: 'right' });
}

function addVerdictSection(doc: jsPDF, result: TestResult, y: number): number {
  const verdictColor =
    result.verdict === 'pass' ? '#05AB8C' : result.verdict === 'warn' ? '#D7761D' : '#E5376B';
  const lightColor =
    result.trafficLight === 'Green'
      ? '#05AB8C'
      : result.trafficLight === 'Yellow'
        ? '#D7761D'
        : '#E5376B';

  doc.setFillColor(LIGHT_GRAY);
  doc.roundedRect(10, y, doc.internal.pageSize.width - 20, 22, 2, 2, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(verdictColor);
  doc.text(result.verdict.toUpperCase(), 16, y + 9);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightColor);
  doc.text(`● ${result.trafficLight}`, 50, y + 9);

  doc.setTextColor(TEXT_MID);
  doc.setFontSize(9);
  doc.text(
    `${result.computed ? 'Computed' : 'Illustrative'}  ·  Confidence: ${result.dataConf}  ·  Period: ${result.period}  ·  Run: ${result.runDate}`,
    16,
    y + 17
  );

  return y + 28;
}

export function buildPDF(result: TestResult, modelName: string): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.width;
  let y = 0;

  addCroweHeader(doc);
  y = 30;

  // Model + test identity
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text(modelName, 10, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_MID);
  doc.text(`${result.modelId}  ·  ${result.testType.toUpperCase().replace(/-/g, ' ')}`, 10, y);
  y += 8;

  // Verdict section
  y = addVerdictSection(doc, result, y);

  // Metrics table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Metrics', 10, y);
  y += 4;

  const metricsBody = result.metrics
    .filter(
      (m) =>
        m.status !== 'info' ||
        m.label.includes('Count') ||
        m.label.includes('Rate') ||
        m.label.includes('Sample')
    )
    .map((m) => [m.label, m.value, m.threshold === '—' ? '' : m.threshold, m.status.toUpperCase()]);

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Threshold', 'Status']],
    body: metricsBody,
    headStyles: { fillColor: INDIGO, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 50 },
      3: { cellWidth: 22 },
    },
    margin: { left: 10, right: 10 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Formula trace (computed only, abbreviated)
  if (result.computed && result.formula && y < 230) {
    const f = result.formula;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text('Formula Trace', 10, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_MID);
    doc.text(`${f.name}`, 10, y);
    y += 4;
    const eqLines = doc.splitTextToSize(`Formula: ${f.equation}`, pageW - 20);
    doc.text(eqLines, 10, y);
    y += eqLines.length * 4 + 2;
    doc.text(`Result: ${f.result}  ·  Ref: ${f.reference}`, 10, y);
    y += 8;
  }

  // Findings
  if (result.findings.length > 0 && y < 240) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text('Findings', 10, y);
    y += 5;
    for (const finding of result.findings) {
      if (y > 260) break;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_MID);
      const lines = doc.splitTextToSize(`• ${finding}`, pageW - 20);
      doc.text(lines, 10, y);
      y += lines.length * 4 + 2;
    }
    y += 4;
  }

  // Recommendation
  if (result.recommendation && y < 255) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text('Recommendation', 10, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_MID);
    const recLines = doc.splitTextToSize(result.recommendation, pageW - 20);
    doc.text(recLines, 10, y);
    y += recLines.length * 4 + 6;
  }

  // Data sources
  if (y < 265) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(TEXT_MID);
    doc.text(`Data sources: ${result.dataSources.join(', ')}`, 10, y);
    y += 5;
  }

  // Footer
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(INDIGO);
  doc.rect(0, pageH - 10, pageW, 10, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(WHITE);
  doc.text(
    'Demo environment — not for distribution  ·  © Crowe LLP  ·  Generated by MRM Platform™',
    10,
    pageH - 4
  );

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
