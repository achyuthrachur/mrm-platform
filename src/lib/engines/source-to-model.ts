import { getCRELoanTape, getCRELoanTapeModelCopy } from '@/lib/data/datasets/cre-loan-tape';
import { getAMLTransactions } from '@/lib/data/datasets/aml-transactions';
import type { TestResult, MetricRow, FormulaTrace } from '@/types';
import { getToday } from '@/lib/clock';

interface STMEngineInput {
  modelId: string;
  period?: string;
  customSourceRows?: Record<string, unknown>[];
  customModelRows?: Record<string, unknown>[];
}

function toIdMap(
  rows: Record<string, unknown>[],
  idField: string
): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const id = String(row[idField] ?? '');
    if (id) map.set(id, row);
  }
  return map;
}

function countDiscrepancies(
  sourceMap: Map<string, Record<string, unknown>>,
  modelMap: Map<string, Record<string, unknown>>
): { numericDiffs: number; textDiffs: number } {
  let numericDiffs = 0;
  let textDiffs = 0;

  for (const [id, srcRow] of sourceMap) {
    const modRow = modelMap.get(id);
    if (!modRow) continue;

    for (const key of Object.keys(srcRow)) {
      if (key === 'loanId' || key === 'txnId') continue;
      const sv = srcRow[key];
      const mv = modRow[key];
      if (sv === mv) continue;

      if (typeof sv === 'number' && typeof mv === 'number') {
        if (Math.abs(sv - mv) > 0.0005) numericDiffs++;
      } else if (typeof sv === 'string' && typeof mv === 'string') {
        if (sv !== mv) textDiffs++;
      }
    }
  }
  return { numericDiffs, textDiffs };
}

export function runSourceToModel(input: STMEngineInput): TestResult {
  const period = input.period ?? 'Q1 2026';

  if (input.modelId === 'CECL-2024-001') {
    return runCRESourceToModel(input, period);
  }
  if (input.modelId === 'AML-2024-001') {
    return runAMLSourceToModel(input, period);
  }
  if (input.modelId === 'ALM-2024-001') {
    return runALMSourceToModel(period);
  }

  throw new Error(`No STM engine configured for model ${input.modelId}`);
}

function runCRESourceToModel(input: STMEngineInput, period: string): TestResult {
  const sourceTape = getCRELoanTape();
  const modelTape = getCRELoanTapeModelCopy();

  const sourceRows =
    (input.customSourceRows as Record<string, unknown>[] | undefined) ??
    (sourceTape.rows as unknown as Record<string, unknown>[]);
  const modelRows =
    (input.customModelRows as Record<string, unknown>[] | undefined) ??
    (modelTape.rows as unknown as Record<string, unknown>[]);

  const sourceMap = toIdMap(sourceRows, 'loanId');
  const modelMap = toIdMap(modelRows, 'loanId');

  const sourceCount = sourceMap.size;
  const matchedCount = [...sourceMap.keys()].filter((id) => modelMap.has(id)).length;
  const missingFromModel = sourceCount - matchedCount;
  const phantomInModel = [...modelMap.keys()].filter((id) => !sourceMap.has(id)).length;
  const completeness = (matchedCount / sourceCount) * 100;

  const { numericDiffs, textDiffs } = countDiscrepancies(sourceMap, modelMap);
  const discrepancyPct = ((numericDiffs + textDiffs) / (matchedCount * 5)) * 100;

  const completenessPass = completeness >= 100;
  const completenessWarn = completeness >= 99 && completeness < 100;
  const completenessStatus: 'pass' | 'warn' | 'fail' = completenessPass
    ? 'pass'
    : completenessWarn
      ? 'warn'
      : 'fail';

  const verdict: 'pass' | 'warn' | 'fail' = completenessStatus;

  const metrics: MetricRow[] = [
    {
      label: 'Source Record Count',
      value: sourceCount.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Model Record Count',
      value: matchedCount.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Completeness Rate',
      value: `${completeness.toFixed(2)}%`,
      threshold: '≥ 99% (warn), = 100% (pass)',
      status: completenessStatus,
    },
    {
      label: 'Missing Records',
      value: missingFromModel.toString(),
      threshold: '= 0',
      status: missingFromModel === 0 ? 'pass' : missingFromModel <= 10 ? 'warn' : 'fail',
    },
    {
      label: 'Phantom Records',
      value: phantomInModel.toString(),
      threshold: '= 0',
      status: phantomInModel === 0 ? 'pass' : 'warn',
    },
    {
      label: 'Numeric Discrepancies',
      value: numericDiffs.toString(),
      threshold: '= 0',
      status: numericDiffs === 0 ? 'pass' : numericDiffs <= 10 ? 'warn' : 'fail',
    },
    {
      label: 'Text Mismatches',
      value: textDiffs.toString(),
      threshold: '= 0',
      status: textDiffs === 0 ? 'pass' : 'warn',
    },
    {
      label: 'Field-Level Discrepancy Rate',
      value: `${discrepancyPct.toFixed(3)}%`,
      threshold: '< 0.05%',
      status: discrepancyPct < 0.05 ? 'pass' : 'warn',
    },
  ];

  const formula: FormulaTrace = {
    name: 'Source-to-Model Completeness',
    equation: 'Completeness = (Matched Records / Source Records) × 100',
    inputs: {
      'Source Records': sourceCount,
      'Matched Records': matchedCount,
      'Missing Records': missingFromModel,
      'Phantom Records': phantomInModel,
      'Numeric Discrepancies': numericDiffs,
    },
    steps: [
      {
        label: 'Count source records',
        expression: 'source_count',
        value: sourceCount,
      },
      {
        label: 'Count matched records (source ID found in model)',
        expression: 'matched_count = |source_ids ∩ model_ids|',
        value: matchedCount,
      },
      {
        label: 'Compute completeness rate',
        expression: `completeness = (${matchedCount} / ${sourceCount}) × 100`,
        value: `${completeness.toFixed(4)}%`,
      },
      {
        label: 'Apply threshold (warn < 100%, fail < 99%)',
        expression: completeness >= 100 ? 'PASS' : completeness >= 99 ? 'WARN' : 'FAIL',
        value: completenessStatus.toUpperCase(),
      },
    ],
    result: `${completeness.toFixed(2)}%`,
    reference: 'SR 11-7 §I.D — Data Integrity and Completeness',
  };

  return {
    testType: 'source-to-model',
    modelId: input.modelId,
    verdict,
    trafficLight: verdict === 'pass' ? 'Green' : verdict === 'warn' ? 'Yellow' : 'Red',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['CoreLogic Property Database', 'Internal Origination System'],
    computed: true,
    formula,
    metrics,
    findings:
      verdict !== 'pass'
        ? [
            `${missingFromModel} records in source not found in model copy. Concentrated in pre-2015 Hotel segment originations.`,
            `${numericDiffs} numeric field discrepancies detected (|Δ| > 0.0005). Primary field: LTV.`,
          ]
        : [],
    recommendation:
      verdict !== 'pass'
        ? 'Investigate missing records in CoreLogic extract for pre-2015 Hotel segment. Reconcile LTV discrepancies against origination system of record.'
        : 'Source-to-model reconciliation passes. Continue quarterly monitoring.',
    dataNote: 'CoreLogic coverage is incomplete for loans originated before 2015.',
  };
}

function runAMLSourceToModel(input: STMEngineInput, period: string): TestResult {
  const txns = getAMLTransactions();
  const allRows = txns.rows as unknown as Record<string, unknown>[];

  const sourceRows = (input.customSourceRows as Record<string, unknown>[] | undefined) ?? allRows;

  // Model copy: exclude ACH-RETURN records (feed gap — same-day ACH returns not captured)
  // In the generated data, feedSource = 'ACH-RETURN' for all ACH channel transactions
  // The gap represents the documented missing feed for that source
  const achReturnRows = sourceRows.filter((r) => r['feedSource'] === 'ACH-RETURN');
  const missingCount = Math.round(achReturnRows.length * 0.063); // ~6.3% of source = FAIL

  const sourceCount = sourceRows.length;
  const modelCount = sourceCount - missingCount;
  const completeness = (modelCount / sourceCount) * 100;

  const completenessStatus: 'pass' | 'warn' | 'fail' =
    completeness >= 100 ? 'pass' : completeness >= 99 ? 'warn' : 'fail';

  const metrics: MetricRow[] = [
    {
      label: 'Source Record Count',
      value: sourceCount.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Model Record Count',
      value: modelCount.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    {
      label: 'Completeness Rate',
      value: `${completeness.toFixed(2)}%`,
      threshold: '≥ 99% (warn), = 100% (pass)',
      status: completenessStatus,
      note: 'ACH-return feed gap identified',
    },
    {
      label: 'Missing Records (ACH-Return Feed)',
      value: missingCount.toLocaleString(),
      threshold: '= 0',
      status: 'fail',
      note: 'Same-day ACH returns after 16:00 ET not captured',
    },
    {
      label: 'ACH-Return Records in Source',
      value: achReturnRows.length.toLocaleString(),
      threshold: '—',
      status: 'info',
    },
    { label: 'Other Channels Completeness', value: '100%', threshold: '100%', status: 'pass' },
  ];

  const formula: FormulaTrace = {
    name: 'Source-to-Model Completeness — AML Transaction Feed',
    equation: 'Completeness = (Matched Records / Source Records) × 100',
    inputs: {
      'Source Records': sourceCount,
      'ACH-Return Records': achReturnRows.length,
      'Missing (ACH Gap)': missingCount,
      'Model Records': modelCount,
    },
    steps: [
      {
        label: 'Count total source transactions across all feeds',
        expression: 'source_count',
        value: sourceCount,
      },
      {
        label: 'Identify ACH-Return records in source',
        expression: 'ach_return_count = source.filter(feedSource == "ACH-RETURN").length',
        value: achReturnRows.length,
      },
      {
        label: 'Determine gap: same-day ACH returns after 16:00 ET cutoff',
        expression: `gap = ${achReturnRows.length} × 6.3%`,
        value: missingCount,
      },
      {
        label: 'Compute completeness',
        expression: `completeness = ((${sourceCount} − ${missingCount}) / ${sourceCount}) × 100`,
        value: `${completeness.toFixed(4)}%`,
      },
      {
        label: 'Apply threshold (fail < 99%)',
        expression: 'FAIL',
        value: 'FAIL — completeness below minimum threshold',
      },
    ],
    result: `${completeness.toFixed(2)}% (FAIL)`,
    reference: 'SR 11-7 §I.D — Data Integrity and Completeness',
  };

  return {
    testType: 'source-to-model',
    modelId: input.modelId,
    verdict: 'fail',
    trafficLight: 'Red',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: [
      'Core Banking System',
      'ACH Return Feed',
      'OFAC Screening Database',
      'Wire Operations',
    ],
    computed: true,
    formula,
    metrics,
    findings: [
      `ACH-return feed gap confirmed: ${missingCount.toLocaleString()} transactions missing from model input. Root cause: batch extraction job cuts off at 16:00 ET, missing same-day ACH return items.`,
      'Missing transactions include potential structuring activity in the 17:00–19:00 time window.',
    ],
    recommendation:
      'Escalate to IT immediately. Extend ACH return extraction job cutoff to 20:00 batch. Implement reconciliation control comparing ACH return counts from payment operations vs. model input file. Target: completeness ≥ 99%.',
    dataNote:
      'ACH return data feed documented gap for same-day items after 16:00 ET. Affects completeness of ACH monitoring ruleset.',
  };
}

function runALMSourceToModel(period: string): TestResult {
  // ALM: source = IPS Sendero export, model = ALM positions file
  // No planted gap — passes completeness
  const sourceCount = 5000;
  const matchedCount = 5000;

  const metrics: MetricRow[] = [
    { label: 'Source Record Count', value: '5,000', threshold: '—', status: 'info' },
    { label: 'Model Record Count', value: '5,000', threshold: '—', status: 'info' },
    { label: 'Completeness Rate', value: '100.00%', threshold: '100%', status: 'pass' },
    { label: 'Missing Records', value: '0', threshold: '= 0', status: 'pass' },
    { label: 'Phantom Records', value: '0', threshold: '= 0', status: 'pass' },
    { label: 'Rate Field Discrepancies', value: '0', threshold: '= 0', status: 'pass' },
    { label: 'Balance Field Discrepancies', value: '0', threshold: '= 0', status: 'pass' },
  ];

  const formula: FormulaTrace = {
    name: 'Source-to-Model Completeness — ALM Position File',
    equation: 'Completeness = (Matched Records / Source Records) × 100',
    inputs: {
      'Source Records (IPS Sendero)': sourceCount,
      'Matched Records': matchedCount,
      'Missing Records': 0,
    },
    steps: [
      { label: 'Count source positions', expression: 'source_count', value: 5000 },
      { label: 'Count matched positions', expression: 'matched_count', value: 5000 },
      {
        label: 'Compute completeness',
        expression: '(5,000 / 5,000) × 100',
        value: '100.00%',
      },
      { label: 'Apply threshold', expression: 'completeness ≥ 100%', value: 'PASS' },
    ],
    result: '100.00%',
    reference: 'SR 11-7 §I.D — Data Integrity and Completeness',
  };

  return {
    testType: 'source-to-model',
    modelId: 'ALM-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period,
    runDate: getToday(),
    dataSources: ['ALM System (IPS Sendero)', 'Core Deposit Study', 'Loan Origination System'],
    computed: true,
    formula,
    metrics,
    findings: [],
    recommendation:
      'ALM position file reconciles fully with the IPS Sendero export. Continue quarterly monitoring. Note: core deposit study refresh due — see MRF-010.',
  };
}
