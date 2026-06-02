# Phase 7 — Notes, Decisions, Deviations

## Dependency graph

**Layout approach**: Fixed SVG coordinates rather than force-directed layout. Force-directed requires a physics library (d3-force or similar) which would add significant bundle size and complexity for a demo app. Fixed positions create a logical left-to-right flow matching the dependency direction (inputs → processing models → capital/oversight).

**Risk propagation**: Only `feeds` edges propagate alerts (direct dependencies). `informs` and `overlaps` edges are informational and do not propagate risk signals. This is a deliberate conservative choice — a model that "informs" another doesn't necessarily invalidate it.

**Minimum width**: 760px viewport for the SVG graph. Below this, nodes overlap. The SVG is `viewBox="0 0 760 500"` with `width="100%"` so it scales, but readability degrades below ~500px. Documented in notes.

## Reset Demo

Uses `resetDemoData()` from Phase 1 (`src/lib/storage/reset.ts`). After reset, the page reloads after 1.2 seconds (gives the success toast time to show). Seeded data (MODELS, FINDINGS, TEST_HISTORY, etc.) is re-read on next page load — the seed data is in the bundle, not in IndexedDB.

## Responsive sidebar

At ≤768px, `--sidebar-width` collapses to 56px via CSS `@media` override. Nav labels are `hidden sm:block` — showing only icons at mobile. The amber indicator bar, BETA badge, and footer text are automatically hidden when labels collapse.

**Known gap**: At very small screens (<480px), the header layout can overflow. A full responsive header (hamburger menu) is a future improvement.

## CI/CD

Two GitHub Actions workflows written:

- **ci.yml**: Runs on PR targeting `main`. Installs → lint → typecheck → test → build. Blocks merge on failure.
- **deploy.yml**: Runs on push to `main`. Builds and deploys to Vercel production using stored secrets.

**To activate**: Set GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in the repo settings (values from `vercel link` + `.vercel/project.json`).

## Auth swap-point (not implemented — demo only)

Per Master Plan §2, the auth swap-point is documented here:

- **What to change**: Replace `RoleProvider`'s hardcoded role switcher with NextAuth/Clerk session
- **Seam**: `useRole()` hook — components read role from this; all permission logic flows through `usePermissions()`
- **Storage**: Replace `getStorageAdapter()` factory with `PrismaAdapter` implementing `StorageAdapter`
- **Files unchanged**: All UI components, engines, phase 5 state machines — they only consume hooks

## Accessibility notes

Items confirmed in codebase:

- `aria-label` on all interactive elements (buttons, links, inputs)
- `role="img"` with `aria-label` on SVG dependency graph
- `role="dialog" aria-modal="true"` on all overlays/sheets
- `role="navigation"` with `aria-label` on sidebar
- `role="status"` on status badges
- `role="alert"` on HITL banners
- `aria-expanded` on accordion/expandable items
- `aria-pressed` on toggle buttons and filter pills
- `aria-selected` on tab buttons
- `aria-live` region: sonner handles toast announcements
- Focus trap: modals/sheets close on Escape (`onClick` backdrop), backdrop click
- Skip-to-content link in root layout
- All images have `alt` (Crowe logos)
- Color + icon + text for all status/verdict indicators (never color alone)
- `tabular-nums` font-feature for all numeric displays

**Not run (would need browser)**: axe automated scan, Lighthouse scores. Manual verification required before production deploy.

## Performance notes

Heavy client imports are lazy-loaded:

- `/dependencies`: `DependencyGraph` via `next/dynamic(..., { ssr: false })`
- Export libs (`jspdf`, `xlsx`) load on first export click (lazy imports in `src/lib/export/index.ts`)

## Known gaps remaining

- `openFx` counter on model not updated when a finding is created from a run (Phase 5 gap)
- Run detail doesn't show "Finding created: MRF-…" reverse link
- Governance pipeline actions don't persist (local React state only)
- Chart images not included in PDF export (html2canvas not added)
- Full keyboard trap in all modals not verified automatically
- Bulk export (portfolio summary PDF/XLSX) not built

## Acceptance criteria status

| #   | Criterion                                                                                 | Status                                         |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Dependency graph renders, node click traces upstream/downstream, risk propagation visible | ✅                                             |
| 2   | BETA badge present                                                                        | ✅                                             |
| 3   | Motion/polish respects reduced-motion                                                     | ✅ (CSS prefers-reduced-motion in globals.css) |
| 4   | Responsive to tablet; sidebar collapses to icon-rail                                      | ✅                                             |
| 5   | Reset Demo wired to resetDemoData() with confirm                                          | ✅                                             |
| 6   | GitHub Actions CI pipeline on PRs; deploy on push to main                                 | ✅                                             |
| 7   | Auth swap-point documented                                                                | ✅                                             |
| 8   | Lint/typecheck/test clean (181/181)                                                       | ✅                                             |
| 9   | `PHASE-7-NOTES.md` written                                                                | ✅                                             |
