export {
  getCRELoanTape,
  getCRELoanTapeModelCopy,
  generateCRELoanTape,
  type CRELoanRow,
} from './cre-loan-tape';
export {
  getAMLTransactions,
  getAMLOverrideLog,
  generateAMLTransactions,
  generateAMLOverrideLog,
  type AMLTransactionRow,
  type AMLOverrideRow,
} from './aml-transactions';
export {
  getFraudScoredTxns,
  generateFraudScoredTxns,
  type FraudScoredTxnRow,
} from './fraud-scored-txns';
export {
  getALMPositions,
  generateALMPositions,
  NII_BACKTEST_SERIES,
  NII_RATE_SHOCK_SCENARIOS,
  NII_SENSITIVITY_INPUTS,
  CRE_STRESS_SCENARIOS,
  type ALMPositionRow,
} from './alm-positions';
export { mulberry32, normalSample, clamp, pick, randInt, offsetDate } from './prng';

import type { Dataset } from '@/types';
import { getCRELoanTape, getCRELoanTapeModelCopy } from './cre-loan-tape';
import { getAMLTransactions, getAMLOverrideLog } from './aml-transactions';
import { getFraudScoredTxns } from './fraud-scored-txns';
import { getALMPositions } from './alm-positions';

const DATASET_GETTERS: Record<string, () => Dataset<unknown>> = {
  'cre-loan-tape': getCRELoanTape as () => Dataset<unknown>,
  'cre-loan-tape-model-copy': getCRELoanTapeModelCopy as () => Dataset<unknown>,
  'aml-transactions': getAMLTransactions as () => Dataset<unknown>,
  'aml-override-log': getAMLOverrideLog as () => Dataset<unknown>,
  'fraud-scored-txns': getFraudScoredTxns as () => Dataset<unknown>,
  'alm-positions': getALMPositions as () => Dataset<unknown>,
};

export function getDatasetById(id: string): Dataset<unknown> | null {
  return DATASET_GETTERS[id]?.() ?? null;
}
