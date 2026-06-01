# PRD — Phase 7: Dependency Graph, Polish, Accessibility, QA & Production Deploy

**Depends on:** all prior phases. **Inherits:** Master Plan §3, §6. **Skills:** load
`animation-components`, `qa`, `deployment`, `frontend`.
**Contains the auth production swap-point** (see Master Plan §2).

---

## Objective

Ship the last feature (the model **Dependency graph**), then take the whole app from "feature
complete" to "shipped product": animation/interaction polish, full accessibility pass, performance,
comprehensive test coverage, CI/CD, and a clean production deploy.

---

## Scope (in)

### A. Dependencies (`/dependencies`) — BETA

Port the wireframe's dependency network: nodes = models (border color = risk tier), edges = dependency
type (feeds / informs / overlaps). Click a node to trace upstream inputs and downstream impacts;
breached/overdue models propagate a visible risk signal to connected nodes (ERM view). Build with SVG

- Motion (or a light graph lib); data from Phase 1 `dependencies.ts`. Keep the BETA badge.

### B. Polish

1. **Animation** (Motion, per `animation-components`): route/tab transitions, drawer/sheet motion,
   result-reveal, count-up on KPI tiles, subtle hover states. Restrained and brand-appropriate — no
   gratuitous motion; respect `prefers-reduced-motion`.
2. **Empty / loading / error states** for every surface (skeletons over spinners where it reads better).
3. **Responsive**: graceful down to tablet; sidebar collapses to an icon-rail/drawer; tables scroll or
   reflow; charts resize. Document the minimum supported width.
4. **Microcopy / consistency** pass against `crowe-brand` voice (sentence case, en dashes, no Oxford
   comma, ALL CAPS only for section headings/buttons).
5. **"Reset demo" control** wired to `resetDemoData()` (Phase 1), with a confirm dialog.

### C. Accessibility (WCAG AA)

- All interactive elements keyboard-reachable with visible focus; logical tab order; ESC closes
  overlays; focus trap + restore on dialogs/sheets.
- No color-only meaning anywhere (pair verdict/traffic-light/status with icon + text).
- Contrast AA in both themes; charts have text labels/legends, not color alone.
- Proper roles/labels (tables, nav, dialogs); `alt` on the logo; `aria-live` for toasts.
- Run an automated pass (axe) and fix violations.

### D. Performance

- Code-split heavy routes (charts, dependency graph, export libs are dynamic imports).
- Memoize expensive derived data; virtualize long tables if needed.
- Lighthouse: Performance and Accessibility ≥ 90 on Dashboard, Inventory, Workbench.

### E. QA (per `qa` skill)

- Unit tests: every engine (known-answer), the storage adapter, repo merge logic, transition/freq
  state machines, export serializers, due/overdue + clock helpers.
- Component tests (RTL): role gating, run-a-test happy path, create-finding-from-run, flag-for-review,
  filter composition.
- One end-to-end smoke path (Playwright optional): select model → run test → see formula → create
  finding → flag for review → export.
- Coverage target stated in `qa` skill; fail CI under threshold.

### F. CI/CD & deploy (per `deployment` skill)

- GitHub Actions: install → lint → typecheck → test → build on every PR; block merge on failure.
- Vercel production deploy from `main`; preview deploys on PRs.
- **Auth swap-point (optional, only if going to production):** replace the demo role switcher's source
  with NextAuth/Clerk session while keeping `usePermissions()` and every component unchanged; add the
  `DATABASE_URL`/`NEXTAUTH_*` env scaffolding and a `PrismaAdapter` implementing `StorageAdapter`. If
  staying a demo, document this as the one remaining step and leave the seam in place.

## Out of scope

- New features beyond the dependency graph.

---

## Acceptance criteria

- [ ] Dependency graph renders, node click traces upstream/downstream, and breached/overdue propagation is visible; BETA badge present.
- [ ] Motion polish applied and respects reduced-motion; every surface has empty/loading/error states; responsive to tablet; "Reset demo" works behind a confirm.
- [ ] axe pass with no serious violations; full keyboard operability; AA contrast both themes; no color-only signaling.
- [ ] Lighthouse Performance + Accessibility ≥ 90 on the three key routes.
- [ ] Test suite covers engines, adapters, state machines, serializers, and the core component flows; coverage meets the `qa` threshold; CI green.
- [ ] GitHub Actions pipeline blocks on lint/typecheck/test/build; production deploy live on Vercel; preview deploys on PRs.
- [ ] `PHASE-7-NOTES.md` records the auth decision (demo vs production swap), performance numbers, and any remaining known gaps.
