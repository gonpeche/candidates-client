# Design Doc — Emi Candidate Screening

> Generated via the RADIO framework following the grill-me Q&A session.
> See [`MANIFEST.md`](./MANIFEST.md) for process rules and stack decisions.

---

## Requirements

### Functional

- Display a paginated list of candidates (25 per page) fetched from the backend
- Respect column visibility defined in `columns.json`
- Filter candidates by status (All / Approved / Rejected) via a dropdown
- Search candidates by name and email via a global text input
- Reclassify candidates:
  - **Approve** a rejected candidate: confirmation dialog → `PATCH /candidates/:id` with `{ reasons: [] }`
  - **Reject** an approved candidate: modal with multi-select of rejection reasons → `PATCH /candidates/:id` with `{ reasons: string[] }`
- Display candidate status as a shadcn `Badge` component ("Approved" / "Rejected")
- Show rejection reasons on hover and focus of a "Rejected" badge via a tooltip
- Show a loading spinner in the modal/dialog action button during mutation
- Display toast notifications on successful or failed reclassification
- Show a skeleton table during initial data load
- Show an inline error message with a retry button if the initial data fetch fails

### Non-Functional

- **Responsive:** mobile shows name, status, and action columns only; tablet and desktop show the full column set as defined by `columns.json`
- **Accessible:** fully keyboard-operable approve/reject flows (focus trap, `Escape` to close, arrow key navigation via Radix UI); tooltip shown on hover and focus; `aria-describedby` + `sr-only` span for rejection reasons on screen readers; badge text is the primary status signal (color is decorative only)
- **Performance:** all filtering, sorting, and pagination are handled client-side — 50 candidates does not justify a server-side query layer. Filtered and sorted candidate lists and column definitions are memoized with `useMemo` to avoid unnecessary re-renders. TanStack Query handles server response caching.

### Out of Scope

- Advanced search beyond name and email
- WCAG 2.1 AA compliance (general best practices only)
- Column toggle UI (column visibility is driven solely by `columns.json` and responsive breakpoints)
- Bulk reclassification

---

## Architecture

### Client / Server Split

```
challenge-gonpeche/
├── client/   # React + TypeScript + Vite
└── server/   # Node.js + Express
```

The server is a thin data layer: it reads `candidates.json` and `columns.json` from disk, holds candidates in memory to support mutations, and exposes a small REST API. No business logic beyond serialization lives there.

The client owns all derived state: status computation, filtering, pagination, and column visibility merging.

### API Endpoints

| Method  | Path                 | Description                                                                                                                                                                                       |
| ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/candidates`        | Returns the full candidate array                                                                                                                                                                  |
| `GET`   | `/columns`           | Returns the raw `columns.json` boolean map                                                                                                                                                        |
| `GET`   | `/rejection-reasons` | Returns a hardcoded array of available rejection reason strings                                                                                                                                   |
| `PATCH` | `/candidates/:id`    | Updates a candidate's `reason` field. Body: `{ reasons: string[] }` — the server joins the array into a comma-separated string before saving. Approve = `[]`, Reject = one or more reason strings |

### State Management

| State                                   | Owner  | Mechanism                                                                                                              |
| --------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Candidates list                         | Server | TanStack Query — `useCandidates` hook                                                                                  |
| Column visibility config                | Server | TanStack Query — `useColumns` hook                                                                                     |
| Available rejection reasons             | Server | TanStack Query — `useRejectionReasons` hook                                                                            |
| Candidate mutation                      | Server | TanStack Query — `useReclassifyCandidate` hook (invalidates candidates query on success)                               |
| Status filter, search input, pagination | Client | `useState` local to the page component                                                                                 |
| Column visibility state                 | Client | TanStack Table `columnVisibility` — initialized from `GET /columns`, overridden per breakpoint for responsive behavior |
| Modal / dialog open state               | Client | `useState` local to the action component                                                                               |

### Communication Conventions

- All API responses are JSON
- The client uses `fetch` via TanStack Query custom hooks
- Mutations use `PATCH` with a `Content-Type: application/json` body
- Error responses return `{ error: string }` with an appropriate HTTP status code

---

## Data Model

### Raw types (from `candidates.json` and `columns.json`)

```typescript
interface Candidate {
  id: string;
  name: string;
  document: number;
  cv_zonajobs: string;
  cv_bumeran: string;
  phone: string;
  email: string;
  date: string;
  age: number;
  has_university: string;
  career: string;
  graduated: string;
  courses_approved: string;
  location: string;
  accepts_working_hours: string;
  desired_salary: string;
  had_interview: string;
  reason: string; // "" = approved, comma-separated string = rejected
}

type ColumnVisibilityMap = Record<keyof Candidate, boolean>;
```

### API response types

```typescript
// GET /candidates
type CandidatesResponse = Candidate[];

// GET /columns
type ColumnsResponse = ColumnVisibilityMap;

// GET /rejection-reasons
interface RejectionReasonsResponse {
  reasons: string[];
}

// PATCH /candidates/:id — request body
interface ReclassifyPayload {
  reasons: string[]; // [] = approve, [...] = reject
}
```

### Derived UI types

```typescript
type CandidateStatus = "approved" | "rejected";

// Status is derived inside useCandidates — not a standalone utility.
// Logic: reason === "" => "approved", non-empty => "rejected"
```

---

## Interface Design

### Main View

```
┌─────────────────────────────────────────────────────────┐
│  Emi — Candidate Screening                              │
├─────────────────────────────────────────────────────────┤
│  [Status ▾]  [Search by name or email...]               │
├────────┬────────┬──────┬─────────┬──────────┬──────────┤
│ Name   │ Email  │ ...  │ Status  │  Action  │          │
├────────┼────────┼──────┼─────────┼──────────┤          │
│ ...    │ ...    │ ...  │ ●Appr.  │   ⋯      │          │
│ ...    │ ...    │ ...  │ ●Rejec. │   ⋯      │          │
├─────────────────────────────────────────────────────────┤
│  < 1 2 3 >                          25 per page         │
└─────────────────────────────────────────────────────────┘
```

**Key components:**

- `CandidateTable` — TanStack Table instance; columns from `useColumns` + pinned Status + Action
- `StatusFilter` — shadcn `Select` dropdown; controls the status filter state
- `SearchInput` — text input; filters by name and email client-side
- `StatusBadge` — shadcn `Badge`; wraps shadcn `Tooltip` (shows on hover and focus); includes `aria-describedby` + `sr-only` reasons span for screen readers
- `ActionMenu` — horizontal kebab (⋯) button; opens shadcn `DropdownMenu` with a single context-aware action
- `ApproveDialog` — shadcn `AlertDialog`; confirmation step before approving
- `RejectModal` — shadcn `Dialog`; checkbox list of reasons from `useRejectionReasons`; confirm button with loading spinner
- `TableSkeleton` — placeholder rows shown during initial fetch
- `TableError` — inline error message + retry button (`refetch` from TanStack Query)
- `Toaster` — shadcn `Sonner` toast; triggered on mutation success or error

### Responsive Behavior

| Breakpoint                | Visible columns                                  |
| ------------------------- | ------------------------------------------------ |
| Mobile (`< sm`)           | Name, Status, Action                             |
| Tablet + Desktop (`≥ sm`) | All columns per `columns.json` + Status + Action |

Managed via TanStack Table `columnVisibility` state — the breakpoint override is merged on top of the server-driven visibility config.

---

## Optimizations & Nice-to-haves

| Feature                            | Notes                                                                                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advanced search                    | Extend the search input to filter by additional fields (location, career, salary range). Scoped out — name + email covers the primary use case                                                 |
| Server-side filtering & pagination | Necessary at scale (thousands of candidates). Deferred — 50 candidates is handled client-side without performance issues                                                                       |
| Column toggle UI                   | Let recruiters show/hide columns interactively from the main table. `columnVisibility` state already supports this; just needs a UI control (e.g. a column visibility dropdown in the toolbar) |
| Add rejection reasons on the fly   | Allow recruiters to define new rejection reasons directly from the reject modal, without requiring a server config change                                                                      |
| Bulk reclassification              | Select multiple candidates and approve/reject in one action. High recruiter value at scale                                                                                                     |
| Candidate detail panel             | Side panel or dedicated route showing all candidate fields. Useful when `columns.json` hides information the recruiter occasionally needs                                                      |
| Export to CSV                      | Download the current filtered view. Common recruiter workflow                                                                                                                                  |
| Optimistic updates                 | Update the table instantly on action, roll back on error. Low value for this dataset and interaction frequency                                                                                 |

---

## Assumptions

| #   | Assumption                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The `GET /rejection-reasons` endpoint returns a hardcoded list derived from the unique reasons present in `candidates.json`                      |
| 2   | The `reason` column from `columns.json` is set to `true` and always visible; the Status badge is an additional derived column, not a replacement |
| 3   | The `id` field is always used as the TanStack Table row key, regardless of its visibility setting in `columns.json`                              |
| 4   | Date strings are displayed as-is without formatting or timezone conversion                                                                       |
| 5   | `columns.json` is the sole configuration for column visibility at runtime; there is no API or UI to modify it                                    |
| 6   | The Action and Status columns are always rendered regardless of `columns.json` content — they are UI concerns, not data fields                   |

---

## Folder Structure

```
challenge-gonpeche/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/                        ← typed fetch functions, one file per resource
│   │   │   ├── candidates.ts           ← fetchCandidates(), patchCandidate()
│   │   │   ├── columns.ts              ← fetchColumns()
│   │   │   └── rejectionReasons.ts     ← fetchRejectionReasons()
│   │   │
│   │   ├── components/
│   │   │   ├── candidates/             ← all candidate-table UI
│   │   │   │   ├── CandidateTable.tsx  ← TanStack Table instance and layout
│   │   │   │   ├── candidateColumns.tsx← TanStack column definitions
│   │   │   │   ├── ActionMenu.tsx      ← horizontal kebab + DropdownMenu
│   │   │   │   ├── ApproveDialog.tsx   ← confirmation AlertDialog
│   │   │   │   ├── RejectModal.tsx     ← reason multi-select Dialog
│   │   │   │   ├── StatusBadge.tsx     ← Badge + Tooltip + aria-describedby
│   │   │   │   ├── TableSkeleton.tsx   ← placeholder rows during initial fetch
│   │   │   │   └── TableError.tsx      ← inline error message + retry button
│   │   │   │
│   │   │   ├── filters/                ← toolbar controls
│   │   │   │   ├── StatusFilter.tsx    ← shadcn Select (All / Approved / Rejected)
│   │   │   │   └── SearchInput.tsx     ← text input for name + email search
│   │   │   │
│   │   │   └── ui/                     ← shadcn/ui generated components (do not edit manually)
│   │   │
│   │   ├── constants/
│   │   │   ├── api.ts                  ← API base URL
│   │   │   ├── breakpoints.ts          ← responsive breakpoint values
│   │   │   └── columns.ts              ← mobile column priority config
│   │   │
│   │   ├── hooks/                      ← all TanStack Query logic lives here
│   │   │   ├── useCandidates.ts        ← fetches candidates; derives status from reason
│   │   │   ├── useColumns.ts
│   │   │   ├── useRejectionReasons.ts
│   │   │   └── useReclassifyCandidate.ts
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts                ← shadcn cn() helper (auto-generated)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                ← Candidate, ColumnVisibilityMap, CandidateStatus, payload types
│   │   │
│   │   ├── App.tsx                     ← app shell: QueryClientProvider, Toaster, main layout
│   │   ├── index.css                   ← Tailwind directives + shadcn CSS variables
│   │   └── main.tsx                    ← React entry point
│   │
│   ├── tests/                          ← RTL unit and integration tests
│   │   ├── components/
│   │   │   ├── StatusBadge.test.tsx
│   │   │   ├── ActionMenu.test.tsx
│   │   │   ├── ApproveDialog.test.tsx
│   │   │   └── RejectModal.test.tsx
│   │   └── hooks/
│   │       ├── useCandidates.test.ts
│   │       ├── useColumns.test.ts
│   │       ├── useRejectionReasons.test.ts
│   │       └── useReclassifyCandidate.test.ts
│   │
│   ├── e2e/                            ← Playwright end-to-end tests
│   │   ├── approve.spec.ts             ← approve a rejected candidate flow
│   │   └── reject.spec.ts              ← reject an approved candidate flow
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── data/                       ← source files, read once at startup
│   │   │   ├── candidates.json
│   │   │   └── columns.json
│   │   ├── routes/
│   │   │   ├── candidates.ts           ← GET /candidates, PATCH /candidates/:id
│   │   │   ├── columns.ts              ← GET /columns
│   │   │   └── rejectionReasons.ts     ← GET /rejection-reasons
│   │   └── index.ts                    ← Express setup, in-memory store, route mounting
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── AI_LOG.md
│   ├── DESIGN_DOC.md
│   ├── MANIFEST.md
│   └── TICKETS.md
└── README.md
```
