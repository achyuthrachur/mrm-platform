import type { Finding, TestResult, AuditEntry } from '@/types';
import { getToday } from '@/lib/clock';

const TYPE_BY_TEST: Record<string, Finding['type']> = {
  'source-to-model': 'Data Quality',
  backtesting: 'Model Performance',
  benchmarking: 'Model Performance',
  sensitivity: 'Model Performance',
  stress: 'Model Performance',
  psi: 'Model Stability',
  csi: 'Model Stability',
  override: 'Model Governance',
};

function suggestSeverity(result: TestResult): Finding['sev'] {
  if (result.verdict === 'fail') return 'High';
  return 'Medium';
}

let findingCounter = 100;

function generateFindingId(): string {
  findingCounter++;
  const year = getToday().slice(0, 4);
  return `MRF-${year}${String(findingCounter).padStart(3, '0')}`;
}

export interface CreateFindingInput {
  runId: string;
  modelId: string;
  modelName: string;
  result: TestResult;
  createdBy: string;
  daysUntilDue?: number;
  overrideTitle?: string;
  overrideDesc?: string;
}

export function buildFindingFromRun(input: CreateFindingInput): Finding {
  const { runId, modelId, modelName, result, createdBy, daysUntilDue = 60 } = input;
  const today = getToday();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const sev = suggestSeverity(result);
  const type = TYPE_BY_TEST[result.testType] ?? 'Model Performance';

  const failingMetrics = result.metrics
    .filter((m) => m.status === 'fail' || m.status === 'warn')
    .map((m) => `${m.label}: ${m.value} (threshold: ${m.threshold})`)
    .join('; ');

  const title =
    input.overrideTitle ??
    `${result.testType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} — ${result.verdict.toUpperCase()} — ${modelName}`;

  const desc =
    input.overrideDesc ??
    [
      `${type} finding from ${result.testType} test run.`,
      failingMetrics ? `Failing metrics: ${failingMetrics}.` : '',
      ...(result.findings.length > 0 ? result.findings : []),
    ]
      .filter(Boolean)
      .join(' ');

  const auditEntry: AuditEntry = {
    ts: new Date().toISOString(),
    actor: createdBy,
    actorType: 'human',
    action: `Finding created from test run ${runId} (${result.testType} — ${result.verdict})`,
  };

  return {
    id: generateFindingId(),
    modelId,
    model: modelName,
    title,
    sev,
    status: 'Open',
    type,
    openDate: today,
    dueDate: dueDate.toISOString().slice(0, 10),
    assignedTo: createdBy,
    assignedRole: 'Model Owner',
    desc,
    remediation: result.recommendation ?? '',
    validatorNote: '',
    age: 0,
    auditTrail: [auditEntry],
    flaggedForReview: false,
    sourceRunId: runId,
  };
}
