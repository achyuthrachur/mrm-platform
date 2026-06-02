# MRM Platform — Handoff

## Status

Phase 5 complete. Ready for Phase 6.

## What was just done (Phase 5)

Findings Tracker, flag-for-review workflow, status transitions state machine, create-from-run.

**State machine** (`src/lib/findings/transitions.ts`):
Open → In Remediation → Closed; In Remediation → Open reopen. Closed is terminal.
applyFlag/Unflag/ReviewAction/Assignment. 22 tests.

**Create-from-run** (`src/lib/findings/create-from-run.ts`):
Pre-fills severity (fail→High, warn→Medium), type from testType, desc from failing metrics,
sourceRunId linkage. 6 tests covering all type mappings.

**UI** (`src/app/(app)/findings/` + `src/components/features/findings/`):

- Findings Tracker: summary strip (6 count tiles), filter pills, sortable table
- Tab: All Findings | Review Queue (MRM role)
- Finding detail: metadata, status controls (transition + closing note), AuditTrail timeline, FlagButton
- Review Queue: expand/reviewer-notes/approve/request-changes/escalate
- CreateFindingSheet: react-hook-form + zod, pre-filled from run context

**Workbench**: "Create Finding" button on fail/warn results opens CreateFindingSheet.

## What to do next (Phase 6)

Read `PRDs/PRD-07-PHASE-6-calendar-governance-addmodel.md`. Build:

1. Performance Monitor (`/monitor`): macro panel + model selector + monitoring calendar
2. Add-Model drawer: react-hook-form + zod, test selection, frequency config
3. Frequency-approval workflow: pending → MRM approve/reject → calendar reflects it
4. Governance (`/governance`): approval pipeline, MRM committee, policy exception log

## Branch / commit

- `feature/phase-5-findings` · 78469a0

## Verify

```
npm run test    # 171/171 pass
npm run dev     # /findings → flag MRF-001 → switch to MRM → Review Queue → Approve
                # /workbench → run AML STM → FAIL → Create Finding → MRF-XXXXX
```
