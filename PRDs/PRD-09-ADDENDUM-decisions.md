# PRD — Addendum: Locked Decisions (Models, Tests, Data, Visual Direction)

This addendum records decisions made after the initial PRD set and overrides anything conflicting in
the phase PRDs. Phases 1 and 3 are already revised to match §1–§2. §3 is now finalized: the
instruction to "port the wireframe visuals" is **revoked** — the build uses the new design system below.

---

## 1. Showcase models & computed-test matrix

Keep all 16 models in inventory for breadth. Only these 4 are built out with genuinely computed
tests; the other 12 are inventory entries with illustrative (`computed:false`) results.

| #   | Model                                        | Domain  | Tier | Computed tests                                          | Planted verdict               |
| --- | -------------------------------------------- | ------- | ---- | ------------------------------------------------------- | ----------------------------- |
| 1   | CRE Probability of Default (`CECL-2024-001`) | CECL    | 1    | Source-to-Model · PSI · Backtesting · Stress            | warn · warn · warn · pass     |
| 2   | Transaction Monitoring (`AML-2024-001`)      | BSA/AML | 1    | Source-to-Model · Backtesting · Benchmarking · Override | **fail** · pass · warn · pass |
| 3   | NII Sensitivity (`ALM-2024-001`)             | ALM     | 1    | Backtesting · Sensitivity · Stress · Source-to-Model    | pass · warn · warn · pass     |
| 4   | Card Fraud (`FRAUD-2024-001`)                | Fraud   | 2    | Backtesting · PSI · CSI · Benchmarking                  | pass · warn · pass · pass     |

Every `TestType` appears; each model is a distinct flavor; verdict spread includes one fail, several
warns, several passes (drives the flag-for-review / create-finding flows). The AML Source-to-Model
**fail** (ACH-return gap) is the canonical "failed test → finding" path.

---

## 2. Synthetic data spec (full detail in Phase 1 PRD §3)

Deterministic seeded generators (no large committed CSVs): `creLoanTape` **2,500** (+ planted-gap
model copy), `amlTransactions` **25,000** (+ `amlOverrideLog` **12,000**), `fraudScoredTxns`
**30,000**, `almPositions` **5,000** → 47 loan / 23 deposit buckets. Generators plant the properties
that make §1's verdicts reproduce a believable validation story; each planted property is unit-tested.

---

## 3. Visual direction — "Light Premium Crowe" (FINALIZED)

**Decision:** Light-first, premium, Crowe palette · **balanced** density · no reference product
specified (system defined below is authoritative). Distinct from the wireframe — do **not** reproduce
its dense dark cards, thin borders, or tiny-uppercase-label look.

Revise to this system: **Phase 0** (tokens + component kit), **Phase 2** (tables/cards/charts),
**Phase 3** (Workbench + FormulaPanel), **Phase 4** (result presentation + PDF). Phases 5–7 inherit it.

### 3.1 Surfaces & color

- **Canvas:** soft cool off-white (`#F4F5F8`), not pure white — premium, low-glare.
- **Cards/surfaces:** white, radius 12–14px, soft layered shadow
  (`0 1px 3px rgba(1,30,65,.06), 0 8px 24px rgba(1,30,65,.05)`), hairline border `#E6E9EF` only where
  separation is needed. **Elevation over borders.**
- **Ink:** primary text Crowe Indigo `#011E41`; secondary `#4F4F4F`; muted `#828282`; dividers `#E6E9EF`.
- **Header:** Crowe Indigo `#011E41` with the white wordmark asset — the single strong dark anchor.
- **Sidebar:** white/very-light; active item = indigo text + a 3px amber indicator + faint amber tint.
- **Accent (amber `#F5A800`) used sparingly:** primary CTAs (amber fill, indigo text), active states,
  one key highlight per view. Never a background wash, never body text.
- **Status (icon + text + color, never color alone):** pass = Teal `#05AB8C`; warn = Amber Dark
  `#D7761D` foreground (distinct from CTA amber); fail = Coral `#E5376B`. Tints at ~12% for chip fills.
- **Secondaries (teal/cyan/blue/violet/coral):** data-viz + status only; never dominate.

### 3.2 Data-viz panels (brand-compliant resolution)

Charts render on **indigo (`#011E41`) cards** with white labels/axes and a limited brand-hue palette —
deliberate dark punctuation within the light layout (satisfies `crowe-brand` "data-viz on indigo").
KPI/number tiles and tables stay light. Result: a light product with a few focal indigo viz panels.

### 3.3 Typography

- **Helvetica Now** (Display for headings + big numbers, Text for body), Arial/Helvetica fallback.
  Drop the wireframe's DM Serif Display numerals — big figures use Helvetica Now Display Bold with
  **tabular figures**.
- Scale: display 36 / h1 24 / h2 20 / h3 16 / body 15 / small 13 / caption 12. Sentence case.
- Uppercase only for sparing section eyebrows and buttons — not for every label (kill the wireframe tic).

### 3.4 Components (balanced density)

- **Cards:** 20–24px padding; clear title + optional eyebrow; soft shadow.
- **Tables:** row height ~48px, no zebra, hairline dividers `#EEF0F4`, sticky header (white, indigo
  text), very subtle hover tint; numeric columns right-aligned, tabular figures.
- **Chips/badges:** pill, soft tinted bg, no heavy border; tier/verdict/status = icon + text + color.
- **Buttons:** primary amber-fill/indigo-text; secondary white/indigo-border; ghost text-only; visible
  focus ring (indigo, 2px).
- **Drawers/dialogs (shadcn sheet/dialog):** white, soft shadow, focus trap + restore.
- **Spacing:** 8px grid; comfortable, not airy-to-a-fault and not cramped.

### 3.5 Motion & themes

- Motion: ease-out 150–250ms, restrained, premium; respect `prefers-reduced-motion`.
- **Dark mode** kept as secondary: deep-indigo surfaces, lighter cards, same accent/status logic, AA contrast.
- All colors are tokens; no literals in components. WCAG AA in both themes.

> Build §3.1–§3.4 as a documented token set + a small component kit in Phase 0 first; every later
> surface inherits it. If the brand owner objects to §3.2 (charts on indigo within a light app),
> the fallback is light chart cards with indigo ink — record the choice in `PHASE-0-NOTES.md`.
