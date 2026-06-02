# Phase 6 — Notes, Decisions, Deviations

## Macro panel

World Bank / BLS API calls fail in the corporate proxy environment (self-signed SSL certs). The `/api/macro` route wraps the fetch in a 3-second timeout with a `try/catch` that silently returns `MACRO_FALLBACK`. The UI always renders immediately from fallback data; the live/cached badge reflects actual source. This matches the PRD requirement: "never block UI on the fetch."

No MACRO_QUARTERLY values are "live" — all are from `MACRO_QUARTERLY` authored series. This is acceptable for the demo.

## Monitoring calendar

**Status logic**: computed from `getToday() = 2026-04-07` via `getDueDateStatus()`. The `getMonitoringCalendar()` function in Phase 1 uses `offsetDate(today, -freqDays * 0.8)` to compute `lastRun` and `offsetDate(lastRun, freqDays)` for `nextDue`. With today fixed, the calendar is deterministic.

**History dots**: sourced from `TEST_HISTORY` seed data (prior-quarter verdicts). New runs added via the Workbench update the history dots after the component re-fetches via `getCalendar()`.

## Add-Model

**Model ID generation**: `{CAT}-{YEAR}-{timestamp-slice}` — not globally unique across sessions (no server-side sequence), but unique within a session. Sufficient for demo.

**userDefined: true** marks these models as user-created for any Phase 7 filtering logic.

**Test frequencies**: default frequencies hardcoded per testType. Any non-default frequency creates a `FrequencyApproval` record with status 'pending'. The calendar shows the default until approved.

## Frequency-approval workflow

**Persistence**: stored in IndexedDB under `freq-approval:{id}` prefix. `getApprovedFrequency()` returns the approved frequency for a (modelId, testType) pair; `hasPendingRequest()` drives the "pending change" indicator.

**MRM approval surface**: on the Governance page (visible to MRM role). Approve/reject with optional reviewer note. Approved frequency immediately reflected in the monitoring calendar.

## Governance

**Seed data only**: the pipeline queue, committee meeting, and policy exceptions are seeded from `governance.ts`. Actions (submit to MRM, renew exception) update local React state but do not persist to the StorageAdapter — a Phase 7 Polish item for full auditability.

## Acceptance criteria status

| #   | Criterion                                                                                     | Status |
| --- | --------------------------------------------------------------------------------------------- | ------ |
| 1   | Macro panel renders fallback instantly, badges each tile, drill-down history charts           | ✅     |
| 2   | Calendar shows correct Current/Due/Overdue per getToday(); history dots render                | ✅     |
| 3   | Calendar rows deep-link to Workbench with model+test preselected                              | ✅     |
| 4   | Add-Model creates userDefined model; appears in inventory; calendar builds from selectedTests | ✅     |
| 5   | Frequency change → pending → MRM approve/reject → calendar reflects approved frequency        | ✅     |
| 6   | Governance pipeline/committee/exceptions render from data; Renew updates exception            | ✅     |
| 7   | Lint/typecheck/test clean (176/176)                                                           | ✅     |
| 8   | `PHASE-6-NOTES.md` written                                                                    | ✅     |
