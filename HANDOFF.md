# HANDOFF — Model Onboarding Workflow (PRD-12)

**Status:** Complete ✅  
**Date:** 2026-06-10

## What was just done

PRD-12 fully implemented: five-stage Model Onboarding workflow end-to-end.

### Core deliverables

1. **State machine** (`transitions.ts`) — 7 states, 8 actions, illegal transitions throw, 36 tests green
2. **Synthetic data engine** (`data-gen.ts`) — real mulberry32 PRNG, same modelId → identical datasets, threshold-aware calibration; 12 tests green
3. **Permission wall** — `canAddModel` owner-only; MRM sees no affordance anywhere
4. **Multi-step drawer** (`AddModelSheet.tsx` rewrite) — 4 sections: Identity → Tests → Configure → Review/Submit; draft persistence; resubmit flow with MRM notes callout
5. **MRM review queue** — "Pending Review" tab in Governance (MRM-only); `MrmReviewPanel` two-column sheet; Approve/Request Changes/Reject with preconditions enforced
6. **Post-approval flow** — model written to inventory immediately with "Data generating…" badge; engine runs non-blocking; `DataGenProgressBadge` shows 0→25→50→75→100%; toast on ready; retry on failure
7. **PRD-12-NOTES.md** written

### Quality

- 217/217 tests pass
- TypeScript: clean (no errors)
- ESLint: clean (no errors)

## What to do next

- **Engine threshold integration**: The calculation engines still use hardcoded thresholds. The next step is to thread `ThresholdConfig` through the engine registry so verdicts are computed against the model-owner-configured values.
- **Workbench integration**: `getDataset(modelId, testType)` in repo now supports user-defined models; the Workbench `TestRunner` should call the async form.
- **Supabase schema**: Add `model_submissions` table if cloud persistence is needed.

## Files touched

- NEW: `src/lib/model-onboarding/transitions.ts`, `transitions.test.ts`, `data-gen.ts`, `data-gen.test.ts`
- NEW: `src/lib/data/test-threshold-schema.ts`
- NEW: `src/lib/store/submissions-context.tsx`
- NEW: `src/components/ui/ThresholdField.tsx`, `DataGenProgressBadge.tsx`
- NEW: `src/components/features/add-model/TestConfigPanel.tsx`, `SubmissionStatusCard.tsx`
- NEW: `src/components/features/governance/MrmReviewPanel.tsx`
- NEW: `PRD-12-NOTES.md`
- MODIFIED: `src/types/index.ts`, `src/lib/repo/index.ts`, `src/hooks/usePermissions.ts`
- MODIFIED: `src/components/features/add-model/AddModelSheet.tsx` (full rewrite)
- MODIFIED: `src/app/(app)/governance/page.tsx`, `inventory/page.tsx`, `monitor/page.tsx`, `layout.tsx`

## Verify command

```
npx tsc --noEmit && npx vitest run
```

Expected: 0 TS errors, 217 tests pass.
