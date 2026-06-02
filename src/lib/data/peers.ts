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

/**
 * AML benchmarking — alert-to-SAR conversion rate.
 * Peers include some below the subject (0.021) so it ranks at ~28th percentile → warn.
 * 3 of 11 non-subject peers are below 0.021: [0.016, 0.018, 0.019]
 */
export const AML_SAR_RATE_PEERS: PeerBank[] = [
  { name: 'Heartland Commerce Bank', value: 0.021, isSubject: true },
  { name: 'MidWest Community Bank', value: 0.038 },
  { name: 'Lakeside Financial', value: 0.042 },
  { name: 'Prairie Heritage Bank', value: 0.031 },
  { name: 'Cornerstone Savings', value: 0.016 }, // below subject
  { name: 'First Commerce Bank', value: 0.044 },
  { name: 'Central Valley Bankers', value: 0.036 },
  { name: 'Heritage Alliance Bank', value: 0.018 }, // below subject
  { name: 'Summit Regional Bank', value: 0.028 },
  { name: 'Riverview National Bank', value: 0.045 },
  { name: 'Western Alliance Community', value: 0.019 }, // below subject
];

/**
 * Fraud benchmarking — AUC. 4 of 10 non-subject peers are below 0.90,
 * ensuring computed AUC >= 0.90 lands at 40th+ percentile → pass.
 */
export const FRAUD_AUC_PEERS: PeerBank[] = [
  { name: 'Heartland Commerce Bank', value: 0.93, isSubject: true },
  { name: 'MidWest Community Bank', value: 0.87 },
  { name: 'Lakeside Financial', value: 0.94 },
  { name: 'Prairie Heritage Bank', value: 0.86 },
  { name: 'Cornerstone Savings', value: 0.92 },
  { name: 'First Commerce Bank', value: 0.95 },
  { name: 'Central Valley Bankers', value: 0.88 },
  { name: 'Heritage Alliance Bank', value: 0.93 },
  { name: 'Summit Regional Bank', value: 0.85 },
  { name: 'Riverview National Bank', value: 0.92 },
  { name: 'Western Alliance Community', value: 0.94 },
];
