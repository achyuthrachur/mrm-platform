# MRM Platform — Handoff

## Status

Phase 2 complete. Ready for Phase 3.

## What was just done (Phase 2)

Model Inventory + Dashboard, fully wired to Phase 1 data.

**Dashboard**: HITLBanner, KPIStrip (6 tiles), TierDonut/RiskDistributionBar/FindingsStatusBar (Recharts on VizCards), RiskHeatMap (5×5 CSS grid, hover tooltips), TestHealthTable (verdict chips → Workbench deep-links).

**Model Inventory**: Composable filters (search, category pills, tier, status), role-scope badge, sortable DataTable, model detail page with all fields + quick actions.

## What to do next (Phase 3)

Read `PRDs/PRD-04-PHASE-3-compute-engine-workbench.md`. Build in sub-stages:

**3A**: Engine architecture + stats.ts + source-to-model + PSI/CSI engines
**3B**: Backtesting (4 flavors) + benchmarking + sensitivity + stress + override engines
**Then**: FormulaPanel component + Testing Workbench UI (/workbench)

Engines: pure `(inputs) => TestResult`, colocated tests, registry `(modelId, testType) → engine | null`.

## Branch / commit

- `feature/phase-2-inventory-dashboard` · 75bb601

## Verify

```
npm run test    # 90/90 pass
npm run lint    # clean
npm run dev     # /dashboard + /inventory fully live
```
