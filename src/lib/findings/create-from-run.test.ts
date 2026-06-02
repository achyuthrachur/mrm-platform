import { describe, it, expect } from 'vitest';
import { buildFindingFromRun } from './create-from-run';
import { runEngine } from '@/lib/engines';
import type { Finding } from '@/types';

describe('buildFindingFromRun', () => {
  it('creates a finding from a fail result with correct severity', () => {
    const result = runEngine('AML-2024-001', 'source-to-model');
    expect(result.verdict).toBe('fail');

    const finding = buildFindingFromRun({
      runId: 'run-001',
      modelId: 'AML-2024-001',
      modelName: 'Transaction Monitoring',
      result,
      createdBy: 'Sarah Chen',
    });

    expect(finding.sev).toBe('High');
    expect(finding.status).toBe('Open');
    expect(finding.modelId).toBe('AML-2024-001');
    expect(finding.sourceRunId).toBe('run-001');
    expect(finding.type).toBe('Data Quality');
  });

  it('creates a finding from a warn result with Medium severity', () => {
    const result = runEngine('CECL-2024-001', 'psi');
    expect(result.verdict).toBe('warn');

    const finding = buildFindingFromRun({
      runId: 'run-002',
      modelId: 'CECL-2024-001',
      modelName: 'CRE PD',
      result,
      createdBy: 'Sarah Chen',
    });

    expect(finding.sev).toBe('Medium');
    expect(finding.type).toBe('Model Stability');
  });

  it('finding description includes failing metrics', () => {
    const result = runEngine('AML-2024-001', 'source-to-model');
    const finding = buildFindingFromRun({
      runId: 'run-003',
      modelId: 'AML-2024-001',
      modelName: 'Transaction Monitoring',
      result,
      createdBy: 'Sarah Chen',
    });

    expect(finding.desc.length).toBeGreaterThan(10);
    expect(finding.remediation.length).toBeGreaterThan(0);
  });

  it('finding has a valid MRF- id', () => {
    const result = runEngine('CECL-2024-001', 'backtesting');
    const finding = buildFindingFromRun({
      runId: 'run-004',
      modelId: 'CECL-2024-001',
      modelName: 'CRE PD',
      result,
      createdBy: 'Sarah Chen',
    });

    expect(finding.id).toMatch(/^MRF-\d+/);
  });

  it('audit trail records the creation with run link', () => {
    const result = runEngine('ALM-2024-001', 'stress');
    const finding = buildFindingFromRun({
      runId: 'run-005',
      modelId: 'ALM-2024-001',
      modelName: 'NII Sensitivity',
      result,
      createdBy: 'Sarah Chen',
    });

    expect(finding.auditTrail?.length).toBe(1);
    expect(finding.auditTrail?.[0].action).toContain('run-005');
    expect(finding.auditTrail?.[0].actorType).toBe('human');
  });

  it('type maps correctly from testType', () => {
    const testTypeMapping: [string, string, Finding['type']][] = [
      ['AML-2024-001', 'override', 'Model Governance'],
      ['CECL-2024-001', 'psi', 'Model Stability'],
      ['ALM-2024-001', 'sensitivity', 'Model Performance'],
    ];

    for (const [modelId, testType, expectedType] of testTypeMapping) {
      const result = runEngine(
        modelId as Parameters<typeof runEngine>[0],
        testType as Parameters<typeof runEngine>[1]
      );
      const finding = buildFindingFromRun({
        runId: 'run-006',
        modelId,
        modelName: 'Test Model',
        result,
        createdBy: 'Sarah Chen',
      });
      expect(finding.type, `${modelId}:${testType}`).toBe(expectedType);
    }
  });
});
