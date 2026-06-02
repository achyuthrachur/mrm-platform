import { runSourceToModel } from './source-to-model';
import { runPSI, runCSI } from './psi-csi';
import { runCREBacktest } from './backtesting/cre-pd';
import { runAMLBacktest } from './backtesting/aml';
import { runNIIBacktest } from './backtesting/nii';
import { runFraudBacktest } from './backtesting/fraud';
import { runBenchmarking } from './benchmarking';
import { runSensitivity } from './sensitivity';
import { runStress } from './stress';
import { runOverride } from './override';
import type { TestResult, TestType } from '@/types';

/**
 * Engine registry — maps (modelId, testType) to a compute function.
 * Returns null for illustrative (non-computed) pairs: always return
 * the illustrative result from illustrative-results.ts instead.
 *
 * The 16 computed pairs (Addendum §1):
 *   CECL-2024-001: source-to-model, psi, backtesting, stress
 *   AML-2024-001:  source-to-model, backtesting, benchmarking, override
 *   ALM-2024-001:  backtesting, sensitivity, stress, source-to-model
 *   FRAUD-2024-001: backtesting, psi, csi, benchmarking
 */

interface EngineInput {
  modelId: string;
  period?: string;
  customSourceRows?: Record<string, unknown>[];
  customModelRows?: Record<string, unknown>[];
}

type EngineFunc = (input: EngineInput) => TestResult;

const REGISTRY: Partial<Record<string, EngineFunc>> = {
  'CECL-2024-001:source-to-model': runSourceToModel,
  'CECL-2024-001:psi': runPSI,
  'CECL-2024-001:backtesting': runCREBacktest,
  'CECL-2024-001:stress': runStress,

  'AML-2024-001:source-to-model': runSourceToModel,
  'AML-2024-001:backtesting': runAMLBacktest,
  'AML-2024-001:benchmarking': runBenchmarking,
  'AML-2024-001:override': runOverride,

  'ALM-2024-001:backtesting': runNIIBacktest,
  'ALM-2024-001:sensitivity': runSensitivity,
  'ALM-2024-001:stress': runStress,
  'ALM-2024-001:source-to-model': runSourceToModel,

  'FRAUD-2024-001:backtesting': runFraudBacktest,
  'FRAUD-2024-001:psi': runPSI,
  'FRAUD-2024-001:csi': runCSI,
  'FRAUD-2024-001:benchmarking': runBenchmarking,
};

/** Returns the compute engine for (modelId, testType), or null if illustrative. */
export function getEngine(modelId: string, testType: TestType): EngineFunc | null {
  return REGISTRY[`${modelId}:${testType}`] ?? null;
}

/** Run the engine for (modelId, testType). Throws if not in the computed matrix. */
export function runEngine(
  modelId: string,
  testType: TestType,
  options?: Partial<EngineInput>
): TestResult {
  const engine = getEngine(modelId, testType);
  if (!engine) {
    throw new Error(
      `No compute engine for (${modelId}, ${testType}). Use illustrative result instead.`
    );
  }
  return engine({ modelId, ...options });
}

export { type EngineInput };
