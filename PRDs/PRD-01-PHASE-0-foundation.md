# PRD — Phase 0: Foundation, Design System & App Shell

**Depends on:** none. **Inherits:** Master Plan §3, §6, and **`PRD-09-ADDENDUM-decisions.md` §3
("Light Premium Crowe")** — this phase builds that design system. **Do not port wireframe chrome.**

---

## Objective

Stand up the Next.js app, the **"Light Premium Crowe"** design-token set + component kit, and the
persistent layout shell (header, sidebar, role + theme toggles, footer) with routing for all seven
areas. End state: the app builds, deploys to Vercel, navigates seven placeholder pages, and toggles
role + theme — using the new visual system, not the wireframe's.

## Why first

Every later surface inherits these tokens and kit. Defining them once — in the new light-premium
language — prevents every phase from reinventing chrome and prevents drifting back into the wireframe look.

---

## Scope (in)

1. **Scaffold** via `create-next-app` (App Router, TS, Tailwind, ESLint, `src/`, `@/*`). Prettier +
   ESLint + tsconfig per `tech-stack`. Husky + lint-staged. Folder structure per `architecture`.
   Official Crowe logo assets in `src/assets/`.

2. **Design tokens (Addendum §3)** in `src/styles/globals.css` + `tailwind.config.ts`:
   - Brand palette as CSS variables (indigo/amber/teal/cyan/blue/violet/coral + neutrals/tints).
   - **Semantic tokens** (the layer components use): `--canvas` `#F4F5F8`, `--surface` `#FFFFFF`,
     `--surface-viz` `#011E41` (indigo data-viz panels), `--ink`, `--ink-secondary`, `--ink-muted`,
     `--border-hairline`, `--accent` (amber), `--status-pass`/`--status-warn` (`#D7761D`)/`--status-fail`,
     elevation shadow tokens, radius tokens. Map all into Tailwind `theme.extend`.
   - **Dark theme** counterpart (secondary): deep-indigo surfaces, lighter cards, same accent/status.
     Drive light/dark via a single strategy (`data-theme` + Tailwind `dark:`); no component literals.

3. **Typography (Addendum §3.3):** load **Helvetica Now** (Display + Text) with Arial/Helvetica
   fallback; if the licensed font isn't available, fall back to a near-equivalent grotesk and record
   the substitution in notes. Type scale display 36 / h1 24 / h2 20 / h3 16 / body 15 / small 13 /
   caption 12. Tabular figures for numerals. **No serif display numerals.**

4. **shadcn/ui init** themed to the tokens. Install: `button card table dialog sheet tabs select input
textarea badge tooltip sonner dropdown-menu scroll-area`. Restyle primitives to the kit
   (light premium, balanced density) — not shadcn defaults, not wireframe styling.

5. **Component kit** (`src/components/ui/`), styled per Addendum §3.4, each with a story/example +
   test: `StatTile` (big tabular number), `SurfaceCard`, `VizCard` (indigo data-viz panel),
   `DataTableShell` (airy rows, sticky white header, right-aligned numerics), `StatusBadge`
   (icon+text+color: pass/warn/fail/info), `TierBadge`, `VerdictChip`, `TrafficLight`, `Eyebrow`
   (sparing uppercase section label), buttons (primary/secondary/ghost with focus ring).

6. **Layout shell** (`src/components/features/shell/`):
   - **AppHeader** — indigo bar, white wordmark asset, "MRM Platform™", role-aware portal badge,
     sector label, current user, **RoleSwitcher** (Owner/MRM), **ThemeToggle**.
   - **AppSidebar** — white/light; seven items (Dashboard, Model Inventory, Testing Workbench,
     Findings Tracker, Performance Monitor, Governance, Dependencies + BETA badge) with Lucide icons;
     active = indigo text + 3px amber indicator + faint amber tint; footer with role dot + user + scope.
   - **AppFooter** — demo-environment + Crowe copyright line.

7. **Routing** — `src/app/(app)/{dashboard,inventory,workbench,findings,monitor,governance,dependencies}/page.tsx`,
   each a placeholder ("Built in Phase N") in the shell; `/` → `/dashboard`.

8. **Providers** — `ThemeProvider` (light/dark, persist, respect OS on first load),
   `RoleProvider` (demo role, persist, default owner), `usePermissions()` (RBAC-shaped:
   `canRunTests`, `canApproveFrequency`, `canReviewFindings`, …; owners run/attest, MRM review/approve
   and cannot run owner tests), one `Toaster` (sonner).

9. **Role/theme reactive theming** via `data-role` / `data-theme` on the root: role flips header badge,
   sidebar active accent, and any role-tinted chrome (amber owner / teal-cyan MRM) — re-expressed in
   the new system, not the wireframe's gradients.

10. **Vercel deploy skeleton** (no env required yet) + README.

## Out of scope

- Real data, tables with data, charts, tests, feature logic (later phases). Real auth.

## Acceptance criteria

- [ ] `dev`/`build` succeed; deploys to Vercel; all 7 routes load in the shell; sidebar active tracks route.
- [ ] Role switcher + theme toggle work and persist; first load respects OS theme; `usePermissions()` role-correct (tested).
- [ ] Token set matches Addendum §3 (semantic tokens present; no color literals in components — lint/grep clean).
- [ ] Component kit renders in both themes; `StatTile` uses tabular figures; `VizCard` is indigo; tables are airy with sticky white headers; status uses icon+text+color.
- [ ] The shell visibly reads as "light premium," not the wireframe (reviewer sign-off).
- [ ] Logo is the official asset (or clearly-marked placeholder + TODO).
- [ ] Lint/typecheck/test clean; `PHASE-0-NOTES.md` records the font outcome, the §3.2 chart-panel decision, and any token deviations.
