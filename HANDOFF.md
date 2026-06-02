# MRM Platform — Handoff

## Status

Phase 1 complete. Ready for Phase 2 (Model Inventory + Dashboard).

## What was just done (Phase 1)

Full data layer:

- **16 models** in `src/lib/data/models.ts` (4 showcase + 12 illustrative)
- **12 findings** in `findings.ts`
- **Monitoring calendar** builder + TEST_LABELS + MODEL_TEST_MENU
- **Test history** dots for all showcase models (prior-quarter verdicts)
- **Macro** fallback + quarterly series
- **Dependencies** nodes/edges + peer bank arrays
- **Illustrative results** (~30 entries, computed:false, no FormulaTrace)
- **5 generators** (mulberry32 PRNG, deterministic): creLoanTape (2,500), amlTransactions (25,000), amlOverrideLog (12,000), fraudScoredTxns (30,000), almPositions (5,000)
- **CRE model copy** with planted gaps (6 missing + 8 discrepancies)
- **Authored reference data**: NII_BACKTEST_SERIES, NII_RATE_SHOCK_SCENARIOS, NII_SENSITIVITY_INPUTS, CRE_STRESS_SCENARIOS
- **Clock seam**: `getToday() = 2026-04-07`; due/overdue helpers
- **StorageAdapter** (IndexedDB → localStorage → Memory); `resetDemoData()`
- **Data-access repo**: getModels, getFindings, getCalendar, getRunHistory, saveRun, etc.
- **State stores**: `useRunStore` (Zustand), `useModels`, `useFindings`, `useFlags` (React Context)
- `ModelsProvider`, `FindingsProvider`, `FlagsProvider` wired into `(app)/layout.tsx`

## What to do next (Phase 2)

Read `PRDs/PRD-03-PHASE-2-inventory-dashboard.md` and build:

1. **Model Inventory** (`/inventory`) — filterable table, role-scoped (owner sees only their 3 models), model detail page, quick actions
2. **Dashboard** (`/dashboard`) — HITL banner, KPI stat tiles (from repo data), charts (Recharts on VizCard indigo panels), risk heat map, test-health chips

Use the Phase 0 component kit (`SurfaceCard`, `VizCard`, `StatTile`, `DataTableShell`, badges). No hardcoded totals — every number derives from the repo.

## Files touched this session (Phase 1 additions)

All under `src/lib/` — data, datasets, repo, storage, store. Plus `(app)/layout.tsx` for providers.

## Branch / commit

- Branch: `feature/phase-1-data-layer`
- Commit: 8cf3a15

## Verify command

```
npm run dev          # http://localhost:3000 (all 7 routes still work)
npm run lint         # ✅ clean
npm run typecheck    # ✅ clean
npm run test         # ✅ 80/80 tests pass
npm run build        # should pass (no new UI)
```
