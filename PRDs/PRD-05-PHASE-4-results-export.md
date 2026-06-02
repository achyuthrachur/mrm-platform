# PRD — Phase 4: Result Rendering, Run History & Export

**Depends on:** Phase 3. **Inherits:** Master Plan §3, §6, and **Addendum §3 ("Light Premium
Crowe")** — results use the Phase 0 kit; charts on indigo `VizCard` panels; the PDF template uses the
indigo header + light body, Helvetica Now, tabular figures. **Skills:** also load `pdf`, `xlsx`
(and `docx` only if a Word report variant is requested) for export generation.

---

## Objective

Turn raw `TestResult` objects into a polished, reusable result presentation; add a run-history view;
and let users **export results** to CSV, XLSX, and PDF as standalone, brand-correct artifacts.

## Why now

Phase 3 produces results and persists runs but renders them minimally. This phase makes results
presentation-grade and shareable — the "see the outputs / export results" requirements.

---

## Scope (in)

### A. Result presentation components (`features/results/`)

Build a single `<TestResultView result={TestResult} />` composed of:

1. **Verdict header** — verdict chip (pass/warn/fail), traffic-light, data-confidence badge, period,
   run date, and the `computed` vs `illustrative` badge.
2. **Metrics table** — `MetricRow[]` with per-row status icon + color **and** text (no color-only),
   threshold column, and notes. Reuse across all test types.
3. **Charts (Recharts)** keyed by `chartType`, porting the wireframe's visuals:
   `backtest-pd` / `quarterly` (predicted vs actual line), `benchmark` (subject-vs-peers bar with the
   subject highlighted + peer-median marker + percentile callout), `tornado` (sensitivity bars),
   `scenario` (stress bars vs baseline + policy cap line), `psi-bar` / `csi-bar` (baseline vs current
   distribution), `deposit-beta` (grouped bars + range bands). One `<ResultChart>` switch component.
4. **Narrative blocks** — findings list, recommendation, and where present: data gaps, proxies used,
   compensating controls, data note, "improve with" — styled as in the wireframe (these convey the
   data-confidence story and must survive the port).
5. **FormulaPanel** (from Phase 3) embedded when `computed`.
6. **STM-specific result** — port the rich STM render (record-count reconciliation tiles, data-lineage
   pipeline, missing/phantom record chips, field-mapping analysis, discrepancy table, recommendation).

### B. Run history (`features/results/RunHistory.tsx`)

Per model+test, list prior runs from the run store with timestamp, verdict, key metric, and who/what
ran it (audit actor). Selecting a run re-renders its `TestResultView`. Surface run history both in the
Workbench (right rail) and on the model detail page.

### C. Export

Provide an `exportResult(result, format)` utility + UI controls on every result view.

1. **CSV** — metrics table + header metadata (model, test, verdict, period, run date) + the formula
   inputs/steps when computed. Client-side blob download.
2. **XLSX** (per `xlsx` skill) — a workbook: a summary sheet (verdict/metadata), a metrics sheet, a
   formula-trace sheet (inputs + steps + result), and a raw-data sheet (the dataset rows the engine
   used, when feasible). Brand the header row.
3. **PDF** (per `pdf` skill) — a one/two-page report: Crowe header (indigo + white wordmark), model +
   test identity, verdict/traffic-light/data-confidence, metrics table, the chart (render to image),
   findings + recommendation, the formula trace, data sources, and a "not for distribution / demo"
   footer. Must be readable B/W (don't rely on color alone).
4. **Bulk export (optional, MRM)** — export all latest runs for a model, or a portfolio summary, as a
   single XLSX/PDF. Build only if time allows; otherwise stub disabled with a TODO note.

> Generation should run client-side where practical; if PDF/XLSX generation is heavier, use a Next API
> route (`app/api/export/route.ts`) that accepts the serialized result and returns the file — keep the
> response shape and zod validation per Master Plan §3.

## Out of scope

- Findings workflow (Phase 5) and calendar/governance (Phase 6).

---

## Acceptance criteria

- [ ] `<TestResultView>` renders every `chartType`, the metrics table, narrative blocks, and (when computed) the formula panel — in both themes.
- [ ] STM rich result fully ported (lineage, missing/phantom, discrepancies).
- [ ] Run history lists persisted runs and re-renders any selected run.
- [ ] CSV, XLSX, and PDF exports download successfully and contain the verdict, metrics, formula trace (when computed), and data sources; PDF is brand-correct and legible in grayscale.
- [ ] Exported numbers match the on-screen result exactly (asserted by a test on the CSV/XLSX serializer).
- [ ] Lint/typecheck/test clean; `PHASE-4-NOTES.md` records export library choices and any client-vs-API generation split.
