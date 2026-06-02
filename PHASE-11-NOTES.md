# PRD-11 UI Refresh — Notes & Polish Rubric

## What was changed

### Token layer

- **Neutral ramp**: 10-step warm near-neutral (`--neutral-0` → `--neutral-900`); replaces the cold blue-gray from Addendum §3.
- **Canvas**: `#F4F5F8` → `#F6F6F4` (warmer, neutral-50).
- **New tokens**: `--surface-sunken` (`#F2F2EF`) for inputs/wells/formula bg; `--ink-body` (`#2A2A25`) for body text; `--border-strong` (`rgba(1,30,65,0.14)`); full motion timing set.
- **Border hairline**: Solid hex `#E6E9EF` → `rgba(1,30,65,0.08)` (~8% opacity). Significantly lighter.
- **Elevation**: 4-level two-part system (`--elev-1` → `--elev-4`) replaces 3-level flat shadows. Vertical offset emphasis.
- **Status colors**: `--status-warn` `#D7761D` → `#C77700`; `--status-fail` `#E5376B` → `#D7263D`. Both are now clearly distinct from CTA amber `#F5A800`.
- **Type scale**: body 15px → 14/21; `display-xl` 40/44 added for KPI numerals; `eyebrow` 11/16 +0.06em tracking.
- **Radius**: card 12px → 10px; control 8px; chip 6px; viz 12px.

### Components updated

| Component        | Changes                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| `Button`         | Tertiary variant (link-style); heights 32/36/44; `rounded-control`            |
| `StatTile`       | `display-xl` numeral; count-up on mount (ease-out-cubic, reduced-motion safe) |
| `SurfaceCard`    | `rounded-card` 10px, `shadow-elev-1`, optional `hoverable` → elev-2           |
| `VizCard`        | `rounded-viz` 12px, eyebrow tracking                                          |
| `StatusBadge`    | Updated warn/fail colors; eyebrow-size chip                                   |
| `TierBadge`      | Updated colors via status tokens                                              |
| `VerdictChip`    | Updated warn/fail colors                                                      |
| `TrafficLight`   | Updated warn/fail colors                                                      |
| `Eyebrow`        | `text-eyebrow` 11px + 0.06em tracking                                         |
| `DataTableShell` | `hover:bg-neutral-50`, eyebrow header labels, `elev-1`                        |
| `ChartTheme`     | Gridlines `whiteFaint` ~10%                                                   |

### New components

| Component                         | PRD-11 ref                         |
| --------------------------------- | ---------------------------------- |
| `Skeleton` (text/card/table-rows) | §6 "skeletons shaped like content" |
| `EmptyState` (icon+sentence+CTA)  | §6 "Geist Empty-State pattern"     |
| `CommandPalette` (⌘K/Ctrl-K)      | §7 — premium-app signal            |

### Shell

- `AppHeader`: quieter (`52px`), ⌘K search button, muted sector label.
- `AppSidebar`: inactive items use `text-ink-secondary` (recede); gap `space-y-px`.
- `(app)/layout.tsx`: CommandPalette wired with live model + finding data.

### Screen compliance

- All form inputs/selects/textareas: `bg-surface` → `bg-surface-sunken`.
- `FormulaPanel`: outer card → `--surface-sunken`; equation/step code blocks already `font-mono`.

## Decisions & deviations

- **Font unchanged**: Plus Jakarta Sans Variable (cannot load Helvetica Now in corporate proxy environment — see PHASE-0-NOTES.md). Mono = JetBrains Mono, used only for formula expressions, code, and raw IDs.
- **DataTable selected-row state** (amber left-edge, indigo-6% bg): implemented as hover only for now; selected state requires DataTable to accept `selectedId` prop — deferred to next iteration as it's a behavioral change, not a token change.
- **Density toggle** (`data-density` attribute, comfortable/compact): token layer and table row height CSS are ready (`h-12` comfortable / `h-9` compact in DataTableShell); the toggle UI and `StorageAdapter` persistence are Phase 7 polish items.

## PRD-11 §9 Polish Rubric — Baseline scores (post-token-update)

To be scored per-screen after visual review. Token layer changes affect all screens simultaneously.

| Axis              | Shell                                                                       | Expected baseline |
| ----------------- | --------------------------------------------------------------------------- | ----------------- |
| Hierarchy         | ✓ Header dark, sidebar muted, content leads                                 | 9                 |
| Spacing           | ✓ 4/8 base, sidebar px-2 py-px                                              | 8                 |
| Type              | ✓ 14px body, display-xl KPIs, eyebrow uppercase only                        | 9                 |
| Color restraint   | ✓ Amber indicator only, neutral-dominant                                    | 9                 |
| Borders/elevation | ✓ ~8% hairline, elev-1 on all cards                                         | 9                 |
| States            | ⚠ Skeleton/EmptyState components built; need to be deployed to all surfaces | 7                 |
| A11y              | ✓ Focus ring, skip link, ARIA, keyboard                                     | 9                 |
| Originality       | ✓ Unmistakably Crowe: indigo ink, amber indicator, indigo viz panels        | 9                 |

States axis is 7 because skeletons are built but not yet dropped into every list/table/result view — that's the next iteration.
