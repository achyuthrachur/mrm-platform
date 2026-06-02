# MRM Platform — Handoff

## Status

Phase 6 complete. Ready for Phase 7 (final phase).

## What was just done (Phase 6)

Performance Monitor, Add-Model drawer, frequency-approval workflow, Governance.

**Performance Monitor (`/monitor`)**:

- MacroPanel: 4 economic tiles from MACRO_FALLBACK + drill-down quarterly charts on VizCard
- MonitoringCalendar: test rows with status (Current/Due/Overdue), history dots, Run deep-links
- Add Model button → AddModelSheet

**Add-Model** (`src/components/features/add-model/AddModelSheet.tsx`):

- react-hook-form + zod form: name, cat, tier, framework, method, desc
- Test selection with per-test frequency override (non-default → freq-approval request)
- On save: `userDefined: true` model in inventory + calendar built from selectedTests

**Frequency-approval workflow** (`src/lib/store/frequency-approvals-context.tsx`):

- Persists via StorageAdapter (freq-approval: prefix)
- Calendar shows "pending change" indicator; approved freq takes effect immediately
- MRM approves/rejects on the Governance page

**Governance (`/governance`)**:

- ApprovalPipeline: 6-step SR 11-7 lifecycle + current queue
- MRMCommittee: next meeting, agenda items, last meeting summary
- PolicyExceptions: active/pending-renewal exceptions with Renew action

**Wire**: FrequencyApprovalsProvider in (app)/layout.tsx

## What to do next (Phase 7 — FINAL)

Read `PRDs/PRD-08-PHASE-7-dependencies-polish-qa-deploy.md`. Build:

1. **Dependencies** (`/dependencies`) — SVG/Motion model network graph, node click, risk propagation
2. **Polish** — route/tab transitions, count-up on KPI tiles, reduced-motion, empty/loading/error states everywhere
3. **Responsive** — sidebar collapses to icon-rail at tablet; tables scroll
4. **Reset Demo** — confirm dialog + resetDemoData()
5. **Accessibility pass** — axe, keyboard nav, no color-only signaling
6. **CI/CD** — GitHub Actions (lint → typecheck → test → build), Vercel prod deploy
7. **Known gaps wired** — openFx counter from create-finding, run→finding reverse link

## Branch / commit

- `feature/phase-6-calendar-governance` · 11eada2

## Verify

```
npm run test    # 176/176 pass
npm run dev     # /monitor → select CECL-2024-001 → see calendar + history dots
                # /monitor → Add Model → save → appears in /inventory
                # /governance → Approval Pipeline + MRM Committee + Policy Exceptions
```
