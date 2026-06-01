# PRD — Phase 6: Monitoring Calendar, Add-Model Workflow, Governance & Macro Panel

**Depends on:** Phases 1, 3. **Inherits:** Master Plan §3, §6.

---

## Objective

Build the scheduling and governance surfaces: the **Performance Monitor** (monitoring calendar with
SR-aligned schedules, due/overdue logic, test-history dots, and the macro-environment panel), the
**Add-Model drawer** with test selection + monitoring-frequency configuration + the MRM
frequency-approval workflow, and the **Governance** tab (approval pipeline, MRM committee, policy
exceptions).

---

## Scope (in)

### A. Performance Monitor (`/monitor`)

1. **Macro-environment panel** — port `fetchMacroData()` (World Bank / BLS best-effort) with the
   `MACRO_FALLBACK` cached values; **never block UI** on the fetch (render fallback immediately, swap
   to live if it resolves, badge each tile live/cached). Four tiles (GDP, unemployment, CRE
   delinquency, 10-yr Treasury) with drill-down quarterly history (`MACRO_QUARTERLY`) and a trend
   chart (Recharts). Put the fetch behind an API route or a client effect with a hard timeout.
2. **Model selector** (reuse Phase 2 list) → **monitoring calendar** for the selected model.
3. **Monitoring calendar** — from `getMonitoringCalendar(model)`: each scheduled test with its SR
   reference, frequency, threshold text, last run, next due, and **status** (Current / Due / Overdue)
   computed from `getToday()` (Phase 1 clock). Render the **test-history dots** (`TEST_HISTORY`)
   showing prior-quarter verdicts; the latest dot is live and updates when the test is run in the
   Workbench. Each calendar row links to run that test in the Workbench (deep-link with model+test
   preselected). Due/overdue counts roll up to the dashboard.

### B. Add-Model drawer (`features/add-model/`)

Port the wireframe's `amd-` drawer as a shadcn `sheet`:

1. **Model fields** form (`react-hook-form` + zod): id (generated/editable), name, category, sub,
   tier (1/2/3 selector), owner, framework, method, sources, description, limitations, monitoring
   frequency, etc. Mark created models `userDefined: true`.
2. **Test selection** — from `MODEL_TEST_MENU[category]`, multi-select the SR 26-2 tests to monitor;
   each selected test gets a default frequency (editable inline via the freq selector). Persisted as
   `selectedTests`.
3. **Frequency-approval workflow** — changing a test's monitoring frequency away from its default
   requires MRM approval: owner submits a frequency change with a justification → it lands in
   `pendingFrequencies` → MRM approves/rejects → on approval it moves to `approvedFrequencies` and the
   calendar reflects it. Persist all three states via the storage adapter; audit every step
   (reuse Phase 5 audit pattern). Until approved, the calendar shows the default frequency with a
   "pending change" indicator.
4. On save, the new model appears in inventory (owner-scoped), its calendar builds from `selectedTests`
   via the Phase 1 `getMonitoringCalendar` user-defined branch, and it is runnable in the Workbench
   (engines fall back to illustrative where no dataset exists — labeled honestly).

### C. Governance (`/governance`)

Port the wireframe's governance content as real components reading from data/state:

1. **Approval pipeline** — the 6-step workflow (Developer → Owner attestation → Independent validation
   → MRM review → Committee → Implementation) and the current queue (models awaiting steps). Steps are
   data-driven from model `status`/approval fields; actions (submit to MRM, view package) write audit
   entries and advance state where appropriate.
2. **MRM committee** — next meeting, agenda items, last-meeting summary (seed data; editable counts
   derive from findings/approvals where sensible).
3. **Policy exception log** — port the active exception(s); a "Renew" action updates the exception
   record + audit.

## Out of scope

- Dependency graph (Phase 7). Real auth on the approval roles (still demo `usePermissions()`).

---

## Acceptance criteria

- [ ] Macro panel renders fallback instantly, upgrades to live when available, badges each tile, and drill-down history charts work — fetch never blocks or breaks the page on failure/timeout.
- [ ] Calendar shows correct Current/Due/Overdue per `getToday()`; history dots render; latest dot updates after a Workbench run; rows deep-link to the Workbench with model+test preselected.
- [ ] Add-Model drawer creates a `userDefined` model with selected tests; it appears in inventory and is runnable; calendar builds from its tests.
- [ ] Frequency change → pending → MRM approve/reject → approved is fully persisted and audited; calendar reflects approved frequency; pending state is visible.
- [ ] Governance pipeline/committee/exceptions render from data; actions write audit entries; "Renew" updates the exception.
- [ ] Lint/typecheck/test clean; due/overdue + frequency-approval state machine unit-tested; `PHASE-6-NOTES.md` written.
