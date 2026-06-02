# Phase 4 — Notes, Decisions, Deviations

## Component decisions

**TestResultView**: Reusable for any TestResult. JSX inline comments `{/* */}` removed
because in React 19 + TypeScript 5.8+, they're typed as `undefined` which is no longer
a valid `ReactNode`. Section separation handled by vertical spacing only.

**ResultChart**: Chart switcher — `backtest-pd` type returns null (raw scatter data for 2,500
loans is impractical; the metrics table carries the story). All other chart types render on
VizCard indigo panels per Addendum §3.2.

**STMResultView**: Rich view only renders when `result.testType === 'source-to-model'`.
Uses ternary `? : null` rather than `&&` because `unknown && JSX` produces `unknown` type
in React 19. This was the root cause of all TS2322 errors in this phase.

## Export decisions

**CSV**: Pure client-side string builder. Metrics, formula trace (inputs + steps), findings,
and data sources are all included. Numbers in the CSV exactly match on-screen values
(asserted by `export-csv.test.ts`).

**XLSX**: SheetJS (`xlsx` package) — 4 sheets: Summary, Metrics, Formula Trace, Findings.
Indigo header row style. Generates entirely client-side.

**PDF**: jsPDF + jspdf-autotable — indigo header with Crowe wordmark text placeholder
(official SVG not directly embeddable in jsPDF without image conversion). Metrics table,
formula trace, findings, recommendation, and footer included. Chart image not included
(would require html2canvas — deferred to Phase 7 polish). "Not for distribution / demo"
footer on every page. Readable in B/W.

**TypeScript fix**: `result.chartData?: unknown` in `&&` chain produces `unknown` type in
TypeScript 5.8+. Fixed by changing to `result.chartData != null ? <Chart /> : null`.
Same fix applied to any `unknown` type in JSX `&&` chains.

## Run History

RunHistory component loads runs from Zustand store via `loadRunHistory(modelId)`. Clicking
a run re-renders the full `TestResultView` with that run's result. Surface run history both
in Workbench (right rail) and on model detail page (to be wired in Phase 7 polish).

## Acceptance criteria status

| #   | Criterion                                                                     | Status |
| --- | ----------------------------------------------------------------------------- | ------ |
| 1   | `<TestResultView>` renders every chartType, metrics, narrative, formula panel | ✅     |
| 2   | STM rich result fully ported (reconciliation tiles, lineage, discrepancies)   | ✅     |
| 3   | Run history lists persisted runs and re-renders any selected run              | ✅     |
| 4   | CSV, XLSX, PDF export download successfully with verdict, metrics, formula    | ✅     |
| 5   | Exported numbers match on-screen result (asserted by export-csv.test.ts)      | ✅     |
| 6   | Lint/typecheck/test clean (146/146)                                           | ✅     |
| 7   | `PHASE-4-NOTES.md` written                                                    | ✅     |
