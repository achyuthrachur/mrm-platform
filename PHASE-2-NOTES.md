# Phase 2 — Notes, Decisions, Deviations

## Design decisions

- **DataTable**: Custom React table (useState + useMemo sort) rather than full TanStack Table. PRD says "use TanStack Table if helpful" — the lighter approach keeps Phase 2 self-contained and avoids boilerplate. Column definitions + client-side sort still satisfy the requirements. TanStack can be adopted in Phase 4 if needed.

- **Recharts on VizCard**: All charts live inside `VizCard` (indigo `#011E41` background) per Addendum §3.2. White labels/axes, brand palette data series. `ChartTheme.ts` centralizes all chart style tokens.

- **Risk heat map**: Custom CSS grid (5×5) rather than a chart library — gives precise control over cell colors (heat zone shading by likelihood × impact score), model button placement, and hover tooltip. No charting overhead.

- **Test health chips**: Sourced from `TEST_HISTORY` (seed data) for the 4 showcase models. Other models show `—` chips where no history exists. Will update live when runs are added (Phase 3 run store integration).

- **Owner scope**: `Sarah Chen` is the default owner role. She owns 4 models (CECL-001, ALM-001, CECL-002, CECL-003). The PRD references "3 of 15" from the wireframe — the number differs because our model data was designed around her owning the CECL cluster.

## Acceptance criteria status

| #   | Criterion                                                                       | Status |
| --- | ------------------------------------------------------------------------------- | ------ |
| 1   | Inventory renders all models; search + category + status + tier filters compose | ✅     |
| 2   | Owner sees assigned models with scope badge; MRM sees all + Owner column        | ✅     |
| 3   | Model detail shows all fields incl. monPlan; deep links work                    | ✅     |
| 4   | Dashboard KPIs, donut/bar charts, heat map, test-health chips derive from data  | ✅     |
| 5   | Charts honor brand data-viz rules; heat-map tooltips work; chips deep-link      | ✅     |
| 6   | Lint/typecheck/test clean; `PHASE-2-NOTES.md` written                           | ✅     |
