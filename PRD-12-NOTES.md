# PRD-12 Implementation Notes — Model Onboarding Workflow

## 1. Web Worker vs. API Route decision

**Choice: Client-side async function (no Web Worker, no API route)**

Rationale:

- The app's storage adapters (IndexedDB, localStorage) are browser-only; an API route running on the Next.js server cannot write to them
- A Web Worker in Next.js App Router requires a custom webpack config and the `next/dynamic` pattern, which adds complexity without benefit for a demo-scale data generator
- The generator is fast (< 1s for 5,000 rows) so blocking is not a real concern
- Client-side async with `await new Promise(r => setTimeout(r, 0))` yields to React between phases, keeping the main thread responsive

The `triggerDataGen` function in `submissions-context.tsx` runs the generator, writes each dataset to StorageAdapter, and updates progress on the submission record. Progress callbacks fire at 0/25/50/75/100%.

A skeleton API route could be added later if cloud storage (Supabase) is used; the generator logic in `data-gen.ts` is transport-agnostic (pure function, no I/O).

---

## 2. Per-category template details

| Category   | Primary dataset                   | Rows         | Planted properties                                              |
| ---------- | --------------------------------- | ------------ | --------------------------------------------------------------- |
| CECL       | Loan tape                         | 2,000        | PSI in warn band (LTV drift); MAPE calibrated to pass threshold |
| BSA/AML    | Transaction feed + override log   | 3,000 + ~150 | FP rate ~97%; SAR rate ~2.5%; ACH feed gap for STM fail         |
| ALM        | Position tape + NII stress series | 3,000 + 7    | NII sensitivity; severe scenario above threshold                |
| Fraud      | Scored transactions               | 5,000        | AUC ~threshold+0.05; PSI in warn band via score drift           |
| All others | Generic override log              | 500          | Override rate near warn boundary; documentation at pass rate    |

All generators use `mulberry32(seedFromModelId(modelId))` for full determinism.

---

## 3. Threshold calibration approach

The engine reads configured threshold values from `ThresholdConfig` via the `threshold()` helper. Generation is calibrated so:

- **PSI/CSI**: LTV drift (CECL) or score drift (Fraud) is set to `√(targetPSI / 0.477) × scale` where `targetPSI = psi_stable + rand() × (psi_monitor - psi_stable) × 0.6–0.7`. This plants PSI in the warn band regardless of the owner-configured stable/monitor limits.
- **Backtesting MAPE**: Predicted PD bias factor is `1 + mape_pass/100 + 0.02`, putting MAPE slightly above the pass threshold (in warn territory).
- **Stress**: NII beta shock is `severe_threshold + rand() × 0.02`, placing at least one scenario just above the severe threshold.
- **Override rate**: Override generation probability is `override_rate_warn × (0.9 + rand() × 0.2)`, landing near the warn boundary.

This means: if an owner sets tighter thresholds (e.g. `psi_stable = 0.06` instead of `0.10`), the generated data respects those limits — the warn-band target is computed from the configured values, not hardcoded constants.

---

## 4. Test type / category combinations using the generic fallback

The following combinations use the generic override log template because no tailored generator exists:

| Category                              | Test type                         | Reason                                                                        |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| CECL                                  | sensitivity, benchmarking, stress | No separate dataset; these use the loan tape via `resolveCompatibleTestTypes` |
| BSA/AML                               | sensitivity                       | Not a standard AML test; generic fallback                                     |
| ALM                                   | override                          | Not standard for ALM; generic fallback                                        |
| Market Risk, Capital, PPNR, Liquidity | All                               | No category-specific template; full generic fallback                          |

When generic fallback is used, a warning is recorded in `DataGenResult.warnings` and the result status is `partial`. The Workbench can still run all engines against the generic data.

---

## 5. State machine

Located at `src/lib/model-onboarding/transitions.ts`. All 7 states and 8 actions are tested in `transitions.test.ts`.

```
DRAFT → submit → AWAITING_REVIEW
AWAITING_REVIEW → approve → APPROVED
AWAITING_REVIEW → request_changes → CHANGES_REQUESTED
AWAITING_REVIEW → reject → REJECTED
CHANGES_REQUESTED → resubmit → AWAITING_REVIEW
APPROVED → data_gen_complete → READY
APPROVED → data_gen_failed_action → DATA_GEN_FAILED
DATA_GEN_FAILED → retry → APPROVED
REJECTED → (terminal)
READY → (terminal)
```

Illegal transitions throw: `"Illegal onboarding transition: cannot perform X from state Y"`.

---

## 6. Permission wall

- `canAddModel: true` for `owner` role only
- `canApproveModel: true` for `mrm` role only
- `AddModelSheet` renders a permission-wall screen if `!canAddModel`
- "Add Model" button in inventory and monitor pages wrapped in `{canAddModel && ...}`
- MRM Governance "Pending Review" tab only renders when `canApproveModel` is true

---

## 7. Files created / modified

### New files

- `src/types/index.ts` — extended with `ModelOnboardingStatus`, `OnboardingAction`, `ThresholdField`, `TestThresholdSchema`, `ThresholdConfig`, `ModelSubmission`; `Permissions` extended with `canAddModel`, `canApproveModel`
- `src/lib/data/test-threshold-schema.ts` — threshold registry for all 8 test types
- `src/lib/model-onboarding/transitions.ts` — state machine
- `src/lib/model-onboarding/transitions.test.ts` — 36 tests covering all states + illegal transitions
- `src/lib/model-onboarding/data-gen.ts` — synthetic data generation engine
- `src/lib/model-onboarding/data-gen.test.ts` — 12 tests (determinism, completeness, threshold awareness)
- `src/lib/store/submissions-context.tsx` — React context for submission lifecycle
- `src/components/ui/ThresholdField.tsx` — labeled numeric input with range bar
- `src/components/ui/DataGenProgressBadge.tsx` — animated progress / ready / retry badge
- `src/components/features/add-model/TestConfigPanel.tsx` — expandable per-test config panel
- `src/components/features/add-model/SubmissionStatusCard.tsx` — owner-side status card
- `src/components/features/governance/MrmReviewPanel.tsx` — two-column MRM review sheet

### Modified files

- `src/lib/repo/index.ts` — added `getDataset(modelId, testType)`, `saveDataset`, `getSubmission`, `saveSubmission`, `listSubmissions`, `deleteSubmission`
- `src/hooks/usePermissions.ts` — added `canAddModel`, `canApproveModel`
- `src/components/features/add-model/AddModelSheet.tsx` — complete rewrite as multi-step ModelOnboardingDrawer
- `src/app/(app)/governance/page.tsx` — added "Pending Review" tab with `MrmReviewPanel`
- `src/app/(app)/inventory/page.tsx` — added pending submissions pre-list + "Add Model" button (owner-gated)
- `src/app/(app)/monitor/page.tsx` — gated "Add Model" button behind `canAddModel`
- `src/app/(app)/layout.tsx` — added `SubmissionsProvider`
