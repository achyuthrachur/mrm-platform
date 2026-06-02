# Phase 5 — Notes, Decisions, Deviations

## State machine decisions

**Closed is terminal**: Closed → anything is explicitly blocked. The PRD says "In Remediation → Open reopen" — reopening from Closed is not listed as a valid transition and was not implemented.

**Closing note required**: `applyTransition('In Remediation', 'close', ...)` rejects without a note. This is enforced in both the state machine (tested) and the UI (disabled state + error message).

**Review action semantics**: `approve` clears `flaggedForReview`; `request-changes` and `escalate` keep it set. This means a finding stays in the review queue until explicitly approved.

## Create-from-run

**Severity suggestion**: `fail → High`, `warn → Medium`. The form lets the user override before submitting. `Critical` is available as an override option but not auto-suggested (consistent with most findings being High severity — Critical is reserved for manual escalation by the MRM officer).

**Finding ID**: `MRF-YYYYNNN` — year prefix + counter. Counter starts at 100 to avoid collisions with the 12 seeded findings (MRF-001 through MRF-012). Not globally unique across sessions (IndexedDB would need a sequence for true uniqueness), but sufficient for the demo context.

**sourceRunId linkage**: The finding stores the run ID. The finding detail page deep-links to `/workbench` for the reverse link. A full "run shows finding created" UI is a Phase 7 polish item.

## Flag-for-review behavior

Owner can flag; MRM can flag, unflag, and take review actions. The `FlagButton` uses `useFindings().getFinding` to get the current state before applying the transition — this ensures it always operates on the persisted state, not a stale prop.

## Scope: Owner role

The findings list filters to the owner's model IDs (CECL-001, ALM-001, CECL-002, CECL-003) because `canViewAllModels = false` for owners. All 12 seeded findings include findings for other models (AML, CAP, etc.) — these are visible to MRM but not to the default owner role.

## Acceptance criteria status

| #   | Criterion                                                                                         | Status                                               |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Findings list/filters/summary for all 12 seeded findings                                          | ✅                                                   |
| 2   | Flagging persists + writes audit entry + appears in MRM review queue                              | ✅                                                   |
| 3   | Review actions (approve/request-changes/escalate) update state + audit                            | ✅                                                   |
| 4   | Status transitions guarded (illegal moves rejected, tested)                                       | ✅                                                   |
| 5   | Closing captures note + closedDate                                                                | ✅                                                   |
| 6   | Create finding from fail/warn run: linked finding, updates openFx (Phase 6/7 wires openFx update) | ✅ (finding created; openFx counter update deferred) |
| 7   | Lint/typecheck/test clean (171/171)                                                               | ✅                                                   |
| 8   | `PHASE-5-NOTES.md` written                                                                        | ✅                                                   |

## Known gaps for later phases

- `openFx` counter on the model is not updated when a finding is created from a run (would need `useModels().updateModel(...)` wired into CreateFindingSheet — a Phase 7 polish item).
- Run detail page doesn't yet show "Finding created: MRF-…" reverse link (Phase 7).
- Bulk finding export (XLSX/PDF of all findings) is a Phase 4/7 item.
