# PRD — Phase 5: Findings Tracker & Flag-for-Review Workflow

**Depends on:** Phases 1, 3 (consumes run context). **Inherits:** Master Plan §3, §6.
**This phase contains a production swap-point** (server-side audit trail) — see Master Plan §2.

---

## Objective

Build the Findings Tracker and the human-in-the-loop review workflow: list/detail of findings,
**flag a finding for review**, transition status with an audit trail, assign owners, and — the key
linkage — **create a finding directly from a failed/warn test run**. This is the "flag things for
review" requirement, made persistent and auditable.

---

## Scope (in)

### A. Findings Tracker (`/findings`)

1. **List** with filter pills (All / Open / In Remediation / Closed / Critical / High) and a summary
   strip (counts by status and severity). Reuse the Phase 2 table/list patterns.
2. **Detail panel/page** (`/findings/[id]`): title, linked model (deep-link to model + the source run
   when `sourceRunId` is set), severity, status, type, open/due dates, age, assignee + role,
   description, remediation plan, validator note, and the **audit trail** timeline (actor + type +
   action + timestamp), styled like the wireframe's case timeline (AI / human / system dots).
3. **Empty state** mirrors the wireframe.

### B. Flag-for-review

1. A **Flag for review** action on any finding (and on a test result in the Workbench/results view).
   Flagging sets `flaggedForReview`, appends an audit entry, persists via the storage adapter, and
   surfaces the item in an MRM "Review queue" view.
2. **Review queue** (MRM role): all flagged findings + flagged runs, with reviewer notes (textarea)
   and review actions: **Approve / Request changes / Escalate** (port the wireframe's reviewer-card +
   rev-notes + rev-actions). Each action appends an audit entry and updates state. Owners can flag;
   only MRM can clear/approve (enforce via `usePermissions()`).

### C. Status transitions + audit

1. Valid transitions: `Open → In Remediation → Closed` (and `In Remediation → Open` reopen). Guard
   illegal transitions. Closing requires a closing note; record `closedDate`.
2. Every create/flag/transition/assignment/review-action appends a structured `AuditEntry`
   (`ts, actor, actorType, action`). The audit trail is the system of record for the finding's life.
3. **Assignment**: change assignee/role; persist + audit.

### D. Create finding from a failed run (the linkage)

1. On a `fail` or `warn` test result, a **Create finding** action pre-fills a finding form from the
   run context: `modelId`, model name, a generated `MRF-` id, severity suggested from the verdict
   (fail→High/Critical, warn→Medium), type inferred from `testType`, description seeded from the
   failing metrics + recommendation, and `sourceRunId` linking back to the run.
2. Use `react-hook-form` + zod for the form. On submit: persist the finding, append a creation audit
   entry, and update the model's `openFx` count + dashboard/inventory.
3. Reverse link: the source run shows "Finding created: MRF-…" and the finding shows "From run: …".

## Out of scope

- Governance committee/approval-pipeline UI and the Add-Model frequency-approval workflow (Phase 6),
  though both also use the audit pattern built here.

---

## Implementation notes

- Centralize transitions in a small reducer/state-machine (`lib/findings/transitions.ts`) with unit
  tests for legal/illegal moves — don't scatter status logic across components.
- `actorType: 'ai'` is reserved for any model-generated suggestion (e.g., auto-suggested severity);
  keep human vs AI vs system distinct in the trail (the wireframe's color coding depends on it).

## Acceptance criteria

- [ ] Findings list/filters/summary and detail (incl. audit timeline + source-run deep-link) work for all 12 seeded findings.
- [ ] Flagging a finding or a run adds it to the MRM review queue, persists across reload, and writes an audit entry.
- [ ] Review actions (approve / request changes / escalate) update state + audit; owner-vs-MRM permissions enforced.
- [ ] Status transitions are guarded by the state machine (illegal moves rejected, tested); closing captures a note + date.
- [ ] "Create finding" from a fail/warn run produces a linked finding with `sourceRunId`, updates `openFx`, and the reverse link renders.
- [ ] Lint/typecheck/test clean; transition state machine and finding-from-run mapping unit-tested; `PHASE-5-NOTES.md` written.
