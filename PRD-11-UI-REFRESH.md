# PRD — UI Refresh: "Light Premium Crowe, Refined" (PRD 11)

**Type:** Cross-cutting design-system upgrade. **Supersedes** Addendum §3 and the design portions of
Phase 0 wherever this file is more specific. **Applies to every phase** and is enforced by the polish
rubric in §9. **Inherits:** Master Plan §3, §6; skills `frontend`, `crowe-brand`, `animation-components`, `qa`.

> **What this is.** A precise spec for taking the build from "clean" to the craft level of the best
> _application_ UIs (Linear, Vercel/Geist, Stripe dashboard, Mercury) — adapted for a data-dense
> governance tool. It is grounded in those systems' published principles and translated into Crowe
> tokens. It does **not** clone them.

---

## 0. Reference framing & originality guardrail (read first)

- The references are elite **product/app** UIs, **not** marketing/landing pages. Do not import
  hero animations, WebGL, scroll choreography, or decorative grids — they harm a tool used for hours.
- **Principles, not assets.** Do not copy any reference's CSS, color values, icon set, typeface,
  logo, or component code. The result must read unmistakably as **Crowe** (Indigo `#011E41` + Amber
  `#F5A800` + Helvetica Now), not as Linear/Vercel/Mercury. Reviewer test: "Could this be mistaken
  for $REFERENCE?" must be **no**.

### Reference systems studied (what each contributes)

- **Linear** — dense-product restraint: chrome recedes, content leads; fewer/softer borders; warmer
  neutral ramp; compact chrome; polish = many invisible details.
- **Vercel / Geist** — token discipline: subtle borders (~8% not ~15%), radius restraint, tight
  display letter-spacing/line-height, accent reserved for links/CTAs, generous section whitespace;
  premium component set (command menu, empty state, gauge, skeleton, keyboard input).
- **Refactoring UI** — brand-neutral craft: grayscale-first; hierarchy via size/weight/color (secondary
  text moves toward the background, not just grey); constrained scales; two-part shadows with vertical
  offset; color used sparingly; primary/secondary/tertiary action hierarchy.
- **Fintech back-office (UXDA)** — calm, daily-use ergonomics: one smart search (command palette) over
  many search boxes; layout organized by task frequency; serious but not cold.

---

## 1. Method: grayscale-first

Build and review every screen in the **neutral ramp + ink only** first. Lay out hierarchy, spacing,
and density with no brand color. Apply Indigo / Amber / status colors as a thin final layer
(§4). A screen must read clearly in grayscale before any color is added — this is a hard review gate.

---

## 2. Neutral ramp & semantic tokens (light theme)

Neutral ramp is **near-neutral with a hair of warmth** to bridge cool Indigo and warm Amber (avoid
both cold blue-gray and muddy warm). Tune in the Phase-0 token tool; values below are the target.

```
--neutral-0:  #FFFFFF   --neutral-50: #F6F6F4   --neutral-100: #EDEDEA
--neutral-200:#E0E0DC   --neutral-300:#CBCBC6   --neutral-400:#A6A6A0
--neutral-500:#86867F   --neutral-600:#65655F   --neutral-700:#46463F
--neutral-800:#2A2A25   --neutral-900:#1A1A16
```

Semantic (light):

```
--canvas:           #F6F6F4    /* app background */
--surface:          #FFFFFF    /* cards, tables, sheets */
--surface-sunken:   #F2F2EF    /* wells, inputs, code/formula bg */
--surface-viz:      #011E41    /* indigo data-viz panels (brand rule) */
--ink:              #011E41    /* brand ink: headings + key labels */
--ink-body:         #2A2A25    /* long-form/body text (neutral-800) */
--ink-secondary:    #65655F    /* neutral-600 */
--ink-muted:        #86867F    /* neutral-500: captions, placeholders */
--border-hairline:  rgba(1,30,65,0.08)   /* ~8%, NOT 15% */
--border-strong:    rgba(1,30,65,0.14)
--focus-ring:       #011E41                /* 2px, 2px offset */
```

Dark theme (secondary) mirrors with deep-indigo surfaces and the same token names; define the full
counterpart set. No component may reference a raw hex — tokens only.

---

## 3. Scales

**Spacing (4/8 base):** `2 4 8 12 16 24 32 48 64 96`. Group with spacing, not borders (Refactoring UI).
Start over-spaced, then tighten to **balanced** density.

**Radius:** card `10` · control (button/input/select) `8` · chip `6` · pill `999` · viz panel `12`.
Keep restrained — no oversized radii.

**Elevation (two-part, transparent indigo, vertical offset — prefer elevation over borders):**

```
--elev-1: 0 1px 2px rgba(1,30,65,.06), 0 1px 3px rgba(1,30,65,.04);   /* resting card */
--elev-2: 0 2px 4px rgba(1,30,65,.06), 0 6px 16px rgba(1,30,65,.06);  /* hover / raised */
--elev-3: 0 4px 8px rgba(1,30,65,.08), 0 12px 32px rgba(1,30,65,.10); /* popover / menu */
--elev-4: 0 8px 16px rgba(1,30,65,.10), 0 24px 64px rgba(1,30,65,.16);/* modal / ⌘K palette */
```

Don't let everything float — most surfaces are flat on `--canvas`; elevation marks interactivity/layering.

**Type (Helvetica Now Display for headings + numerals, Text for body; tabular figures for all numbers;
a mono only for formula expressions, code, and raw IDs):**

```
display-xl 40/44  tracking -0.02em   /* hero KPI numerals */
display    32/36  tracking -0.02em
h1         24/30  tracking -0.01em
h2         20/26
h3         16/22
body       14/21                      /* workhorse */
body-sm    13/18                      /* dense table cells, meta */
caption    12/16
eyebrow    11/16  UPPERCASE tracking +0.06em   /* sparing section labels only */
```

Tighten line-height + slight negative tracking on large sizes; add tracking to uppercase. Kill the
wireframe's everywhere-uppercase tic — eyebrows only.

---

## 4. Color application (thin top layer, used sparingly)

- **Indigo `#011E41`** — brand ink (headings/key labels), the header bar, viz panels, active-nav text.
- **Amber `#F5A800`** — at most **one** primary emphasis per view: the primary button, the active
  indicator (3px bar / underline), one highlighted figure. Never body text, never a large fill.
- **Status (always icon + text + color, never color alone):**
  `--status-pass #05AB8C` · `--status-warn #C77700` (distinct from CTA amber) · `--status-fail #D7263D`
  · `--status-info #0075C9`. Chip fills = hue at ~12% on light.
- **Data-viz:** limited brand-hue palette per chart, white labels on `--surface-viz`. One accent per series-group.
- Everything else stays neutral. If a screen feels colorful, remove color.

---

## 5. App chrome — make it recede (Linear principle)

- **Header** (Indigo, white wordmark): the single strong dark band. Keep it quiet — no competing color.
- **Sidebar:** light; **inactive items muted** (`--ink-secondary`, smaller icons, comfortable vertical
  padding); **active** = `--ink` text + 3px amber indicator + faint amber tint (~8%). The sidebar should
  visually recede once the user has navigated — content area dominates.
- **Borders:** minimum necessary; soften and round. Replace most dividers with spacing or a hairline at
  `--border-hairline`. No nested boxed-in cards-within-cards.
- **Icons:** Lucide, sized down (16px default in chrome), used only where they aid recognition — not decoration.

---

## 6. Component anatomy (balanced density)

**Tables (the centerpiece — inventory, metrics, findings, calendar):**

- No zebra. Row separators = hairline at ~6–8% **or** none (rely on hover + spacing). Sticky header on
  `--surface`, header labels = `eyebrow` muted.
- Numeric columns right-aligned, **tabular figures**; secondary cells `--ink-secondary`; status as chip.
- Row hover = neutral-50 (or indigo ~3%); selected = indigo ~6% + 2px amber left edge.
- Row height: comfortable 48 / compact 36 (see density toggle §8). Generous cell padding-x (16).

**Cards / surfaces:** `--surface`, radius 10, `--elev-1`, padding 20–24, optional `eyebrow` + `h3`
title. Hover-interactive cards go to `--elev-2`.

**Stat tiles (KPI):** big `display`/`display-xl` tabular numeral in `--ink`, label in `eyebrow`/muted,
optional delta with status color + arrow icon. Animated count-up on mount (respect reduced-motion).

**Buttons (action hierarchy):** primary = amber fill / indigo text; secondary = `--surface` + hairline
border + indigo text; tertiary = link-style indigo text. Heights 36/32/44. Clear 2px focus ring.

**Inputs / selects:** `--surface-sunken`, hairline border, inset feel; focus = indigo ring; comfortable 36 height.

**Badges/chips:** pill, soft tinted bg, no heavy border; tier/verdict/status = icon + text + color.

**VizCard (charts):** `--surface-viz` indigo panel, white axes/labels, limited palette, subtle gridlines
(white ~10%). Deliberate dark punctuation within the light layout.

**FormulaPanel:** `--surface-sunken` well; formula expression + IDs in **mono**; inputs/steps as a clean
aligned list (labels muted, values tabular). Quiet, document-like.

**Empty / loading:** **skeletons** shaped like the content (not spinners) on load; empty states = small
icon + one sentence + a single primary action (Geist Empty-State pattern). Every list/table/result has both.

---

## 7. Command palette (⌘K) — premium-app signal + fintech "one smart search"

Add a global command palette (shadcn `command` / `cmdk`):

- Fuzzy search across models, findings, tests; jump straight to a model's Workbench test; run actions
  (run test, create finding, flag for review, export) where permitted.
- Opens on ⌘K / Ctrl-K and from a header search affordance. `--elev-4`, focus-trapped, fully keyboard-driven.
- This replaces scattered per-view search boxes as the primary find/navigate mechanism (keep simple
  in-table filters too).

---

## 8. Interaction, motion, density, a11y

- **Density toggle** (Comfortable / Compact) in user prefs; drives table row heights + control sizes via
  a `data-density` attribute. Persist it (StorageAdapter). Compact is for power users on data-heavy views.
- **Motion** (functional, subtle): micro 120ms, standard 180ms, overlay 240ms; enter ease-out
  `cubic-bezier(.2,0,0,1)`, move ease-in-out. Animate opacity/transform only. Honor `prefers-reduced-motion`.
- **Keyboard:** full operability; visible 2px indigo focus ring (2px offset); ⌘K palette; optional
  nav shortcuts (e.g. `g i` → inventory). ESC closes overlays; focus trap + restore.
- **A11y:** WCAG AA contrast both themes; never color-only (pair icon + text); proper roles/labels;
  `aria-live` for toasts and run-complete.

---

## 9. Polish QA rubric (gate — adapted from Refactoring UI)

Before any phase's UI is "done," score each new screen 0–10 on **each** axis; **all must be ≥ 9**:

1. **Hierarchy** — clear primary/secondary/tertiary via size+weight+color; reads in grayscale.
2. **Spacing** — only scale values; consistent rhythm; grouping by space not boxes.
3. **Type** — only scale steps; tabular figures on numbers; uppercase only on eyebrows (+tracking).
4. **Color restraint** — neutral-dominant; ≤1 amber emphasis/view; status semantic + icon+text.
5. **Borders/elevation** — hairlines ~8%; elevation (two-part) over borders; nothing needlessly boxed.
6. **States** — hover/focus/active/selected/empty/loading(skeleton)/error all present.
7. **A11y** — AA contrast, keyboard, no color-only, focus rings.
8. **Originality** — unmistakably Crowe; not mistakable for a reference product.

Record the per-screen scores in `PHASE-N-NOTES.md`. A screen below 9 on any axis is not done.

---

## 10. Integration with the phase plan

- **Phase 0** absorbs §2–§6 into the token set + component kit, and adds the **command palette** (§7)
  and **density toggle** (§8) to the shell. Update the Phase-0 acceptance criteria to require the §9
  rubric on the shell + kit.
- **Phases 2–6** apply this spec to every surface they build and self-score with §9.
- **Phase 7** "Polish" step becomes: run §9 across all screens, fix anything < 9, verify originality,
  Lighthouse a11y/perf ≥ 90. The §9 rubric is part of the QA gate.
- Where this PRD and Addendum §3 differ, **this PRD wins** (it is more specific).

---

## Sources (principles only; no assets/code copied)

- Linear — "A calmer interface for a product in motion" (2026) and "How we redesigned the Linear UI."
- Vercel Geist design system; SeedFlip "Vercel Design System Breakdown."
- Refactoring UI (Adam Wathan & Steve Schoger) — hierarchy, spacing, color, depth principles.
- UXDA — core-banking back-office UX (calm, daily-use, single smart-search).
