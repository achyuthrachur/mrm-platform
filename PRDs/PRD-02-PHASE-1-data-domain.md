# PRD — Phase 1: Data Layer, Domain Model & Persistence Seam

**Depends on:** Phase 0. **Inherits:** Master Plan §3, §5, §6.
**Revised** to lock the 4 showcase models, the computed-test matrix, and the synthetic-data spec
(see `PRD-09-ADDENDUM-decisions.md`).

---

## Objective

Define the typed domain, port **all** wireframe seed data into typed modules, build the synthetic
**dataset generators** the compute engines run on, and build the data-access + persistence + state
layers every feature phase consumes.

## Why now

Phases 2–7 are thin if the data and state seams are right and a nightmare if not. This is also the
only phase that changes if the stakeholder later wants a real database.

---

## Scope (in)

### 1. Domain types (`src/types/`)

Exactly as Master Plan §5, plus: `SelectedTest`, `MonitoringCalendarEntry`, `TestHistoryEntry`,
`MacroSeries`, `MacroQuarterPoint`, `DependencyNode`, `DependencyEdge`, `PeerBank`,
`FrequencyApproval`, `ThresholdOverride`, and a `Dataset<TRow>` type
(`{ id, label, rows, rowCount, generatedFromSeed?, note }`).

### 2. Ported seed data (`src/lib/data/`)

- `models.ts` — all 16 models, every field incl. `monPlan` (keep full inventory for breadth).
- `findings.ts` — all 12 findings.
- `monitoring-calendar.ts` — explicit `CECL-2024-001` schedule + per-category builder
  `getMonitoringCalendar(model)`, `getAvailableTests(model)`, `testKeyToType()`, `TEST_LABELS`,
  `MODEL_TEST_MENU`.
- `test-history.ts` — `TEST_HISTORY` prior-quarter dots.
- `macro.ts` — `MACRO_FALLBACK` + `MACRO_QUARTERLY`.
- `dependencies.ts`, `peers.ts` (peer-bank arrays for benchmarking, ~11 peers each — authored).
- `illustrative-results.ts` — the ported `TEST_RESULTS` narratives, each `computed: false`. Shown
  only for the 12 non-showcase models / non-listed tests. **Never** carry a `formula`.

### 3. Synthetic dataset generators (`src/lib/data/datasets/`) — the core of this phase

All large datasets are produced by **deterministic seeded generators** (e.g. `mulberry32(seed)`),
not committed CSVs. Each generator is pure, accepts `(seed, n)`, returns typed rows, and is unit
tested for shape, determinism (same seed → same rows), and its **planted properties**. Small
reference data (peer arrays, quarterly series, scenario parameters) are authored literals.

Build these generators (row counts are defaults, configurable):

| Generator              | Rows    | Feeds                                           | Planted properties so computed results are believable                                                                                                                                                                                   |
| ---------------------- | ------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `creLoanTape`          | 2,500   | CRE PD: Source-to-Model, PSI, Backtesting       | LTV/DSCR/property/state/dates/rate; per-loan `predictedPD` + `realizedDefault`; baseline vs current split (1,250/1,250) carries an LTV+DSCR **drift → PSI ≈ 0.12–0.18 (monitor band)**; backtest bias so **MAPE ≈ 17–18%, Gini ≈ 0.61** |
| `creLoanTapeModelCopy` | derived | CRE PD: Source-to-Model                         | copy of the tape with **~6 missing records + ~8 value discrepancies** planted (completeness ≈ 99.88% → warn)                                                                                                                            |
| `amlTransactions`      | 25,000  | AML: Source-to-Model, Backtesting, Benchmarking | amount/channel/country/date/rule + `alertFlag` + `sarOutcome`; planted to **alert→SAR ≈ 2.1%, FP ≈ 97.8%**; an **ACH-return feed gap** so Source-to-Model = **fail**                                                                    |
| `amlOverrideLog`       | 12,000  | AML: Override                                   | reviewer overrides + direction + documentation flag → **override ≈ 25%, conservative ≈ 89%, documented ≈ 94.8% (pass)**                                                                                                                 |
| `fraudScoredTxns`      | 30,000  | Fraud: Backtesting, PSI, CSI, Benchmarking      | features + model `score` + true `fraudLabel` with a planted signal → **AUC ≈ 0.93, precision ≈ 0.82, recall ≈ 0.86**; mild score drift → PSI warn                                                                                       |
| `almPositions`         | 5,000   | NII: Source-to-Model, Sensitivity, Stress       | account-level loan/deposit rows (rate, balance, repricing, type) aggregating to 47 loan / 23 deposit buckets; betas computed from this                                                                                                  |

Authored reference data: NII predicted-vs-actual 8-quarter series (**MAPE ≈ 2.2%, pass**),
rate-shock scenario set (**down-200bps ≈ −22% → warn, near policy limit**), CRE stress scenario
multipliers (all below 10% cap → pass), peer arrays, sensitivity tornado inputs.

> The planted verdict map for all 16 computed (model, test) pairs lives in the addendum. Generators
> must reproduce those verdicts; a test asserts each engine's output lands in the intended band.

### 4. Data-access layer (`src/lib/repo/`)

Async, no React: `getModels()`, `getModel(id)`, `getFindings()`, `getFinding(id)`,
`getMonitoringCalendar(modelId)`, `getRunHistory(modelId)`, `getUserModels()`,
`getDataset(id)`. Reads seed/generators merged with persisted overrides.

### 5. `StorageAdapter` (`src/lib/storage/`)

`IndexedDbAdapter` (default, via `idb`), `LocalStorageAdapter` fallback, `MemoryAdapter` (tests);
factory picks best available. Keys: `model:`, `finding:`, `run:`, `freq-approval:`, `threshold:`,
`flag:`, `prefs:`. Provide `resetDemoData()`.

### 6. App state store

React Context for cross-cutting state; **Zustand** for the run store. `useModels()`, `useFindings()`,
`useRunStore()` (`runTest`, `getLatestRun`, `getRunHistory`), `useFlags()`. All mutations append an
`AuditEntry` and write through the adapter.

### 7. Clock seam (`src/lib/clock.ts`)

Fixed, documented demo "now" (≈ 2026-04-07 — confirm against generated dates) so Due/Overdue and
history dots are deterministic. Due/overdue helpers are pure and tested.

## Out of scope

- The engines themselves (Phase 3) — but every dataset they need is generated here.
- Any UI.

## Acceptance criteria

- [ ] All types, all 16 models, 12 findings, calendars, histories, macro, peers, dependencies typed; `typecheck` clean, no `any`.
- [ ] Every generator is pure + deterministic (same seed → identical rows, tested) and produces ≥ its target row count.
- [ ] Each generator's planted property is asserted by a test (e.g. PSI lands in the monitor band; fraud AUC ≈ 0.93 ± tol).
- [ ] Repo merges seed/generated data with persisted overrides (tested via `MemoryAdapter`).
- [ ] `StorageAdapter` round-trips + survives reload; `resetDemoData()` restores seed.
- [ ] `getToday()` fixed + documented; due/overdue helpers pure + tested.
- [ ] Illustrative results ported with `computed:false`; a test asserts none carry a `formula`.
- [ ] `PHASE-1-NOTES.md` lists every generator, its seed, row count, planted properties, the demo "now", and the storage key map.
