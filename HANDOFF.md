# MRM Platform — Handoff

## Status

Phase 0 complete. Ready for Phase 1.

## What was just done (Phase 0)

Full Next.js 15 scaffold with the Light Premium Crowe design system:

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`
- `src/styles/globals.css` — full token system (canvas/surface/surface-viz/ink/accent/status/shadows/radius), dark theme via `data-theme`
- Font: Plus Jakarta Sans Variable via `@fontsource-variable/plus-jakarta-sans` (Google Fonts blocked by corporate proxy — recorded in PHASE-0-NOTES.md)
- Component kit: `StatTile`, `SurfaceCard`, `VizCard` (indigo), `DataTableShell`, `StatusBadge`, `TierBadge`, `VerdictChip`, `TrafficLight`, `Eyebrow`, `Button`
- Shell: `AppHeader`, `AppSidebar`, `AppFooter`
- Providers: `ThemeProvider`, `RoleProvider` (both with localStorage persistence + OS defaults)
- `usePermissions()` hook (owner/MRM RBAC-shaped permission sets)
- 7 placeholder routes + root redirect + `(app)/layout.tsx`
- Logo SVGs copied from Crowe-Sentinel to `public/`
- Husky + lint-staged pre-commit hook (ESLint flat config v9)
- `PHASE-0-NOTES.md` written

## What to do next (Phase 1)

Read PRD-02-PHASE-1-data-domain.md and start Phase 1: Data Layer, Domain Model & Persistence Seam.

Phase 1 delivers:

1. All remaining types in `src/types/` (SelectedTest, MonitoringCalendarEntry, etc. — many already stubbed)
2. Ported seed data modules in `src/lib/data/` (models.ts, findings.ts, monitoring-calendar.ts, test-history.ts, macro.ts, dependencies.ts, peers.ts, illustrative-results.ts)
3. Synthetic dataset generators in `src/lib/data/datasets/` (creLoanTape, amlTransactions, amlOverrideLog, fraudScoredTxns, almPositions)
4. Data-access layer `src/lib/repo/`
5. StorageAdapter (`IndexedDbAdapter`, `LocalStorageAdapter`, `MemoryAdapter`) in `src/lib/storage/`
6. App state store (React Context + Zustand run store)
7. Clock seam `src/lib/clock.ts` (demo "now" ≈ 2026-04-07)

## Files touched this session

- All files under `src/`, root config files, `public/`, `reference/`, `PRDs/`
- Branch: `feature/phase-0-foundation`
- Commit: 069fe3d

## Verify command

```
npm run dev          # → localhost:3000 (redirects to /dashboard)
npm run lint         # ✅ clean
npm run typecheck    # ✅ clean
npm run test         # ✅ 23 tests pass
npm run build        # ✅ 9 routes build
```

## Known gaps / notes

- Criterion 5 (shell reads "light premium" — reviewer sign-off) is ⏳ pending your visual review
- `next lint` deprecation warning in Next.js 15 — informational only; lint is clean
- Corporate proxy blocks Google Fonts — addressed via fontsource npm package
- Multiple lockfile warning from Next.js (parent dir has a root package-lock.json) — benign
