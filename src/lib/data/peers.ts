import type { PeerBank } from '@/types';

/** Peer bank arrays used by benchmarking engines. lowerIsBetter noted per metric. */

/** CRE PD peers — not used in computed benchmarking (CRE doesn't have it in the matrix). */
export const CRE_PD_PEERS: PeerBank[] = [
  { name: 'Heartland Commerce Bank', value: 0.034, isSubject: true },
  { name: 'MidWest Community Bank', value: 0.028 },
  { name: 'Lakeside Financial', value: 0.031 },
  { name: 'Prairie Heritage Bank', value: 0.039 },
  { name: 'Cornerstone Savings', value: 0.026 },
  { name: 'First Commerce Bank', value: 0.033 },
  { name: 'Central Valley Bankers', value: 0.041 },
  { name: 'Heritage Alliance Bank', value: 0.029 },
  { name: 'Summit Regional Bank', value: 0.035 },
  { name: 'Riverview National Bank', value: 0.03 },
];

/** AML benchmarking — alert-to-SAR conversion rate (higher is better for SAR quality). */
export const AML_SAR_RATE_PEERS: PeerBank[] = [
  { name: 'Heartland Commerce Bank', value: 0.021, isSubject: true },
  { name: 'MidWest Community Bank', value: 0.038 },
  { name: 'Lakeside Financial', value: 0.042 },
  { name: 'Prairie Heritage Bank', value: 0.031 },
  { name: 'Cornerstone Savings', value: 0.025 },
  { name: 'First Commerce Bank', value: 0.044 },
  { name: 'Central Valley Bankers', value: 0.036 },
  { name: 'Heritage Alliance Bank', value: 0.039 },
  { name: 'Summit Regional Bank', value: 0.028 },
  { name: 'Riverview National Bank', value: 0.045 },
  { name: 'Western Alliance Community', value: 0.033 },
];

/** Fraud benchmarking — AUC (precision-recall). */
export const FRAUD_AUC_PEERS: PeerBank[] = [
  { name: 'Heartland Commerce Bank', value: 0.93, isSubject: true },
  { name: 'MidWest Community Bank', value: 0.91 },
  { name: 'Lakeside Financial', value: 0.94 },
  { name: 'Prairie Heritage Bank', value: 0.89 },
  { name: 'Cornerstone Savings', value: 0.92 },
  { name: 'First Commerce Bank', value: 0.95 },
  { name: 'Central Valley Bankers', value: 0.9 },
  { name: 'Heritage Alliance Bank', value: 0.93 },
  { name: 'Summit Regional Bank', value: 0.88 },
  { name: 'Riverview National Bank', value: 0.92 },
  { name: 'Western Alliance Community', value: 0.94 },
];
