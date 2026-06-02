import type { TestResult } from '@/types';

/**
 * Illustrative test results for non-showcase (model, test) pairs.
 * Each entry has computed: false. No FormulaTrace. No formula panel in UI.
 * The "Illustrative — not computed from live data" badge is shown instead.
 */
export const ILLUSTRATIVE_RESULTS: TestResult[] = [
  // ── CECL-2024-002 (CRE LGD) ────────────────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'CECL-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-18',
    dataSources: ['Workout Department System', 'CoreLogic Property Database'],
    computed: false,
    metrics: [
      { label: 'LGD MAPE', value: '11.2%', threshold: '≤ 15%', status: 'pass' },
      { label: 'Mean LGD Bias', value: '+1.8%', threshold: '|bias| ≤ 5%', status: 'pass' },
      { label: 'Recovery Rate Accuracy', value: '87.3%', threshold: '≥ 80%', status: 'pass' },
      { label: 'Sample Size', value: '142 defaults', threshold: '≥ 30', status: 'info' },
    ],
    findings: [
      'LGD estimates for Hotel segment based on limited sample (n=8). Interpret with caution.',
    ],
    recommendation: 'No immediate action required. Monitor Hotel segment LGD as portfolio matures.',
    dataGaps: ['Pre-2015 Hotel segment workout data incomplete'],
  },
  {
    testType: 'benchmarking',
    modelId: 'CECL-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-20',
    dataSources: ['Peer LGD Study — OFR Consortium'],
    computed: false,
    metrics: [
      {
        label: 'Subject LGD (Office)',
        value: '38.2%',
        threshold: 'Peer median ±15pp',
        status: 'pass',
      },
      { label: 'Peer Median LGD (Office)', value: '35.8%', threshold: '—', status: 'info' },
      {
        label: 'Percentile Rank',
        value: '58th',
        threshold: '25th–75th (acceptable)',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation: 'LGD assumptions in line with peer range. No recalibration required.',
    dataGaps: [],
  },

  // ── CECL-2024-003 (Consumer Mortgage PD) ───────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'CECL-2024-003',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-22',
    dataSources: ['Loan Origination System', 'Credit Bureau Data'],
    computed: false,
    metrics: [
      { label: 'PD MAPE', value: '8.4%', threshold: '≤ 15%', status: 'pass' },
      { label: 'Gini Coefficient', value: '0.72', threshold: '≥ 0.60', status: 'pass' },
      { label: 'Directional Accuracy', value: '78.3%', threshold: '≥ 70%', status: 'pass' },
    ],
    findings: ['Post-2022 vintage performance not yet observable. Monitor as loans season.'],
    recommendation: 'Model performing within acceptable parameters. Continue quarterly monitoring.',
    dataGaps: [],
  },
  {
    testType: 'sensitivity',
    modelId: 'CECL-2024-003',
    verdict: 'warn',
    trafficLight: 'Yellow',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-24',
    dataSources: ['Loan Origination System'],
    computed: false,
    metrics: [
      {
        label: 'FICO Score — Variance Share',
        value: '48.2%',
        threshold: '< 50%',
        status: 'warn',
        note: 'Approaching single-factor dominance',
      },
      { label: 'LTV — Variance Share', value: '28.1%', threshold: '< 50%', status: 'pass' },
      {
        label: 'Origination Channel — Variance Share',
        value: '14.6%',
        threshold: '< 50%',
        status: 'pass',
      },
      { label: 'Vintage — Variance Share', value: '9.1%', threshold: '< 50%', status: 'pass' },
    ],
    findings: [
      'FICO score approaches 50% variance share threshold. Model sensitivity to single input is elevated.',
    ],
    recommendation:
      'Evaluate adding additional discriminating variables to reduce FICO concentration. Review alternative credit data sources.',
    dataGaps: [],
  },

  // ── AML-2024-002 (Customer Risk Rating) ─────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'AML-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-28',
    dataSources: ['Customer Onboarding System', 'SAR Filing Database'],
    computed: false,
    metrics: [
      { label: 'High-Risk Capture Rate', value: '84.2%', threshold: '≥ 80%', status: 'pass' },
      { label: 'Low-Risk False-Negative Rate', value: '3.1%', threshold: '≤ 5%', status: 'pass' },
      {
        label: 'Rating Stability (Quarter-over-Quarter)',
        value: '91.8%',
        threshold: '≥ 85%',
        status: 'pass',
      },
    ],
    findings: ['EDD trigger rate in Central America corridor slightly below peer benchmarks.'],
    recommendation:
      'Consider geographic risk weight adjustment for LATAM corridor. Schedule review with BSA team.',
    dataGaps: ['PEP database update lag for emerging markets — up to 30 days'],
  },
  {
    testType: 'override',
    modelId: 'AML-2024-002',
    verdict: 'warn',
    trafficLight: 'Yellow',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-30',
    dataSources: ['Case Management System'],
    computed: false,
    metrics: [
      {
        label: 'Override Rate',
        value: '28.0%',
        threshold: '< 30% (warn)',
        status: 'warn',
        note: 'Trending upward: Q3 19%, Q4 28%',
      },
      {
        label: 'Conservative Override %',
        value: '71.4%',
        threshold: '> 80% preferred',
        status: 'warn',
      },
      { label: 'Documentation Rate', value: '96.2%', threshold: '≥ 90%', status: 'pass' },
    ],
    findings: [
      'Override rate trending upward. Conservative override share declined from 82% (Q3) to 71% (Q4), suggesting analysts are downgrading more customers than expected.',
    ],
    recommendation:
      'Conduct targeted case review of High-to-Medium overrides. Refresh override justification guidance for front-line analysts.',
    dataGaps: [],
  },

  // ── FRAUD-2024-002 (Account Takeover) ──────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'FRAUD-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Feb 2026',
    runDate: '2026-03-08',
    dataSources: ['Online Banking Platform Logs', 'Mobile App Telemetry'],
    computed: false,
    metrics: [
      { label: 'True Positive Rate (Recall)', value: '79.2%', threshold: '≥ 75%', status: 'pass' },
      { label: 'False Positive Rate', value: '0.8%', threshold: '≤ 2%', status: 'pass' },
      { label: 'Detection Latency (median)', value: '1.4s', threshold: '≤ 3s', status: 'pass' },
    ],
    findings: [
      'Bot-driven ATO attempts from IP rotation detected at lower rate (42%) than human-impersonation attacks (91%).',
    ],
    recommendation:
      'Engage vendor for bot-detection module add-on. Evaluate network/IP reputation feed integration.',
    dataGaps: ['Mobile telemetry gap for app versions < 8.2 (3% of user base)'],
  },
  {
    testType: 'psi',
    modelId: 'FRAUD-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-12',
    dataSources: ['Online Banking Platform Logs'],
    computed: false,
    metrics: [
      { label: 'Behavioral Score PSI', value: '0.07', threshold: '< 0.10 (pass)', status: 'pass' },
      { label: 'Device Signal PSI', value: '0.04', threshold: '< 0.10 (pass)', status: 'pass' },
    ],
    findings: [],
    recommendation: 'Score distributions stable. No recalibration required.',
    dataGaps: [],
  },

  // ── FRAUD-2024-003 (ACH Fraud Scoring) ─────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'FRAUD-2024-003',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-25',
    dataSources: ['ACH Processing System', 'Return File Database'],
    computed: false,
    metrics: [
      {
        label: 'Return Rate Prediction Accuracy',
        value: '88.1%',
        threshold: '≥ 80%',
        status: 'pass',
      },
      {
        label: 'Unauthorized Debit Capture Rate',
        value: '73.4%',
        threshold: '≥ 70%',
        status: 'pass',
      },
    ],
    findings: [
      'Performance lower for originator types onboarded after 2023 — insufficient training data.',
    ],
    recommendation:
      'Supplement training data with 2024–2025 originator cohort data in next retraining cycle.',
    dataGaps: ['Same-day ACH returns not captured in real time'],
  },

  // ── CAP-2024-001 (DFAST Capital) ────────────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'CAP-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: '2025 DFAST',
    runDate: '2025-09-15',
    dataSources: ['Call Report', 'FR Y-9C', 'Federal Reserve Scenarios'],
    computed: false,
    metrics: [
      {
        label: 'CET1 Ratio Projection Accuracy (Base)',
        value: '94.2%',
        threshold: '≥ 90%',
        status: 'pass',
      },
      {
        label: 'PPNR Projection MAPE (Base)',
        value: '9.1%',
        threshold: '≤ 15%',
        status: 'pass',
        note: 'Post-remediation (was 18.2%)',
      },
      { label: 'Provision Accuracy (Adverse)', value: '87.6%', threshold: '≥ 85%', status: 'pass' },
    ],
    findings: [
      'Severely adverse scenario PPNR accuracy improved to 89.1% after fee income model recalibration (MRF-008).',
    ],
    recommendation: 'Continue annual backtesting cadence. PPNR recalibration effective.',
    dataGaps: [],
  },
  {
    testType: 'sensitivity',
    modelId: 'CAP-2024-001',
    verdict: 'warn',
    trafficLight: 'Yellow',
    dataConf: 'Moderate',
    period: '2025 DFAST',
    runDate: '2025-09-20',
    dataSources: ['Federal Reserve Scenarios'],
    computed: false,
    metrics: [
      {
        label: 'Deposit Repricing — Variance Share',
        value: '52.1%',
        threshold: '< 50%',
        status: 'fail',
        note: 'Primary driver of NII variance under adverse scenarios',
      },
      {
        label: 'CRE Default Rate — Variance Share',
        value: '28.4%',
        threshold: '< 50%',
        status: 'pass',
      },
      { label: 'Loan Growth — Variance Share', value: '12.2%', threshold: '< 50%', status: 'pass' },
    ],
    findings: [
      'Deposit repricing assumption is the dominant model driver under interest rate stress. High concentration risk.',
    ],
    recommendation:
      'Engage treasury and ALM team to stress-test deposit beta assumptions independently. Update core deposit study before next DFAST cycle.',
    dataGaps: [],
  },
  {
    testType: 'stress',
    modelId: 'CAP-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: '2025 DFAST',
    runDate: '2025-09-25',
    dataSources: ['Federal Reserve Severely Adverse Scenario'],
    computed: false,
    metrics: [
      {
        label: 'CET1 Ratio — Severely Adverse Trough',
        value: '8.2%',
        threshold: '≥ 4.5% regulatory minimum',
        status: 'pass',
      },
      {
        label: 'Tier 1 Capital Ratio — Adverse Trough',
        value: '9.8%',
        threshold: '≥ 6.0%',
        status: 'pass',
      },
      {
        label: 'NII Change Under Severe Adverse',
        value: '−14.2%',
        threshold: '< −30% policy limit',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation:
      'Capital ratios resilient under all stress scenarios. Continue monitoring CRE concentration.',
    dataGaps: [],
  },

  // ── PPNR-2024-001 (PPNR Forecasting) ────────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'PPNR-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-28',
    dataSources: ['General Ledger', 'Budget System'],
    computed: false,
    metrics: [
      { label: 'NII Forecast MAPE', value: '4.8%', threshold: '≤ 10%', status: 'pass' },
      { label: 'Non-Interest Income MAPE', value: '9.2%', threshold: '≤ 15%', status: 'pass' },
      { label: 'Non-Interest Expense MAPE', value: '3.1%', threshold: '≤ 10%', status: 'pass' },
    ],
    findings: [
      'Mortgage origination fee income more volatile than forecast in declining-rate environment.',
    ],
    recommendation:
      'Continue quarterly monitoring. Consider rate-sensitivity adjustment for fee income projection.',
    dataGaps: [],
  },
  {
    testType: 'sensitivity',
    modelId: 'PPNR-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-30',
    dataSources: ['General Ledger'],
    computed: false,
    metrics: [
      {
        label: 'Interest Rate — Variance Share',
        value: '41.2%',
        threshold: '< 50%',
        status: 'pass',
      },
      { label: 'Loan Volume — Variance Share', value: '32.8%', threshold: '< 50%', status: 'pass' },
      {
        label: 'Fee Income Mix — Variance Share',
        value: '26.0%',
        threshold: '< 50%',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation: 'No single driver dominates. Model well-diversified across key inputs.',
    dataGaps: [],
  },

  // ── MKT-2024-001 (Interest Rate Sensitivity) ────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'MKT-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-14',
    dataSources: ['Bond Portfolio System', 'Bloomberg Curves'],
    computed: false,
    metrics: [
      { label: 'DV01 Prediction Error', value: '0.8%', threshold: '≤ 3%', status: 'pass' },
      {
        label: 'P&L Attribution — Rate Sensitivity',
        value: '94.1%',
        threshold: '≥ 90%',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation: 'Model performance satisfactory. Continue monthly monitoring cadence.',
    dataGaps: [],
  },
  {
    testType: 'stress',
    modelId: 'MKT-2024-001',
    verdict: 'warn',
    trafficLight: 'Yellow',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-16',
    dataSources: ['Bond Portfolio System'],
    computed: false,
    metrics: [
      {
        label: 'DV01 — Current',
        value: '$2.4M/bp',
        threshold: '< $2.5M/bp limit',
        status: 'warn',
        note: 'At 96% of limit',
      },
      {
        label: 'Parallel +300bps P&L',
        value: '−$72.3M',
        threshold: 'Informational',
        status: 'info',
      },
      {
        label: 'Parallel −200bps P&L',
        value: '+$48.1M',
        threshold: 'Informational',
        status: 'info',
      },
    ],
    findings: [
      'DV01 limit headroom exhausted (96% utilized). Additional duration purchases prohibited without board approval.',
    ],
    recommendation: 'ALCO action required: reduce DV01 or seek board limit increase. See MRF-012.',
    dataGaps: [],
  },

  // ── MKT-2024-002 (Fair Value L3) ────────────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'MKT-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Limited',
    period: 'Q4 2025',
    runDate: '2026-01-22',
    dataSources: ['Securities Accounting System', 'ICE Pricing', 'Refinitiv'],
    computed: false,
    metrics: [
      {
        label: 'Price Difference vs. Vendor (median)',
        value: '0.8%',
        threshold: '≤ 2%',
        status: 'pass',
      },
      { label: 'Challenged Positions', value: '2 of 18', threshold: '≤ 4', status: 'pass' },
    ],
    findings: [
      'Two legacy CMBS positions have no vendor pricing — model-only valuation with high estimation uncertainty.',
    ],
    recommendation:
      'Engage trustee for CMBS position pricing documentation. Disclose limited data confidence in valuation memos.',
    dataGaps: ['Pre-2010 vintage CMBS — no vendor coverage for 2 positions'],
    dataNote: 'Data confidence limited for 2 of 18 Level 3 positions due to absent market data.',
  },
  {
    testType: 'benchmarking',
    modelId: 'MKT-2024-002',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Limited',
    period: 'Q4 2025',
    runDate: '2026-01-24',
    dataSources: ['ICE Pricing', 'Refinitiv', 'Bloomberg'],
    computed: false,
    metrics: [
      {
        label: 'Model Price vs. Vendor Consensus',
        value: 'Within ±1.2%',
        threshold: '≤ ±2%',
        status: 'pass',
      },
      {
        label: 'Discount Rate vs. Peer Range',
        value: '8.4%',
        threshold: 'Peer range: 7.5%–9.5%',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation:
      'Fair value methodology in line with market practice for comparable instruments.',
    dataGaps: [],
  },

  // ── OPS-2024-001 (Op Risk) ──────────────────────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'OPS-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Limited',
    period: '2025 Annual',
    runDate: '2025-11-20',
    dataSources: ['Internal Loss Event Database', 'ORX Consortium Data'],
    computed: false,
    metrics: [
      {
        label: 'Capital Estimate vs. Actual Losses',
        value: '3.4x coverage ratio',
        threshold: '≥ 2.0x',
        status: 'pass',
      },
      {
        label: 'Expected Loss Frequency Error',
        value: '12.1%',
        threshold: '≤ 20%',
        status: 'pass',
      },
    ],
    findings: [
      'Tail-risk estimation relies heavily on ORX consortium data due to thin internal tail events. Model uncertainty is elevated.',
    ],
    recommendation:
      'Expand scenario library to supplement thin tail observations. Consider engaging external peer for scenario workshops.',
    dataGaps: ['ORX data has 18-month submission lag — most recent periods extrapolated'],
    dataNote: 'Data confidence limited by thin internal tail loss history.',
  },
  {
    testType: 'benchmarking',
    modelId: 'OPS-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'Limited',
    period: '2025 Annual',
    runDate: '2025-11-22',
    dataSources: ['ORX Consortium Data'],
    computed: false,
    metrics: [
      {
        label: 'Capital as % of Revenue',
        value: '2.8%',
        threshold: 'Peer range 2.0%–4.0%',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation: 'Capital ratio within peer range. No recalibration required.',
    dataGaps: [],
  },

  // ── LIQ-2024-001 (Liquidity Stress Testing) ────────────────────────────
  {
    testType: 'backtesting',
    modelId: 'LIQ-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Q4 2025',
    runDate: '2026-01-10',
    dataSources: ['Treasury Management System', 'Core Banking System'],
    computed: false,
    metrics: [
      { label: '30-Day LCR', value: '128.4%', threshold: '≥ 100%', status: 'pass' },
      {
        label: 'Deposit Outflow Prediction Accuracy',
        value: '91.2%',
        threshold: '≥ 85%',
        status: 'pass',
      },
    ],
    findings: [
      'Social-media-driven runoff scenario underrepresented in current stress assumptions (see MRF-009).',
    ],
    recommendation:
      'Update deposit runoff assumptions before Q2 2026 ALCO stress test. See MRF-009 for remediation plan.',
    dataGaps: [],
  },
  {
    testType: 'stress',
    modelId: 'LIQ-2024-001',
    verdict: 'pass',
    trafficLight: 'Green',
    dataConf: 'High',
    period: 'Feb 2026',
    runDate: '2026-03-08',
    dataSources: ['Treasury Management System', 'FHLB Advance Schedule'],
    computed: false,
    metrics: [
      {
        label: '30-Day Idiosyncratic Stress LCR',
        value: '112.8%',
        threshold: '≥ 100%',
        status: 'pass',
      },
      {
        label: '30-Day Market-Wide Stress LCR',
        value: '108.4%',
        threshold: '≥ 100%',
        status: 'pass',
      },
      {
        label: 'Contingent Liquidity Availability',
        value: '$425M',
        threshold: '> 90-Day Net Cash Outflow $312M',
        status: 'pass',
      },
    ],
    findings: [],
    recommendation:
      'Liquidity position resilient under current stress scenarios. Update runoff assumptions per MRF-009.',
    dataGaps: [],
  },
  {
    testType: 'sensitivity',
    modelId: 'LIQ-2024-001',
    verdict: 'warn',
    trafficLight: 'Yellow',
    dataConf: 'Moderate',
    period: 'Q4 2025',
    runDate: '2026-01-12',
    dataSources: ['Treasury Management System'],
    computed: false,
    metrics: [
      {
        label: 'Brokered Deposit Runoff — Variance Share',
        value: '58.2%',
        threshold: '< 50%',
        status: 'fail',
        note: 'Primary driver of stress LCR variability',
      },
      {
        label: 'FHLB Availability — Variance Share',
        value: '22.1%',
        threshold: '< 50%',
        status: 'pass',
      },
      {
        label: 'Repo Haircut — Variance Share',
        value: '19.7%',
        threshold: '< 50%',
        status: 'pass',
      },
    ],
    findings: [
      'Brokered deposit runoff assumption dominates liquidity stress sensitivity. High model concentration in a single assumption.',
    ],
    recommendation:
      'Review brokered deposit concentration limits. Stress-test with ±10pp brokered runoff sensitivity.',
    dataGaps: [],
  },
];
