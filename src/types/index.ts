/* ── Canonical domain types (Master Plan §5) ────────────────────────────
   All domain types live here. Import from '@/types', never redefine ad hoc.
────────────────────────────────────────────────────────────────────────── */

export type Role = 'owner' | 'mrm';
export type Tier = 1 | 2 | 3;
export type Verdict = 'pass' | 'warn' | 'fail';
export type TrafficLight = 'Green' | 'Yellow' | 'Red';
export type DataConfidence = 'High' | 'Moderate' | 'Limited';
export type TestType =
  | 'source-to-model'
  | 'backtesting'
  | 'benchmarking'
  | 'sensitivity'
  | 'stress'
  | 'override'
  | 'psi'
  | 'csi';

export interface Model {
  id: string;
  name: string;
  cat: string;
  sub: string;
  tier: Tier;
  owner: string;
  ownerTitle: string;
  status: string;
  risk: 'High' | 'Medium' | 'Low';
  valStatus: string;
  lastVal: string;
  nextVal: string;
  framework: string;
  method: string;
  sources: string[];
  openFx: number;
  totalFx: number;
  desc: string;
  limits: string;
  dataLimits: string;
  monFreq: string;
  approvedBy: string;
  approvalDate: string;
  heatX?: number;
  heatY?: number;
  monPlan?: string;
  userDefined?: boolean;
  selectedTests?: SelectedTest[];
}

export interface SelectedTest {
  testType: TestType;
  frequency: string;
  srRef: string;
}

export interface MetricRow {
  label: string;
  value: string;
  threshold: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  note?: string;
}

export interface FormulaTrace {
  name: string;
  equation: string;
  inputs: Record<string, number | string>;
  steps: { label: string; expression: string; value: number | string }[];
  result: number | string;
  reference: string;
}

export interface TestResult {
  testType: TestType;
  modelId: string;
  verdict: Verdict;
  trafficLight: TrafficLight;
  dataConf: DataConfidence;
  period: string;
  runDate: string;
  dataSources: string[];
  metrics: MetricRow[];
  findings: string[];
  recommendation: string;
  computed: boolean;
  formula?: FormulaTrace;
  chartType?: string;
  chartData?: unknown;
  dataGaps?: string[];
  proxyUsed?: string[];
  compensating?: string[];
  dataNote?: string;
  improvWith?: string[];
}

export interface AuditEntry {
  ts: string;
  actor: string;
  actorType: 'human' | 'ai' | 'system';
  action: string;
}

export interface Finding {
  id: string;
  modelId: string;
  model: string;
  title: string;
  sev: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Remediation' | 'Closed';
  type: string;
  openDate: string;
  dueDate: string;
  assignedTo: string;
  assignedRole: string;
  desc: string;
  remediation: string;
  validatorNote: string;
  age: number;
  closedDate?: string;
  auditTrail?: AuditEntry[];
  flaggedForReview?: boolean;
  sourceRunId?: string;
}

export interface MonitoringCalendarEntry {
  modelId: string;
  testType: TestType;
  srRef: string;
  frequency: string;
  thresholdText: string;
  lastRun: string | null;
  nextDue: string;
  status: 'Current' | 'Due' | 'Overdue';
  historyDots: TestHistoryEntry[];
}

export interface TestHistoryEntry {
  period: string;
  verdict: Verdict;
  runDate: string;
}

export interface MacroSeries {
  id: string;
  label: string;
  unit: string;
  source: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  live?: boolean;
}

export interface MacroQuarterPoint {
  quarter: string;
  value: number;
}

export interface DependencyNode {
  id: string;
  modelId: string;
  label: string;
  tier: Tier;
  risk: 'High' | 'Medium' | 'Low';
  status: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'feeds' | 'informs' | 'overlaps';
}

export interface PeerBank {
  name: string;
  value: number;
  isSubject?: boolean;
}

export interface FrequencyApproval {
  id: string;
  modelId: string;
  testType: TestType;
  requestedFrequency: string;
  defaultFrequency: string;
  justification: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface ThresholdOverride {
  modelId: string;
  testType: TestType;
  metric: string;
  originalThreshold: number;
  overrideThreshold: number;
  justification: string;
  approvedBy: string;
  approvedAt: string;
}

export interface Dataset<TRow> {
  id: string;
  label: string;
  rows: TRow[];
  rowCount: number;
  generatedFromSeed?: number;
  note?: string;
}

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export interface TestRun {
  id: string;
  modelId: string;
  testType: TestType;
  result: TestResult;
  runAt: string;
  runBy: string;
  runByType: 'human' | 'system';
  findingId?: string;
}

export interface Permissions {
  canRunTests: boolean;
  canApproveFrequency: boolean;
  canReviewFindings: boolean;
  canCreateFindings: boolean;
  canManageModels: boolean;
  canViewAllModels: boolean;
  canExportResults: boolean;
  canAddModel: boolean;
  canApproveModel: boolean;
}

// ── Model Onboarding (PRD-12) ─────────────────────────────────────────────

export type ModelOnboardingStatus =
  | 'draft'
  | 'awaiting_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'ready'
  | 'data_gen_failed';

export type OnboardingAction =
  | 'submit'
  | 'request_changes'
  | 'approve'
  | 'reject'
  | 'resubmit'
  | 'data_gen_complete'
  | 'data_gen_failed_action'
  | 'retry';

export interface ThresholdField {
  key: string;
  label: string;
  unit: '%' | 'decimal' | 'count' | 'ratio' | 'bps';
  default: number;
  min: number;
  max: number;
  description: string;
  reference: string;
  warnBand?: { gt?: number; lt?: number };
  failBand?: { gt?: number; lt?: number };
  /** Hide this field unless model category is in this list */
  showForCategories?: string[];
  /** Hide this field when model category is in this list */
  hideForCategories?: string[];
}

export interface TestThresholdSchema {
  testType: TestType;
  label: string;
  fields: ThresholdField[];
}

export interface ThresholdConfig {
  testKey: string;
  testType: TestType;
  fields: Record<string, number>;
  overridesDefault: boolean;
  mrmAcknowledged?: boolean;
}

export interface ModelSubmission {
  id: string;
  modelId: string;
  status: ModelOnboardingStatus;
  model: Partial<Model>;
  selectedTests: SelectedTest[];
  thresholdConfigs: ThresholdConfig[];
  mrmNotes: string;
  priorNotes: string[];
  auditTrail: AuditEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  dataGenStatus?: 'pending' | 'generating' | 'complete' | 'failed';
  dataGenProgress?: number;
}
