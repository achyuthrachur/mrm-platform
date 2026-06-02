# MRM Platform — Handoff

## Status

ALL 8 PHASES COMPLETE. The platform is feature-complete.

## Summary of what was built

| Phase                     | Branch                             | Delivers                                                              |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| 0 — Foundation            | phase-0-foundation                 | Design system, component kit, shell, 7 placeholder routes             |
| 1 — Data Layer            | phase-1-data-layer                 | 16 models, 12 findings, 5 generators (74k rows), storage, repo, state |
| 2 — Inventory + Dashboard | phase-2-inventory-dashboard        | Model table + filters, dashboard with charts + heat map               |
| 3 — Engines + Workbench   | phase-3-engines-workbench          | 16 computed engines, FormulaPanel, Testing Workbench                  |
| 4 — Results + Export      | phase-4-results-export             | TestResultView, run history, CSV/XLSX/PDF export                      |
| 5 — Findings              | phase-5-findings                   | Findings tracker, flag-for-review, state machine, create-from-run     |
| 6 — Calendar + Governance | phase-6-calendar-governance        | Monitoring calendar, Add-Model, freq-approval, Governance             |
| 7 — Polish + Deploy       | phase-7-dependencies-polish-deploy | Dependency graph, Reset Demo, responsive, CI/CD                       |

## Current test count

181/181 tests pass. Lint clean. Typecheck clean.

## To run locally

```
npm install
npm run dev   # http://localhost:3000
```

## To deploy to Vercel

1. Run `vercel link` in the project root
2. Set GitHub secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
3. Push to main — CI pipeline runs, then Vercel deploys automatically

## Auth swap-point (when going to production)

See PHASE-7-NOTES.md. Replace RoleProvider source with NextAuth/Clerk session;
replace getStorageAdapter() factory with PrismaAdapter. All UI and engines unchanged.

## Known remaining gaps

- openFx counter not updated when creating finding from run
- Chart images missing from PDF export
- Governance pipeline actions use local React state (not persisted)
- Axe automated a11y scan and Lighthouse scores require a running browser
