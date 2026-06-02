import type { TestHistoryEntry, TestType } from '@/types';

export interface ModelTestHistory {
  modelId: string;
  testType: TestType;
  history: TestHistoryEntry[];
}

export const TEST_HISTORY: ModelTestHistory[] = [
  // CECL-2024-001 — CRE PD
  {
    modelId: 'CECL-2024-001',
    testType: 'source-to-model',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-10' },
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-10' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-10' },
    ],
  },
  {
    modelId: 'CECL-2024-001',
    testType: 'psi',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-15' },
      { period: 'Q3 2025', verdict: 'warn', runDate: '2025-10-15' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-15' },
    ],
  },
  {
    modelId: 'CECL-2024-001',
    testType: 'backtesting',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-20' },
      { period: 'Q3 2025', verdict: 'warn', runDate: '2025-10-20' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-20' },
    ],
  },
  {
    modelId: 'CECL-2024-001',
    testType: 'stress',
    history: [
      { period: 'H1 2025', verdict: 'pass', runDate: '2025-07-01' },
      { period: 'H2 2025', verdict: 'pass', runDate: '2026-01-01' },
    ],
  },

  // AML-2024-001 — Transaction Monitoring
  {
    modelId: 'AML-2024-001',
    testType: 'source-to-model',
    history: [
      { period: 'Oct 2025', verdict: 'pass', runDate: '2025-11-05' },
      { period: 'Nov 2025', verdict: 'warn', runDate: '2025-12-05' },
      { period: 'Dec 2025', verdict: 'fail', runDate: '2026-01-05' },
      { period: 'Jan 2026', verdict: 'fail', runDate: '2026-02-05' },
      { period: 'Feb 2026', verdict: 'fail', runDate: '2026-03-05' },
    ],
  },
  {
    modelId: 'AML-2024-001',
    testType: 'backtesting',
    history: [
      { period: 'Oct 2025', verdict: 'pass', runDate: '2025-11-10' },
      { period: 'Nov 2025', verdict: 'pass', runDate: '2025-12-10' },
      { period: 'Dec 2025', verdict: 'pass', runDate: '2026-01-10' },
      { period: 'Jan 2026', verdict: 'pass', runDate: '2026-02-10' },
      { period: 'Feb 2026', verdict: 'pass', runDate: '2026-03-10' },
    ],
  },
  {
    modelId: 'AML-2024-001',
    testType: 'benchmarking',
    history: [
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-15' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-15' },
    ],
  },
  {
    modelId: 'AML-2024-001',
    testType: 'override',
    history: [
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-20' },
      { period: 'Q4 2025', verdict: 'pass', runDate: '2026-01-20' },
    ],
  },

  // ALM-2024-001 — NII Sensitivity
  {
    modelId: 'ALM-2024-001',
    testType: 'backtesting',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-15' },
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-15' },
      { period: 'Q4 2025', verdict: 'pass', runDate: '2026-01-15' },
    ],
  },
  {
    modelId: 'ALM-2024-001',
    testType: 'sensitivity',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-20' },
      { period: 'Q3 2025', verdict: 'warn', runDate: '2025-10-20' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-20' },
    ],
  },
  {
    modelId: 'ALM-2024-001',
    testType: 'stress',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-25' },
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-25' },
      { period: 'Q4 2025', verdict: 'warn', runDate: '2026-01-25' },
    ],
  },
  {
    modelId: 'ALM-2024-001',
    testType: 'source-to-model',
    history: [
      { period: 'Q2 2025', verdict: 'pass', runDate: '2025-07-10' },
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-10' },
      { period: 'Q4 2025', verdict: 'pass', runDate: '2026-01-10' },
    ],
  },

  // FRAUD-2024-001 — Card Fraud
  {
    modelId: 'FRAUD-2024-001',
    testType: 'backtesting',
    history: [
      { period: 'Dec 2025', verdict: 'pass', runDate: '2026-01-05' },
      { period: 'Jan 2026', verdict: 'pass', runDate: '2026-02-05' },
      { period: 'Feb 2026', verdict: 'pass', runDate: '2026-03-05' },
    ],
  },
  {
    modelId: 'FRAUD-2024-001',
    testType: 'psi',
    history: [
      { period: 'Dec 2025', verdict: 'pass', runDate: '2026-01-10' },
      { period: 'Jan 2026', verdict: 'warn', runDate: '2026-02-10' },
      { period: 'Feb 2026', verdict: 'warn', runDate: '2026-03-10' },
    ],
  },
  {
    modelId: 'FRAUD-2024-001',
    testType: 'csi',
    history: [
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-15' },
      { period: 'Q4 2025', verdict: 'pass', runDate: '2026-01-15' },
    ],
  },
  {
    modelId: 'FRAUD-2024-001',
    testType: 'benchmarking',
    history: [
      { period: 'Q3 2025', verdict: 'pass', runDate: '2025-10-20' },
      { period: 'Q4 2025', verdict: 'pass', runDate: '2026-01-20' },
    ],
  },
];
