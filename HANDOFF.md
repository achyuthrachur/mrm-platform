# MRM Platform — Handoff

## Status

Phase 3 complete. Ready for Phase 4.

## What was just done (Phase 3)

Real compute engines, FormulaPanel, and Testing Workbench.

**Engines** (`src/lib/engines/`):

- `stats.ts` — mean, std, RMSE, MAPE, PSI, AUC/Gini, percentileRank, varianceShares (all unit-tested)
- `source-to-model.ts` — CRE (warn), AML (fail), ALM (pass)
- `psi-csi.ts` — CRE PSI (warn), Fraud PSI (warn), Fraud CSI (pass)
- `backtesting/` — CRE (warn), AML (pass), NII (pass), Fraud (pass)
- `benchmarking.ts` — AML (warn), Fraud (pass)
- `sensitivity.ts` — NII (warn)
- `stress.ts` — CRE (pass), NII (warn)
- `override.ts` — AML override (pass)
- `index.ts` — registry with all 16 computed pairs

All 16 planted verdicts verified by `engines.test.ts`.

**UI**:

- `FormulaPanel` — collapsible, copy-to-clipboard, shows equation/inputs/steps/result/reference
- `TestRunner` — run button (permission-gated), data source toggle, result view, illustrative badge
- `/workbench` — searchable model selector, test picker, deep-link support (`?model=&test=`)

## What to do next (Phase 4)

Read `PRDs/PRD-05-PHASE-4-results-export.md`. Build:

1. `<TestResultView result={TestResult} />` — unified result rendering (verdict header, metrics, charts, FormulaPanel, narrative blocks, STM-specific rich view)
2. `RunHistory` — per model+test, list prior runs from run store
3. Export: `exportResult(result, format)` → CSV, XLSX, PDF downloads
4. Wire into Workbench + model detail page

## Branch / commit

- `feature/phase-3-engines-workbench` · 3c034f1

## Verify

```
npm run test    # 139/139 pass
npm run lint    # clean
npm run dev     # /workbench → select CECL-2024-001 → Source-to-Model → Run → see FormulaTrace
```
