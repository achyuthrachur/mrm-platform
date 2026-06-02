# PRD — Phase 2: Model Inventory & Dashboard

**Depends on:** Phase 1 (+ Phase 0 component kit). **Inherits:** Master Plan §3, §6, and
**Addendum §3 ("Light Premium Crowe")** — use the Phase 0 kit (`SurfaceCard`, `VizCard`, `StatTile`,
`DataTableShell`, badges). Charts live on indigo `VizCard` panels; tables/tiles are light. Do not
reuse the wireframe's look.

---

## Objective

Build the two read-heavy surfaces that prove the data layer and set the visual quality bar:
the **Model Inventory** (filterable/searchable table + model detail) and the **Dashboard**
(portfolio KPIs, charts, risk heat map, test-health overview). Both are role-aware.

## Why now

These surfaces consume Phase 1 data with no new compute, so they validate the data layer and
establish the chart/table component patterns reused everywhere later.

---

## Scope (in)

### A. Model Inventory (`/inventory`)

1. **Table** (shadcn `table`) listing models: Model ID, Name, Category, Tier badge, Status, Risk,
   Validation status, Next validation, Open findings, (MRM role only) Owner, Actions.
2. **Filters**: category pills (All / CECL / BSA-AML / ALM / Other), free-text search, status select,
   tier select. Filtering is client-side over repo data and composes (search + category + status + tier).
3. **Role scope.** Owner sees only their assigned models (the wireframe's "3 of 15" scope —
   replicate: filter to the current owner's models, show a scope badge). MRM sees all, with an Owner
   column. Drive this from `usePermissions()` + current user identity.
4. **Expandable detail / detail page.** Clicking a row reveals model detail: description, method,
   framework, data sources, limitations, data limitations, monitoring frequency, approver/date, and
   the SR 11-7 monitoring-plan text (`monPlan`) when present. Prefer an expandable row **and** a
   dedicated `/inventory/[modelId]` route (intercepting route for the in-table expand; full page for
   deep links). Include quick actions: "Open in Workbench", "View findings", "View calendar"
   (wired to navigate; targets land in later phases — until then route to the placeholder).
5. **Tier / status / risk badges** as reusable `ui` components (used across the app).

### B. Dashboard (`/dashboard`)

1. **HITL banner** (role-aware copy) per the wireframe's review-gate banner.
2. **KPI stat tiles**: total models in scope, open findings, overdue validations, tier-1 count, etc.
   (derive from repo data; do not hardcode). Owner vs MRM show scope-appropriate counts.
3. **Charts (Recharts on `VizCard` indigo panels)** — rebuild the wireframe's visuals in the new
   system (white labels on indigo, limited brand-hue palette, tabular figures), never copy its styling:
   - Tier distribution (donut), risk distribution (bar), findings by status/severity.
   - All on indigo background, white labels, limited palette, per `crowe-brand` data-viz rules.
4. **Risk heat map** — 5×5 likelihood/impact grid placing each model by `heatX`/`heatY` with hover
   tooltips (model id, name, tier). Port the wireframe's heat-map interaction.
5. **Test-health overview** — per model, a row of small status chips (pass/warn/fail/none) summarizing
   the latest verdict per scheduled test, sourced from run history (Phase 1 store) falling back to
   `TEST_HISTORY` seed. Clicking a chip deep-links to that test in the Workbench (target built Phase 3).
6. **Live activity feed** (optional, role-aware) — port the wireframe's feed as a static-but-styled
   list seeded from recent audit entries; no fake real-time ticker required, but keep the visual.

## Out of scope

- Running tests, formulas, exports (Phase 3/4).
- Findings detail/workflow (Phase 5), calendar (Phase 6), dependency graph (Phase 7).

---

## Implementation notes

- Build one reusable `<DataTable>` wrapper (column defs, sort, client filter, empty state) reused by
  Inventory and later Findings/Calendar. Use TanStack Table under shadcn if helpful.
- Build one `<ChartCard>` + a thin Recharts theme so every chart inherits brand colors/fonts.
- Derive every number from repo/store. A reviewer must be able to change seed data and see KPIs move.

## Acceptance criteria

- [ ] Inventory table renders all models; search + category + status + tier filters compose correctly.
- [ ] Owner role shows only assigned models with a scope badge; MRM shows all + Owner column.
- [ ] Model detail shows all fields incl. `monPlan`; `/inventory/[modelId]` deep-links work.
- [ ] Dashboard KPIs, donut/bar charts, heat map, and test-health chips all derive from data (no hardcoded totals).
- [ ] Charts honor brand data-viz rules in both themes; heat-map tooltips work; test-health chips deep-link.
- [ ] Lint/typecheck/test clean; tables and charts keyboard-accessible; `PHASE-2-NOTES.md` written.
