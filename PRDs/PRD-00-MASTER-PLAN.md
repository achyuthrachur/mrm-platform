# MRM Platform — Master Build Plan (PRD 00)

> **Purpose of this document.** This is the controlling plan for converting `mrm-demo.html`
> (a single ~8,200-line HTML/CSS/JS wireframe) into a polished, real application built on the
> AI Innovation Team standard stack. It defines the architecture, conventions, the phase map,
> and the non-negotiable "definition of done" that every phase PRD inherits.
>
> **How to use it.** Hand Claude Code **one phase PRD at a time**, in order. Each phase PRD
> assumes the conventions and contracts defined here. Do not skip phases — later phases depend
> on the typed data layer, compute engines, and storage adapter built earlier.

---

## 1. What we are building

A Model Risk Management (MRM) monitoring platform for banking/financial-services model
governance, aligned to SR 11-7 / SR 26-2 and related frameworks. Two personas (Model Owner,
MRM Officer), seven functional areas (Dashboard, Model Inventory, Testing Workbench, Findings
Tracker, Performance Monitor, Governance, Dependencies). The product must:

- **Run validation tests for real** against bundled demo datasets (real math, deterministic).
- **Show the formula** behind every test that runs (inputs, intermediate values, the equation).
- **Show outputs** (metrics tables, verdicts, traffic lights, charts) that reconcile to the math.
- **Export results** (CSV / XLSX / PDF) as standalone artifacts.
- **Flag findings for review** with persistent status and an audit trail.
- **Look like a shipped product**, not a wireframe.

The current wireframe is the **functional and visual reference**, not the codebase. We rebuild
clean; we port data and math verbatim.

---

## 2. The architecture decision (READ THIS FIRST)

The wireframe fakes most test execution. Two engines compute for real (`runStmReconciliation`,
`computePsiCsiResult`); five test types (backtesting, benchmarking, sensitivity, stress,
override) are hardcoded `TEST_RESULTS` narratives behind a fake spinner.

**Chosen architecture: "real-compute demo."**

| Concern      | Decision                                                                                             | Swap-point for full production                                        |
| ------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Framework    | Next.js 14+ App Router, TypeScript                                                                   | —                                                                     |
| Compute      | Real TS engines, run client-side (and Next API routes for heavy runs) against bundled typed datasets | Move engines into API routes / a Python microservice if datasets grow |
| Persistence  | `StorageAdapter` interface; default `IndexedDbAdapter` (localStorage fallback)                       | Implement `PrismaAdapter` against the same interface (Phase 1 + 5)    |
| Auth / roles | Demo role switcher behind `usePermissions()`, shaped like RBAC                                       | Replace switcher with NextAuth/Clerk session; keep the hook (Phase 7) |
| Charts       | Recharts                                                                                             | —                                                                     |
| Data         | Bundled, typed seed modules (synthetic but realistic)                                                | Replace seed import with DB queries (Phase 1)                         |

**Rule:** No test renders a "formula" or "computed metric" unless a real engine produced it from
real input data. Tests that cannot be genuinely computed are labeled `illustrative` in the UI and
do **not** get a formula panel. We do not dress up hardcoded numbers as math.

---

## 3. Standard stack & conventions (from team skills)

Claude Code must load these skills at the start of every phase:
`tech-stack`, `architecture`, `frontend`, `crowe-brand`, `qa`, and `animation-components` /
`deployment` where relevant.

- **Stack:** Next.js 14+ (App Router, TS), Tailwind + CSS variables, shadcn/ui, Motion, Recharts,
  Lucide icons, Zustand (only where Context gets unwieldy), Vitest + React Testing Library, Vercel.
- **TS:** `interface` for shapes, `type` for unions; explicit param/return types; never `any`
  (use `unknown`); no needless assertions.
- **React:** functional components only; **named exports**; colocate component + test + styles;
  `PascalCase` components, `kebab-case` routes.
- **API routes:** validate inputs with `zod`; response shape
  `{ data: T, error: null } | { data: null, error: { message, code } }`; correct HTTP codes;
  never leak stack traces.
- **Forms:** `react-hook-form`. **Server state:** React Query/SWR if/when fetching is added.
- **Before every commit:** `npm run lint && npm run typecheck && npm run test`. Husky + lint-staged.
- **Commits:** Conventional Commits. Branch `feature/<phase>-<slug>`.

### Brand (already matches the wireframe palette)

- Background **Crowe Indigo Dark `#011E41`**; primary accent **Amber `#F5A800`**; secondaries
  Teal `#05AB8C`, Cyan `#54C0E8`, Blue `#0075C9` (accents only, never dominate, never for body text).
- Data viz on indigo, white labels, bold simple shapes, limited palette per chart.
- Headings/buttons may be ALL CAPS; sentence case default; en dashes for ranges; no Oxford comma;
  no punctuation in headings/buttons.
- **Logo:** use the official asset files in `src/assets/` — never reconstruct in code. White
  wordmark on the (always-indigo) header. The wireframe's inline SVG logo must be **replaced** with
  the official asset; if the asset is unavailable, leave a clearly-marked `TODO` and a placeholder,
  do not approximate the mark.

> **Light mode:** the wireframe ships a full light theme. Keep it. Drive both themes from CSS
> variables / Tailwind `dark:` so no component hardcodes colors.

---

## 4. Phase map

| Phase | PRD file                                          | Delivers                                                                                                                      | Hard dependency |
| ----- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 0     | `PRD-01-PHASE-0-foundation.md`                    | App scaffold, design tokens, layout shell (navbar/sidebar/role+theme toggles), routing for all 7 areas, Vercel skeleton       | —               |
| 1     | `PRD-02-PHASE-1-data-domain.md`                   | TS domain types, all seed data ported & typed, data-access layer, `StorageAdapter`, app state store                           | 0               |
| 2     | `PRD-03-PHASE-2-inventory-dashboard.md`           | Model Inventory (table/filters/detail) + Dashboard (tiles, charts, heat map, test-health)                                     | 1               |
| 3     | `PRD-04-PHASE-3-compute-engine-workbench.md`      | **Real compute engines** for all test types + formula-transparency panels + Testing Workbench + CSV upload                    | 1, 2            |
| 4     | `PRD-05-PHASE-4-results-export.md`                | Result rendering components, charts, run history, export to CSV/XLSX/PDF                                                      | 3               |
| 5     | `PRD-06-PHASE-5-findings-flag-review.md`          | Findings Tracker, create-finding-from-failed-test, flag-for-review workflow, status transitions, audit trail, MRM review gate | 1, 3            |
| 6     | `PRD-07-PHASE-6-calendar-governance-addmodel.md`  | Monitoring calendar, Add-Model drawer + frequency-approval workflow, Governance, macro panel                                  | 1, 3            |
| 7     | `PRD-08-PHASE-7-dependencies-polish-qa-deploy.md` | Dependency graph, animation/polish, a11y (WCAG AA), perf, full test pass, CI/CD, production deploy                            | all             |

---

## 5. Canonical data contracts (authoritative)

These types are defined in full in Phase 1 and imported everywhere. Summarized here so every
phase shares one mental model. Do not redefine ad hoc.

```ts
type Role = 'owner' | 'mrm';
type Tier = 1 | 2 | 3;
type Verdict = 'pass' | 'warn' | 'fail';
type TrafficLight = 'Green' | 'Yellow' | 'Red';
type DataConfidence = 'High' | 'Moderate' | 'Limited';
type TestType =
  | 'source-to-model'
  | 'backtesting'
  | 'benchmarking'
  | 'sensitivity'
  | 'stress'
  | 'override'
  | 'psi'
  | 'csi';

interface Model {
  id: string;
  name: string;
  cat: string;
  sub: string;
  tier: Tier;
  owner: string;
  ownerTitle: string;
  status: string;
  risk: 'High' | 'Medium' | 'Low';
  valStatus: string;
  lastVal: string;
  nextVal: string;
  framework: string;
  method: string;
  sources: string[];
  openFx: number;
  totalFx: number;
  desc: string;
  limits: string;
  dataLimits: string;
  monFreq: string;
  approvedBy: string;
  approvalDate: string;
  heatX?: number;
  heatY?: number;
  monPlan?: string;
  userDefined?: boolean;
  selectedTests?: SelectedTest[];
}

interface MetricRow {
  label: string;
  value: string;
  threshold: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  note?: string;
}

interface TestResult {
  testType: TestType;
  modelId: string;
  verdict: Verdict;
  trafficLight: TrafficLight;
  dataConf: DataConfidence;
  period: string;
  runDate: string;
  dataSources: string[];
  metrics: MetricRow[];
  findings: string[];
  recommendation: string;
  computed: boolean; // true = produced by an engine, false = illustrative
  formula?: FormulaTrace; // present only when computed
  chartType?: string;
  chartData?: unknown;
  dataGaps?: string[];
  proxyUsed?: string[];
  compensating?: string[];
  dataNote?: string;
  improvWith?: string[];
}

interface FormulaTrace {
  name: string;
  equation: string; // human-readable formula
  inputs: Record<string, number | string>;
  steps: { label: string; expression: string; value: number | string }[];
  result: number | string;
  reference: string; // e.g. 'SR 26-2 §II.D'
}

interface Finding {
  id: string;
  modelId: string;
  model: string;
  title: string;
  sev: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Remediation' | 'Closed';
  type: string;
  openDate: string;
  dueDate: string;
  assignedTo: string;
  assignedRole: string;
  desc: string;
  remediation: string;
  validatorNote: string;
  age: number;
  closedDate?: string;
  auditTrail?: AuditEntry[];
  flaggedForReview?: boolean;
  sourceRunId?: string; // links a finding back to the test run that created it
}

interface AuditEntry {
  ts: string;
  actor: string;
  actorType: 'human' | 'ai' | 'system';
  action: string;
}
```

The `StorageAdapter` interface (Phase 1) is the seam for all mutable state:

```ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
```

---

## 6. Definition of done (inherited by EVERY phase)

A phase is complete only when **all** of these pass:

1. `npm run lint && npm run typecheck && npm run test` are clean.
2. No `any`; no default exports for components; no color literals in components (tokens only).
3. New compute logic has Vitest unit tests with **known-answer fixtures** (see `qa` skill).
4. Both light and dark themes render correctly for new UI.
5. Keyboard-navigable; visible focus states; no color-only signaling (pair with icon/label).
6. Every interactive control does something real or is explicitly disabled with a reason —
   **no toast-only stubs** standing in for required functionality.
7. The phase's own acceptance-criteria checklist is fully satisfied.
8. A short `PHASE-N-NOTES.md` is written recording decisions, deviations, and known gaps.

---

## 7. Explicit non-goals for the whole project (unless later changed)

- No real authentication/identity provider (demo role switcher only).
- No real bank data, no PII, no live core-banking integrations.
- No multi-tenant backend; single synthetic "Heartland Commerce Bank" tenant.
- The macro-data live fetch (World Bank/BLS) stays best-effort with a cached fallback; never block UI on it.

> If the stakeholder later wants true production, change only Phase 1 (add `PrismaAdapter` + schema),
> Phase 5 (server-side audit trail), and Phase 7 (NextAuth + env/secrets). The UI and engines do not change.
