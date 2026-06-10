# PRD 12 — Model Onboarding: Add-Model Workflow, Test & Threshold Configuration, MRM Approval Gate & Synthetic Data Engine

**Type:** New feature PRD. **Supersedes** the add-model portions of PRD-07 (Phase 6) wherever this
file is more specific — this file wins. **Depends on:** Phases 0–1 (shell + data layer). **Inherits:**
Master Plan §3, §6; Addendum §3 (visual direction); PRD-11 (design system).

> **Why a dedicated PRD.** The original Phase 6 PRD described add-model as a single drawer with test
> selection and a frequency-approval stub. That was incomplete. The full scope is a five-stage
> workflow with per-test threshold configuration, a two-sided approval queue, and a post-approval
> synthetic data generation engine. That warrants its own spec.

---

## 1. Mental model (read before anything else)

Model onboarding is a **regulated, two-party workflow**, not a form submission:

```
Owner fills out model + selects tests + configures thresholds
    → submits for MRM review
        → MRM officer reviews, comments, approves / requests changes / rejects
            → on approval the model locks into inventory
                → the synthetic data engine generates realistic test datasets for the new model
                    → the model is immediately runnable in the Workbench
```

Permission boundary is hard: **only a Model Owner can initiate onboarding**. Only an MRM Officer can
approve/reject. No step is skippable. The model does not appear in the live inventory until it is
approved.

---

## 2. The five stages

| Stage                           | Actor | System state                      | Visible to                            |
| ------------------------------- | ----- | --------------------------------- | ------------------------------------- |
| **Draft**                       | Owner | Saved but not submitted; editable | Owner only                            |
| **Submitted / Awaiting Review** | —     | Locked for editing; in MRM queue  | Owner (read-only) + MRM               |
| **Changes Requested**           | MRM   | Returned with notes; unlocked     | Owner (editable again) + MRM          |
| **Approved**                    | MRM   | Locked; triggers data gen         | Owner + MRM; now visible in inventory |
| **Rejected**                    | MRM   | Terminal; archived with notes     | Owner + MRM                           |

A model in Draft is invisible to MRM. A model in Approved triggers the data engine synchronously
in the background; it appears in the inventory immediately with a "Data generating…" badge that
resolves once the engine completes.

---

## 3. Stage 1 — The Add-Model drawer (Owner only)

### 3.1 Access & permissions

- **"Add Model" button** surfaces only when `usePermissions().canAddModel` is true (owner role).
- MRM role sees no add-model affordance; if they somehow reach the route, they get a permission wall.

### 3.2 Model fields (Section A of the drawer)

All required unless marked optional.

| Field                 | Input                                                                         | Validation                                       |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| Model ID              | Text (auto-generated `USR-{YYYY}-{seq}`, editable)                            | Unique, uppercase alphanumeric + hyphens         |
| Model Name            | Text                                                                          | ≥ 3 chars                                        |
| Category              | Select: CECL / BSA-AML / ALM / Fraud / Market Risk / Operational Risk / Other | Required                                         |
| Sub-category          | Text (optional)                                                               | —                                                |
| Tier                  | Radio: 1 / 2 / 3                                                              | Required; show SR 11-7 tier definitions on hover |
| Model Owner           | Text (pre-filled from current user)                                           | Required                                         |
| Owner Title           | Text                                                                          | Required                                         |
| Development Framework | Select: Internal / Vendor / Hybrid                                            | Required                                         |
| Methodology           | Textarea                                                                      | ≥ 20 chars                                       |
| Data Sources          | Tag input (add multiple)                                                      | ≥ 1                                              |
| Description           | Textarea                                                                      | ≥ 50 chars                                       |
| Limitations           | Textarea                                                                      | Required                                         |
| Data Limitations      | Textarea (optional)                                                           | —                                                |

### 3.3 Test selection (Section B — dynamic by category)

- Render `MODEL_TEST_MENU[category]` as a checklist; each item shows:
  `[checkbox] Test Name — SR Reference — Default frequency`.
- At least one test must be selected to proceed.
- Category change resets the test selection with a confirmation prompt ("Changing category clears
  your test selections. Continue?").

### 3.4 Per-test configuration (Section C — the gap this PRD fills)

**This section is the core new work.** For each selected test, render an expandable configuration
panel with two sub-sections: **Frequency** and **Thresholds**.

#### Frequency

A select per test:
`Monthly | Quarterly | Semi-Annual | Annual | Ad-Hoc`
Default populated from `TEST_DEFAULTS[testKey].defaultFreq`. Changing from the default marks the
field with a "⚠ Requires MRM approval" inline note — the owner may set any frequency, but a
non-default choice is flagged in the MRM review submission.

#### Thresholds (the dynamic part)

Thresholds are **test-type-specific**. The threshold config panel for a given test renders the
fields defined in `TEST_THRESHOLD_SCHEMA[testType]` (defined below in §3.5). Each field shows:

- The threshold name (e.g. "PSI Stable Limit")
- The default value
- A numeric input (with unit label: %, decimal, count)
- A "Basis" note: what happens at each band (e.g. "< 0.10 = stable, < 0.25 = monitor, ≥ 0.25 = rebuild")
- The regulatory reference it comes from

If the owner leaves a field blank or at default, the default applies. Any override is flagged
in the MRM submission. Thresholds are validated on input (range checks per schema).

### 3.5 `TEST_THRESHOLD_SCHEMA` — the threshold definition registry

Build this as a typed registry in `src/lib/data/test-threshold-schema.ts`. Each entry defines
the editable threshold fields for a given `TestType`. This is the source of truth for the dynamic
threshold UI and for the engines (engines read from the stored config, falling back to defaults).

```ts
interface ThresholdField {
  key: string; // e.g. 'psi_stable_limit'
  label: string; // e.g. 'PSI Stable Limit'
  unit: '%' | 'decimal' | 'count' | 'ratio' | 'bps';
  default: number;
  min: number;
  max: number;
  description: string; // what the band means
  reference: string; // SR ref
  warnBand?: { gt?: number; lt?: number }; // optional warn band (used by engine)
  failBand?: { gt?: number; lt?: number };
}

interface TestThresholdSchema {
  testType: TestType;
  label: string;
  fields: ThresholdField[];
}
```

Populate for all 8 test types:

**source-to-model**

- `completeness_pass`: decimal, default 0.999, min 0.95, max 1.0 — "% of source records matched"
- `completeness_warn`: decimal, default 0.950, min 0.90, max 0.999
- `discrepancy_pass`: decimal, default 0.001, min 0, max 0.05 — "max numeric discrepancy allowed"

**psi**

- `psi_stable`: decimal, default 0.10, min 0.01, max 0.50 — "below = stable"
- `psi_monitor`: decimal, default 0.25, min 0.10, max 0.50 — "between stable and this = monitor"

**csi**

- Same fields as PSI (per-variable PSI, same thresholds, same defaults)

**backtesting** (most complex — sub-fields depend on model type; drive from `modelCategory`)

- `mape_pass_%` : %, default varies (PD 20%, NII 5%, Fraud 15%)
- `mape_warn_%` : %, default varies
- `bias_limit_%` : %, default 0.5 for PD, 2.0 for NII
- `gini_min` : decimal, default 0.50 (discriminatory models only; hide for NII)
- `auc_min` : decimal, default 0.80 (classification models only)

**benchmarking**

- `deviation_warn_%`: %, default 15.0
- `deviation_fail_%`: %, default 25.0
- `percentile_warn`: decimal, default 0.20 (below 20th percentile = warn)
- `percentile_fail`: decimal, default 0.10

**sensitivity**

- `concentration_warn_%`: %, default 50.0 — "single variable drives >X% of output variance"
- `concentration_fail_%`: %, default 70.0

**stress**

- `policy_cap_%`: %, default 10.0 — "no scenario may breach this PD/loss cap"
- `severe_threshold_%`: %, default 7.5 — "above this in any scenario = warn"

**override**

- `override_rate_warn_%`: %, default 20.0
- `override_rate_fail_%`: %, default 30.0
- `conservative_direction_pass_%`: %, default 80.0
- `documentation_pass_%`: %, default 90.0

> **Dynamic by model type**: backtesting fields that only apply to discriminatory/classification
> models (Gini, AUC) must be **hidden** when the selected category is NII/ALM. Show only the fields
> relevant to the category. This is driven by `TEST_THRESHOLD_SCHEMA[testType].categoryRules`.

### 3.6 Submission summary & confirmation

Before submit, show a read-only review panel:

- Model fields summary
- Selected tests + frequencies (non-default flagged)
- Per-test thresholds (overrides from default flagged in amber)
- A declaration checkbox: "I confirm this model submission is accurate and complete"
- **Submit for MRM Review** button (primary) and **Save as Draft** (secondary)

---

## 4. Stage 2 — MRM review queue

### 4.1 Where it lives

A dedicated **"Pending Review"** tab inside the Governance page (`/governance`) and a badge count
on the Governance sidebar nav item. MRM role sees it; Owner role does not.

### 4.2 Queue list

Each submission shows: model ID, name, category, tier, owner name, submitted date, and a status
chip (Awaiting Review / Changes Requested). Sorted by submitted date ascending (oldest first).

### 4.3 Review panel

Clicking a submission opens a full review panel (full-page or large sheet) with:

**Left column — submission detail**

- All model fields (read-only)
- Per-test config: selected tests, frequencies (non-default flagged), thresholds (overrides flagged)
- Any prior round of MRM notes (if this is a resubmission after Changes Requested)

**Right column — MRM actions**

- **Reviewer notes textarea** — required for Changes Requested and Rejected; optional for Approved
- **Three action buttons:**
  - **Approve** — primary; requires the note if thresholds were overridden (reviewer must
    acknowledge the non-standard thresholds). Transitions to Approved; triggers data engine.
  - **Request Changes** — secondary; requires a note. Transitions to Changes Requested; returns
    to owner with notes visible.
  - **Reject** — destructive; requires a note. Transitions to Rejected; model is archived.
- An **audit trail** panel showing every action in this submission's history (actor, action, ts).

### 4.4 Owner visibility

On the Owner side, a submitted model shows in their inventory pre-list as "Pending Models" with
status chips. If Changes Requested, the drawer re-opens in editable mode pre-filled with prior
values and the MRM notes shown in a callout at the top. Owner resubmits → goes back to Awaiting
Review.

---

## 5. Stage 3 — Post-approval: model enters inventory

On Approve:

1. The model's status transitions to `Approved` and `userDefined: true`.
2. It is written to the `StorageAdapter` as a full `Model` record.
3. It appears in the **Model Inventory** immediately with a `"Data generating…"` badge on its row.
4. Its monitoring calendar is built from `selectedTests` via `getMonitoringCalendar`.
5. The **synthetic data engine** is triggered (§6).
6. An audit entry is written: `{ actor: mrmOfficerName, actorType: 'human', action: 'Model approved — data generation triggered' }`.

---

## 6. Stage 4 — Synthetic data generation engine (the background engine)

This is the new, non-trivial technical component. It runs **after approval**, entirely in the
background (no blocking UI), and produces realistic test datasets for the new model so it is
immediately runnable in the Workbench.

### 6.1 Where it runs

Client-side in a **Web Worker** (`src/workers/data-gen.worker.ts`) so the main thread is never
blocked. The worker communicates progress via `postMessage`. The shell listens and updates the
"Data generating…" badge to a progress indicator.

For Claude Code environments where Web Workers aren't available, fall back to a Next.js API route
(`app/api/data-gen/route.ts`) that accepts the model config and returns the generated datasets;
the client polls for completion. Either path is acceptable — the PRD requires non-blocking; choose
whichever is more reliable in the build environment and record the choice in notes.

### 6.2 Generation strategy

The engine inspects the model's `category`, `selectedTests`, and configured thresholds to decide
what to generate. It uses the same deterministic PRNG infrastructure from Phase 1 (`mulberry32`),
seeded from the model's ID so the same model always produces the same data.

```ts
interface DataGenRequest {
  modelId: string;
  modelName: string;
  category: ModelCategory; // drives which generator templates to use
  selectedTests: SelectedTest[];
  thresholds: Record<string, ThresholdConfig>; // the owner/MRM-approved thresholds
  tier: Tier;
  seed: string; // derived from modelId
}

interface DataGenResult {
  modelId: string;
  datasets: GeneratedDataset[]; // one per relevant test type
  generatedAt: string;
  status: 'complete' | 'partial' | 'failed';
  warnings: string[]; // e.g. "No override log template for category X; using generic"
}
```

### 6.3 Generator templates (per category)

The engine selects a template based on `category`. Each template defines which datasets to
generate and their statistical properties, so the results are category-appropriate:

| Category         | Datasets generated                                                                      | Key planted properties                                                 |
| ---------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CECL             | Loan tape (2,000 rows): LTV, DSCR, PD scores, realized defaults, baseline/current split | PSI in monitor band; backtest MAPE near warn threshold                 |
| BSA-AML          | Transaction feed (10,000 rows): amount, channel, rule, alertFlag, sarOutcome            | FP rate ~95%; alert-to-SAR ~2.5%; an intentional feed-gap for STM fail |
| ALM              | Position tape (3,000 rows): balance, rate, repricing bucket, type                       | NII sensitivity distribution; ±rate shock betas                        |
| Fraud            | Scored transactions (15,000 rows): features, score, fraudLabel                          | AUC ~0.88; score drift for PSI warn                                    |
| Market Risk      | P&L series (1,000 rows): daily P&L, VaR estimate, exceedances                           | VaR backtest ~2% exceedance rate                                       |
| Operational Risk | Loss events (500 rows): category, amount, date, frequency                               | Severity distribution seeded                                           |
| Other            | Generic scored-outcome set (2,000 rows)                                                 | Basic backtest + PSI properties                                        |

For tests the category doesn't have a tailored template for (e.g. an ALM model with an override
test selected), generate a **generic override log** (500 rows) with planted properties that land
near the pass/warn boundary defined by the model's configured thresholds. Always generate
something; never leave a selected test with no data.

### 6.4 Threshold-aware generation

This is the critical property: **the generated data is calibrated to the model's approved
thresholds**, not hardcoded constants. The engine reads the threshold config and plants statistical
properties so:

- At least one test produces a `warn` verdict (the model is interesting from day one)
- At least one test produces a `pass` verdict (the model isn't broken)
- If the owner set a non-default threshold (flagged and approved by MRM), the generated data
  respects those thresholds — the verdicts are computed against the actual configured values

This means: if an owner sets `psi_stable = 0.08` (tighter than the default 0.10), the generated
PSI will be planted to land between 0.08 and 0.25 so it still triggers a `warn` — not a pass that
would be misleading.

### 6.5 Result storage

Completed datasets are stored via `StorageAdapter` under `dataset:<modelId>:<testType>`. The repo
layer's `getDataset(modelId, testType)` returns the generated dataset; the engine registry (Phase 3)
uses it exactly like the built-in seeded datasets. From the engine's perspective, a user-defined
model's data is indistinguishable from the four showcase models' data.

### 6.6 Progress + status reporting

- `0%` — Engine started; template selected
- `25%` — Primary dataset generated
- `50%` — All datasets generated; validation pass
- `75%` — Datasets written to StorageAdapter
- `100%` — Model status updated to `Ready`; badge cleared; toast: "Model [Name] is ready — run your first test"

If generation fails (unexpected error in the worker/route), the model stays in inventory with a
`"Data generation failed"` badge + a retry button. A failed generation must never prevent the
model from appearing in inventory — it just means the Workbench will fall back to illustrative
results until retry succeeds.

---

## 7. Full audit trail

Every state transition and notable action in the lifecycle appends an `AuditEntry` to the model
record (same pattern as findings in Phase 5):

| Event                    | Actor type    | Action string                                |
| ------------------------ | ------------- | -------------------------------------------- |
| Draft saved              | human (owner) | "Draft saved"                                |
| Submitted                | human (owner) | "Submitted for MRM review"                   |
| MRM opened for review    | human (mrm)   | "Review opened"                              |
| Changes requested        | human (mrm)   | "Changes requested: {note}"                  |
| Resubmitted              | human (owner) | "Resubmitted after changes"                  |
| Approved                 | human (mrm)   | "Approved — data generation triggered"       |
| Rejected                 | human (mrm)   | "Rejected: {note}"                           |
| Data generation complete | system        | "Synthetic datasets generated — model ready" |
| Data generation failed   | system        | "Data generation failed: {error}"            |

---

## 8. State machine (guard all transitions)

```
DRAFT ──submit──> AWAITING_REVIEW
AWAITING_REVIEW ──request_changes──> CHANGES_REQUESTED
AWAITING_REVIEW ──approve──> APPROVED  (triggers data engine)
AWAITING_REVIEW ──reject──> REJECTED
CHANGES_REQUESTED ──resubmit──> AWAITING_REVIEW
APPROVED ──(data engine complete)──> READY
APPROVED ──(data engine failed)──> DATA_GEN_FAILED
DATA_GEN_FAILED ──retry──> APPROVED  (re-triggers engine)
REJECTED ──(terminal)──> (no transitions)
```

Enforce in `src/lib/model-onboarding/transitions.ts`. Illegal transitions throw; all valid
transitions are unit-tested.

---

## 9. Data model additions

Add to the domain types (extend Phase 1):

```ts
type ModelOnboardingStatus =
  | 'draft'
  | 'awaiting_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'ready'
  | 'data_gen_failed';

interface ThresholdConfig {
  testKey: string;
  testType: TestType;
  fields: Record<string, number>; // fieldKey -> value (owner-configured or default)
  overridesDefault: boolean;
  mrmAcknowledged?: boolean; // set to true when MRM approves an override
}

interface ModelSubmission {
  id: string; // submission ID, e.g. SUB-2026-001
  modelId: string;
  status: ModelOnboardingStatus;
  model: Partial<Model>; // the fields as filled in the drawer
  selectedTests: SelectedTest[];
  thresholdConfigs: ThresholdConfig[];
  mrmNotes: string;
  priorNotes: string[]; // notes from previous rounds if resubmitted
  auditTrail: AuditEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  dataGenStatus?: 'pending' | 'generating' | 'complete' | 'failed';
  dataGenProgress?: number; // 0–100
}
```

StorageAdapter keys: `submission:<submissionId>`, `dataset:<modelId>:<testType>`.

---

## 10. UI components needed (new, per PRD-11 design system)

- `<ModelOnboardingDrawer>` — multi-section sheet (model fields → test selection → per-test config
  → review panel); progress indicator at top showing current section; stepper navigation.
- `<TestConfigPanel testKey threshold onchange>` — expandable per-test panel rendering the
  threshold fields from `TEST_THRESHOLD_SCHEMA[testType]`; non-default values visually flagged.
- `<ThresholdField field value onChange>` — a labeled numeric input with unit, description, bands;
  shows a mini range-bar showing where the entered value sits vs. the warn/fail bands.
- `<MrmReviewPanel submission onApprove onRequestChanges onReject>` — two-column review layout.
- `<SubmissionStatusCard submission>` — for the owner's pending-models list; shows stage, last
  action, and MRM notes when in Changes Requested state.
- `<DataGenProgressBadge modelId>` — a small animated progress indicator on the inventory row;
  resolves to a "Ready" chip or a "Failed / Retry" chip.

All components use the Phase 0 / PRD-11 kit; no color literals; both themes; keyboard + a11y.

---

## 11. Integration points (how this connects to existing phases)

- **Phase 1 (data layer):** `StorageAdapter` already exists; add `ModelSubmission` and `ThresholdConfig`
  to the key map and the repo functions. Add `getSubmission(id)`, `listSubmissions(status)`,
  `saveSubmission(s)`, `getDataset(modelId, testType)`.
- **Phase 2 (inventory):** Show pending models in a separate pre-list above the main inventory;
  Ready models flow into the main table. The "Data generating…" / "Ready" badge comes from
  `dataGenStatus`.
- **Phase 3 (engines):** The engine registry's `getDataset(modelId, testType)` call now returns
  generated data for user-defined models. No engine code changes — only the data source changes.
  The `ThresholdConfig` replaces hardcoded constants in engine verdict computation; engines must
  read from config, falling back to defaults.
- **Phase 5 (findings):** A failed test on a new user-defined model can still trigger the
  create-finding flow. No changes needed.
- **Phase 6 (calendar + governance):** The Governance page gains the MRM review queue tab (§4.1).
  The monitoring calendar builder already reads `selectedTests` — no changes needed there.

---

## 12. Acceptance criteria

### Workflow

- [ ] "Add Model" button visible only to Owner role; MRM role sees no affordance.
- [ ] Multi-section drawer: all model fields validate correctly; category change resets tests with confirmation.
- [ ] Test selection renders `MODEL_TEST_MENU[category]`; at least one test required to proceed.
- [ ] Per-test config renders the correct threshold fields from `TEST_THRESHOLD_SCHEMA` for each selected test; fields hidden/shown correctly by model category (e.g. Gini hidden for ALM).
- [ ] Non-default frequency and threshold overrides are flagged in the submission summary.
- [ ] Draft save persists across reload; resubmit after Changes Requested pre-fills and shows MRM notes.
- [ ] State machine: all valid transitions tested; illegal transitions throw; all 9 states reachable in the test suite.
- [ ] Full audit trail written at every transition.

### MRM queue

- [ ] Submitted models appear in MRM Governance queue; Owner cannot see the queue.
- [ ] Review panel shows all fields, flagged overrides, prior notes; all three actions work with correct preconditions (note required for Changes Requested + Reject; note required for Approve when thresholds overridden).
- [ ] On Approve: model immediately appears in inventory with "Data generating…" badge.
- [ ] On Request Changes: owner sees the model unlocked with MRM notes in a callout.
- [ ] On Reject: model archived; owner sees terminal state.

### Data engine

- [ ] Engine runs non-blocking (Web Worker or API route); main thread never freezes.
- [ ] Correct template selected by category; all selected tests have a dataset generated.
- [ ] Generated data is threshold-aware: verdicts computed against approved thresholds (not hardcoded defaults) land at least one warn and one pass.
- [ ] Same modelId + seed → identical datasets (determinism tested).
- [ ] Progress badge updates 0→25→50→75→100; on complete: toast + "Ready" chip; on fail: "Failed / Retry" chip + retry works.
- [ ] Generated datasets retrievable by `getDataset(modelId, testType)`; the Workbench runs the showcase engines against them without code changes.

### Quality

- [ ] Lint/typecheck/test clean; no `any`; named exports; tokens not literals.
- [ ] All 6 new components score ≥ 9 on all 8 axes of PRD-11 §9 polish rubric.
- [ ] `PRD-12-NOTES.md`: records Web Worker vs. API route choice, per-category template details, threshold calibration approach, and any test-type/category combinations that use the generic fallback.
