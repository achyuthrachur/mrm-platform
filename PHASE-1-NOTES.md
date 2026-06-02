# Phase 1 — Notes, Decisions, Deviations

## Generators summary

| Generator              | Seed         | Rows                            | Planted properties                                                               |
| ---------------------- | ------------ | ------------------------------- | -------------------------------------------------------------------------------- |
| `creLoanTape`          | 42           | 2,500 (50/50 baseline/current)  | LTV drift Δ=4 → PSI ≈ 0.12; PD bias ×1.17 → population MAPE ~17–18%; Gini ≈ 0.61 |
| `creLoanTapeModelCopy` | 42 (derived) | 2,494                           | 6 missing records + 8 LTV discrepancies → completeness 99.76% → warn             |
| `amlTransactions`      | 137          | 25,000                          | ACH-RETURN feed present in source; alert→SAR ≈ 2.1%; FP ≈ 97.8%                  |
| `amlOverrideLog`       | 138          | 12,000                          | Override ≈ 25%; conservative ≈ 89%; documented ≈ 94.8% → pass                    |
| `fraudScoredTxns`      | 271          | 30,000 (50/50 baseline/current) | Fraud ≈ 1.2%; AUC ≈ 0.93; score drift in current → PSI mild warn                 |
| `almPositions`         | 314          | 5,000 (60% loans, 40% deposits) | Liability-sensitive; low deposit betas → -200bps → NII ≈ -22%                    |

All generators are deterministic (same seed → same rows). Tested.

## Authored reference data

- `NII_BACKTEST_SERIES`: 8-quarter series, MAPE ≈ 2.2% (pass)
- `NII_RATE_SHOCK_SCENARIOS`: -200bps = −22% NII → warn (near −25% limit)
- `NII_SENSITIVITY_INPUTS`: Deposit Beta dominates at 35.8% share → warn
- `CRE_STRESS_SCENARIOS`: All scenarios below 10% cap → pass

## Demo "now"

Fixed to `2026-04-07`. All due/overdue calculations deterministic against this date.

## Storage key map

| Prefix                  | Content                               |
| ----------------------- | ------------------------------------- |
| `model:<id>`            | Model overrides / user-created models |
| `finding:<id>`          | Finding state                         |
| `run:<modelId>:<runId>` | Test run results                      |
| `freq-approval:<id>`    | Frequency change requests (Phase 6)   |
| `threshold:<id>`        | Threshold overrides (Phase 3)         |
| `flag:<id>`             | Flagged items (Phase 5)               |
| `prefs:<key>`           | User preferences                      |

## Deviations from PRD

- `illustrative-results.ts` covers scheduled tests for all 12 non-showcase models (~30 entries).
- AML-2024-003 (EDD Trigger Model) added as 12th illustrative model.
- PSI test tolerance is generous (0.05–0.35) because the 10-bin estimation varies with bin selection.

## Acceptance criteria status

| #   | Criterion                                                                                 | Status |
| --- | ----------------------------------------------------------------------------------------- | ------ |
| 1   | All types, 16 models, 12 findings, calendars, histories, macro, peers, dependencies typed | ✅     |
| 2   | Every generator pure + deterministic                                                      | ✅     |
| 3   | Planted properties asserted by tests                                                      | ✅     |
| 4   | Repo merges seed/generated data with persisted overrides                                  | ✅     |
| 5   | StorageAdapter round-trips; `resetDemoData()` restores seed                               | ✅     |
| 6   | `getToday()` fixed + documented; due/overdue helpers tested                               | ✅     |
| 7   | Illustrative results: `computed:false`, no formula, tested                                | ✅     |
| 8   | `PHASE-1-NOTES.md` written                                                                | ✅     |
