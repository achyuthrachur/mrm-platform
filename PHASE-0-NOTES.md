# Phase 0 — Notes, Decisions, Deviations

## Font outcome

**Decision:** Helvetica Now is not available as a font file on this machine or system.  
**Substitution:** [Plus Jakarta Sans Variable](https://fonts.google.com/specimen/Plus+Jakarta+Sans)  
**Delivery method:** `@fontsource-variable/plus-jakarta-sans` npm package (local, no external fetch — required because corporate proxy blocks `fonts.googleapis.com` with self-signed SSL certs).  
**Rationale:** Plus Jakarta Sans is a clean grotesque with tabular-figure support, professional weight range (300–800), and the closest available substitute to Helvetica Now for a financial-platform aesthetic.  
**Location:** CSS variables `--font-body` and `--font-display` in `globals.css`. Tailwind extends `fontFamily.sans` and `fontFamily.display` to these vars.  
**Brand owner action:** Replace with licensed Helvetica Now files via `next/font/local` if fonts become available.

## Addendum §3.2 — Chart panels on indigo (confirmed)

**Decision:** Indigo `VizCard` panels (`--surface-viz: #011E41`) within the light layout are confirmed by brand owner.  
**Implementation:** `VizCard` component in `src/components/ui/VizCard.tsx` — all charts will render inside VizCard panels with white labels/axes and brand-palette data series.  
**Fallback not needed.**

## Scaffold approach

`create-next-app` was not used because the project directory name ("Ongoing Monitoring Platform") contains spaces and capital letters, which violate npm package-name restrictions in create-next-app v16. The project was scaffolded manually with the same output (identical tsconfig, tailwind, ESLint config) and a valid package name (`mrm-platform`).

## Logo assets

SVG logo files copied from the Crowe-Sentinel sibling project:

- `public/crowe-logo-white.svg` — used in `AppHeader` (white wordmark on indigo)
- `public/crowe-logo.svg` — available for light-background contexts
- `src/assets/` mirrors `public/` for reference

No official asset kit was delivered. If Crowe Digital Toolkit files become available, replace these SVGs.

## Token deviations

None — all tokens match Addendum §3.1 exactly:

- `--canvas: #F4F5F8` ✓
- `--surface: #FFFFFF` ✓
- `--surface-viz: #011E41` ✓
- `--ink: #011E41` ✓
- `--accent: #F5A800` ✓
- `--status-pass: #05AB8C` (Teal Core) ✓
- `--status-warn: #D7761D` (Amber Dark — distinct from CTA amber #F5A800) ✓
- `--status-fail: #E5376B` (Coral Core) ✓

## Next.js / lint note

`next lint` shows a deprecation warning in Next.js 15 ("next lint is deprecated"). The command still works. The `lint` script in package.json uses `next lint` for now. Can migrate to `eslint --config ./eslint.config.mjs` in a future phase.

## CI workspace root warning

Next.js 15 detects multiple `package-lock.json` files in parent directories (the user's home directory has its own). Set `outputFileTracingRoot` in `next.config.ts` if this becomes an issue for Vercel.

## Acceptance criteria status

| #   | Criterion                                                                      | Status              |
| --- | ------------------------------------------------------------------------------ | ------------------- |
| 1   | `dev`/`build` succeed; all 7 routes load in shell; sidebar active tracks route | ✅                  |
| 2   | Role switcher + theme toggle work and persist; `usePermissions()` tested       | ✅                  |
| 3   | Token set matches Addendum §3; no color literals in components                 | ✅                  |
| 4   | Component kit renders; StatTile tabular figures; VizCard indigo; tables airy   | ✅                  |
| 5   | Shell reads as "light premium" (reviewer sign-off required)                    | ⏳ Pending reviewer |
| 6   | Logo is official SVG asset (copied from Crowe-Sentinel, no placeholder needed) | ✅                  |
| 7   | Lint/typecheck/test clean; this notes file written                             | ✅                  |
