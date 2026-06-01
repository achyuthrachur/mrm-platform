# PRD — Phase 3: Compute Engines, Formula Transparency & Testing Workbench

**Depends on:** Phases 1, 2. **Inherits:** Master Plan §2 (no-fake-math rule), §3, §5, §6.
**Revised** to lock the exact 16 computed (model, test) pairs. **Execute in two sub-stages**
(3A: engine core + Source-to-Model/PSI/CSI; 3B: backtesting/benchmarking/sensitivity/stress/override).
**Visual treatment of the Workbench and FormulaPanel follows the chosen design direction in
`PRD-09-ADDENDUM-decisions.md` §3 — do not reuse the wireframe's look.**

---

## Objective

Build a real, tested TypeScript validation-test engine; surface a **formula-transparency panel** for
every computed test; build the **Testing Workbench** where a user selects a model, picks a test,
runs it against generated (or uploaded) data, and sees genuine outputs.

## Core principle (non-negotiable)

Every engine returns `computed: true` + a populated `FormulaTrace`. The FormulaPanel renders **only**
when `computed: true`. Non-listed (model, test) pairs fall back to the illustrative result
(`computed:false`) shown with a visible "Illustrative — not computed from live data" badge and **no**
formula panel. Never invent a formula for an illustrative result.

---

## The locked compute matrix (build engines for exactly these 16)

| Model                            | Tests (computed)                                        | Planted verdict               |
| -------------------------------- | ------------------------------------------------------- | ----------------------------- |
| **CRE PD** (CECL)                | Source-to-Model · PSI · Backtesting · Stress            | warn · warn · warn · pass     |
| **Transaction Monitoring** (AML) | Source-to-Model · Backtesting · Benchmarking · Override | **fail** · pass · warn · pass |
| **NII Sensitivity** (ALM)        | Backtesting · Sensitivity · Stress · Source-to-Model    | pass · warn · warn · pass     |
| **Card Fraud** (Fraud)           | Backtesting · PSI · CSI · Benchmarking                  | pass · warn · pass · pass     |

This yields every test type, each model a distinct flavor, and a verdict spread (≥1 fail, several
warns, several pass) so Phase 5's flag-for-review / create-finding flows have real material. The AML
Source-to-Model **fail** (ACH-return gap) is the canonical "failed test → finding" demo path.

---

## Scope (in)

### A. Engine architecture (`src/lib/engines/`)

Each engine: pure `(inputs) => TestResult`, one file + colocated `*.test.ts` with **known-answer
fixtures**. Registry `engines/index.ts` maps `(modelId, testType) -> engine | null`. Shared
`engines/stats.ts`: mean, std, RMSE, MAPE, bias, percentile rank, binning, PSI term,
Gini/accuracy-ratio, and **ROC/AUC** (needed for fraud) — each unit-tested.

### B. Engines (real math + FormulaTrace)

1. **Source-to-Model** — port `runStmReconciliation` to TS. Counts, matched/missing/phantom,
   completeness %, column diff, numeric discrepancies (|Δ|>0.0005), text mismatches. Trace:
   completeness = matched/source×100; ref SR 11-7 §I.D.
2. **PSI / CSI** — port `computePsiCsiResult`. PSI termᵢ=(cPctᵢ−bPctᵢ)·ln(cPctᵢ/bPctᵢ); PSI=Σ. CSI =
   per-variable PSI. Threshold-override aware. Trace: per-bin baseline%/current% table + summed PSI;
   ref SR 26-2 §II.D.
3. **Backtesting** — four flavors over generated data:
   - CRE PD: bias, MAPE, RMSE, directional accuracy, **Gini/AR** from score-vs-default.
   - AML: precision, recall, alert→SAR rate, FP rate.
   - NII: MAPE, bias, directional accuracy over the 8-quarter series.
   - Fraud: precision, recall, **AUC (ROC)**.
     Trace shows the active formula (e.g. MAPE=(1/n)Σ|aᵢ−pᵢ|/|aᵢ|; AUC via rank-sum), n, and series;
     ref SR 11-7 §II.B.
4. **Benchmarking** — deviation + percentile rank vs peer array; `lowerIsBetter` support (LGD/FP).
   percentile = rank/(n−1); deviation = subject − peerMedian; ref SR 11-7 §I.A.
5. **Sensitivity** — variance-share decomposition (tornado): shareᵢ=|effectᵢ|/Σ|effect|; flag any
   single input >50% variance. For NII compute betas from `almPositions`. Ref SR 11-7 §II.C.
6. **Stress** — apply scenario set to baseline: scenarioValue = baseline×multiplierₛ (or additive bps
   for NII); verdict = no scenario breaches policy cap; show deltas. Ref SR 11-7 §I.E.
7. **Override** — overrideRate = overrides/reviewed; conservative %, documentation %; thresholds
   (<30% / >80% / >90%). Ref SR 11-7 §II.C.

### C. FormulaPanel (`features/workbench/FormulaPanel.tsx`)

Renders a `FormulaTrace`: equation, inputs table, ordered intermediate steps with values, final
result, regulatory reference. Collapsible. Visible only when `computed:true`. "Copy formula + inputs"
affordance (feeds Phase 4 export). **Style per the chosen design direction, not the wireframe.**

### D. Testing Workbench (`/workbench`)

- **Model selector** (searchable, category-filtered).
- **Test runner**: test picker for the model's available tests; **Run** button gated by
  `usePermissions().canRunTests` (owners run; MRM cannot run owner tests — disabled with a stated
  reason); honest short loading state; render result via Phase 4 components + FormulaPanel.
- **Data-source control**: "Generated demo dataset" (default) or **upload CSV** for tests that accept
  it (Source-to-Model source+model; PSI/CSI portfolio). Uploaded data flows through the same engine.
  Port the wireframe's drag-drop + CSV parsing logic (not its visual styling).
- Persist each run to the run store; results/history/dashboard test-health update.

## Out of scope

- Export + run-history UI (Phase 4) — but runs persist here.
- Create-finding-from-run UI (Phase 5) — but fail/warn runs carry enough context (modelId, testType,
  run id, failing metrics) for Phase 5.

## Acceptance criteria

- [ ] Engines exist for exactly the 16 listed pairs; each is pure with passing known-answer tests; the registry returns `null` (→ illustrative) for everything else.
- [ ] Source-to-Model and PSI/CSI reproduce the wireframe's numbers on identical input (regression-locked).
- [ ] Backtesting/benchmarking/sensitivity/stress/override compute from generated data; the FormulaTrace `result` reconciles to the displayed metric (asserted in tests).
- [ ] Each pair's verdict matches the planted verdict map.
- [ ] FormulaPanel renders inputs/steps/result/reference only for computed results; illustrative results show the badge and no panel.
- [ ] Workbench run flow works end-to-end incl. CSV upload (Source-to-Model + PSI/CSI) and permission gating with a stated reason.
- [ ] Every run persists and is retrievable; dashboard test-health reflects new runs.
- [ ] Visuals follow the chosen design direction (addendum §3), not the wireframe.
- [ ] Lint/typecheck/test clean; `PHASE-3-NOTES.md` confirms the 16 computed pairs, datasets used, and achieved-vs-planted verdicts.
