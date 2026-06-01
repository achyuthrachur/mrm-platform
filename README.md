# MRM Platform

A Model Risk Management monitoring platform for banking/financial-services model governance, aligned to SR 11-7 / SR 26-2 and related frameworks.

**Tenant:** Heartland Commerce Bank (synthetic demo)

## Stack

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Motion · Recharts · Vitest

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run test       # Vitest unit tests
npm run build      # Production build
```

## Phases

| Phase                     | Status      | Delivers                                                 |
| ------------------------- | ----------- | -------------------------------------------------------- |
| 0 — Foundation            | ✅ Complete | Design system, layout shell, routing                     |
| 1 — Data layer            | Pending     | Domain types, seed data, generators, storage adapter     |
| 2 — Inventory + Dashboard | Pending     | Model inventory table, KPI tiles, charts, heat map       |
| 3 — Compute engines       | Pending     | Real validation engines, formula transparency, workbench |
| 4 — Results + Export      | Pending     | Result views, run history, CSV/XLSX/PDF export           |
| 5 — Findings              | Pending     | Findings tracker, flag-for-review, audit trail           |
| 6 — Calendar + Governance | Pending     | Monitoring calendar, add-model, governance pipeline      |
| 7 — Polish + Deploy       | Pending     | Dependency graph, a11y, CI/CD, production deploy         |

## Design system

Light Premium Crowe — canvas `#F4F5F8`, white surfaces, Crowe Indigo `#011E41` ink, Amber `#F5A800` accent, indigo VizCard panels for charts. All colors via CSS custom properties; no literals in components.

## Reference

- Wireframe: `reference/mrm-demo.html` (functional and math reference only — not the visual target)
- PRDs: `PRDs/`
