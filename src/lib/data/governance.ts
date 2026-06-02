/** Governance seed data — approval pipeline, MRM committee, policy exceptions */

export interface PipelineStep {
  id: number;
  label: string;
  description: string;
}

export interface PipelineModel {
  modelId: string;
  modelName: string;
  currentStep: number;
  submittedDate: string;
  notes?: string;
}

export interface CommitteeMeeting {
  date: string;
  location: string;
  agendaItems: string[];
  lastMeetingSummary: string;
}

export interface PolicyException {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  rationale: string;
  approvedBy: string;
  approvedDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Pending Renewal';
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, label: 'Developer', description: 'Model development and documentation complete' },
  { id: 2, label: 'Owner Attestation', description: 'Model owner reviews and attests to accuracy' },
  {
    id: 3,
    label: 'Independent Validation',
    description: 'MRM team conducts independent validation',
  },
  { id: 4, label: 'MRM Review', description: 'MRM Officer reviews and approves' },
  { id: 5, label: 'Committee', description: 'Model Risk Committee review and approval' },
  { id: 6, label: 'Implementation', description: 'Model deployed to production' },
];

export const PIPELINE_QUEUE: PipelineModel[] = [
  {
    modelId: 'ALM-2024-001',
    modelName: 'NII Sensitivity',
    currentStep: 4,
    submittedDate: '2026-03-01',
    notes: 'Annual validation cycle — deposit beta recalibration under review',
  },
  {
    modelId: 'AML-2024-003',
    modelName: 'Enhanced Due Diligence Trigger',
    currentStep: 2,
    submittedDate: '2026-02-15',
    notes: 'Owner attestation package submitted; awaiting MRM acknowledgment',
  },
  {
    modelId: 'CECL-2024-003',
    modelName: 'Consumer Mortgage PD',
    currentStep: 3,
    submittedDate: '2026-01-20',
    notes: 'Independent validation in progress — FICO concentration finding under review',
  },
];

export const MRM_COMMITTEE: CommitteeMeeting = {
  date: '2026-04-15',
  location: 'Boardroom 3A / WebEx',
  agendaItems: [
    'ALM-2024-001 NII Sensitivity — annual validation approval',
    'CECL-2024-003 Consumer Mortgage PD — validation report review',
    'Model Risk Policy Update — social media bank run stress scenario',
    'Q1 2026 Portfolio Risk Report — 3 models in warn, 1 in fail',
  ],
  lastMeetingSummary:
    'January 2026 meeting: Approved FRAUD-2024-001 Card Fraud Detection annual validation. ' +
    'Requested remediation plan update for MRF-001 (AML ACH feed gap) by April 15. ' +
    'Noted upward trend in CRE delinquency rates; directed ALM team to update stress scenarios.',
};

export const POLICY_EXCEPTIONS: PolicyException[] = [
  {
    id: 'EXC-2024-001',
    title: 'Quarterly Backtesting Waiver — NII Sensitivity (2024)',
    modelId: 'ALM-2024-001',
    modelName: 'NII Sensitivity',
    rationale:
      'Core deposit study refresh scheduled for Q2 2026. Backtesting results valid under current assumptions; recalibration is in progress (MRF-010). Annual waiver approved while update completes.',
    approvedBy: 'Marcus Williams, MRM Officer',
    approvedDate: '2024-12-01',
    expiryDate: '2026-06-30',
    status: 'Active',
  },
  {
    id: 'EXC-2025-002',
    title: 'Peer Benchmarking Frequency — Op Risk LDA (Annual vs. Quarterly)',
    modelId: 'OPS-2024-001',
    modelName: 'Op Risk Loss Estimation',
    rationale:
      'ORX consortium benchmarking data has 18-month lag; quarterly benchmarking is impractical. ' +
      'Annual frequency approved with supplemental scenario-based calibration check each quarter.',
    approvedBy: 'Marcus Williams, MRM Officer',
    approvedDate: '2025-03-15',
    expiryDate: '2026-03-15',
    status: 'Pending Renewal',
  },
];
