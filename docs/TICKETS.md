# Tickets

> Small independent tasks ordered by dependency.
> Every ticket represents a piece of recruiter-facing value.
> See [`DESIGN_DOC.md`](./DESIGN_DOC.md) for full context.

---

## T-01 — Monorepo scaffolding

**As a developer, I want a working monorepo so that client and server can be developed and run independently.**

### Acceptance criteria
- `client/` is scaffolded with Vite + React + TypeScript
- `server/` is scaffolded with Node.js + Express + TypeScript
- Each package has its own `package.json` and `tsconfig.json`
- All dependencies are installed: TailwindCSS, shadcn/ui, TanStack Query, TanStack Table, Lucide, Vitest, React Testing Library, Playwright
- Both `client` and `server` start without errors with a single command each

### Dependencies
None

---

## T-02 — Server: candidate and column endpoints

**As a recruiter, I want the app to load my candidate list and column preferences from the server.**

### Acceptance criteria
- `candidates.json` and `columns.json` are read from `server/src/data/` once at startup and held in memory
- `GET /candidates` returns the full candidates array as JSON
- `GET /columns` returns the raw column visibility map as JSON
- Both endpoints respond with `Content-Type: application/json`
- CORS is enabled for the local client origin
- A non-existent route returns a `404` with `{ error: string }`

### Dependencies
- T-01

---

## T-03 — Client: foundation

**As a developer, I want the client's data layer wired up so that components can fetch and display server data.**

### Acceptance criteria
- `QueryClientProvider` wraps the app in `App.tsx`
- TypeScript types are defined in `client/src/types/index.ts`: `Candidate`, `ColumnVisibilityMap`, `CandidateStatus`, `ReclassifyPayload`, `RejectionReasonsResponse`
- Constants are defined:
  - `constants/api.ts` — `API_BASE_URL`
  - `constants/breakpoints.ts` — mobile breakpoint value
  - `constants/columns.ts` — list of column keys always visible on mobile (`name`, `status`, `action`)
- `api/candidates.ts` exports `fetchCandidates()`
- `api/columns.ts` exports `fetchColumns()`
- `useCandidates` hook fetches candidates via TanStack Query and derives `status` from `reason` inline (`reason === "" ? "approved" : "rejected"`)
- `useColumns` hook fetches the column visibility map via TanStack Query

### Dependencies
- T-01, T-02

---

## T-04 — As a recruiter, I want to see a list of candidates with the columns my admin configured

### Acceptance criteria
- `CandidateTable` renders a TanStack Table instance
- Visible columns match the `true` entries from `GET /columns`, with Status and Action always rendered regardless of the config
- Column definitions live in `candidateColumns.tsx`
- `TableSkeleton` is displayed while data is loading
- `TableError` is displayed on fetch failure, with a "Try again" button that calls `refetch()`
- The table renders all 50 candidates (pagination comes in T-08)

### Dependencies
- T-03

---

## T-05 — As a recruiter, I want to know at a glance whether each candidate was approved or rejected

### Acceptance criteria
- Each row shows a `StatusBadge` in the Status column
- Approved candidates display a green "Approved" badge; rejected candidates display a red "Rejected" badge
- Badge text ("Approved" / "Rejected") is the primary status signal — color is decorative only
- Hovering or focusing a "Rejected" badge shows a tooltip listing the rejection reasons (comma-separated)
- The badge includes `aria-describedby` pointing to a visually hidden `sr-only` span containing the reasons string, so screen readers announce them on focus

### Dependencies
- T-04

---

## T-06 — As a recruiter, I want to filter the candidate list by approval status

### Acceptance criteria
- A `StatusFilter` dropdown (shadcn `Select`) is visible in the toolbar with options: All, Approved, Rejected
- Selecting "Approved" shows only candidates with `status === "approved"`
- Selecting "Rejected" shows only candidates with `status === "rejected"`
- Selecting "All" clears the filter and shows all candidates
- The default selection is "All"
- Filtering is applied client-side on the memoized candidate list

### Dependencies
- T-04

---

## T-07 — As a recruiter, I want to search for a candidate by name or email

### Acceptance criteria
- A `SearchInput` text field is visible in the toolbar
- Typing filters the candidate list to rows where `name` or `email` contains the search string (case-insensitive)
- The filter applies client-side on the memoized candidate list
- Clearing the input restores the full list
- Search and status filter compose: both can be active simultaneously

### Dependencies
- T-04

---

## T-08 — As a recruiter, I want to navigate through the candidate list page by page

### Acceptance criteria
- The table displays 25 candidates per page
- Pagination controls (previous, next, page numbers) are visible below the table
- The current page resets to 1 when the status filter or search input changes
- Pagination state is managed client-side via TanStack Table

### Dependencies
- T-06, T-07

---

## T-09 — Server: reclassification endpoints

**As a recruiter, I want my approve and reject actions to be saved by the server.**

### Acceptance criteria
- `GET /rejection-reasons` returns `{ reasons: string[] }` with a hardcoded list of all unique rejection reasons present in `candidates.json`
- `PATCH /candidates/:id` accepts `{ reasons: string[] }` in the request body
  - Joins the array into a comma-separated string and updates the in-memory candidate's `reason` field
  - Approve: `reasons: []` → `reason: ""`
  - Reject: `reasons: ["Reason A", "Reason B"]` → `reason: "Reason A, Reason B"`
- Returns the updated candidate object on success
- Returns `404` with `{ error: string }` if the candidate ID is not found
- Returns `400` with `{ error: string }` if `reasons` is missing or not an array

### Dependencies
- T-01

---

## T-10 — As a recruiter, I want to approve a rejected candidate

### Acceptance criteria
- Each table row has an `ActionMenu`: a horizontal kebab (⋯) button in the Action column
- Clicking the kebab opens a shadcn `DropdownMenu`
- For a **rejected** candidate, the dropdown shows a single option: "Approve Candidate"
- Clicking "Approve Candidate" opens a shadcn `AlertDialog` asking for confirmation
- The dialog's confirm button shows a loading spinner while the request is in flight
- On confirm, `useReclassifyCandidate` calls `PATCH /candidates/:id` with `{ reasons: [] }`
- On success: the dialog closes and TanStack Query invalidates the candidates cache, refreshing the table
- On error: the dialog stays open
- The confirm button is focusable and operable via keyboard; the dialog traps focus and closes on `Escape`

### Dependencies
- T-05, T-09

---

## T-11 — As a recruiter, I want to reject an approved candidate

### Acceptance criteria
- For an **approved** candidate, the `ActionMenu` dropdown shows a single option: "Reject Candidate"
- Clicking "Reject Candidate" opens a shadcn `Dialog` modal
- The modal fetches available reasons via `useRejectionReasons` (calls `GET /rejection-reasons`)
- The modal displays a checkbox list of all available rejection reasons
- The confirm button is disabled until at least one reason is selected
- The confirm button shows a loading spinner while the request is in flight
- On confirm, `useReclassifyCandidate` calls `PATCH /candidates/:id` with `{ reasons: string[] }`
- On success: the modal closes and TanStack Query invalidates the candidates cache, refreshing the table
- On error: the modal stays open
- The modal traps focus, and all checkboxes and buttons are reachable via keyboard; closes on `Escape`

### Dependencies
- T-10

---

## T-12 — As a recruiter, I want to be notified when a reclassification succeeds or fails

### Acceptance criteria
- A shadcn `Sonner` toaster is mounted once in `App.tsx`
- A success toast appears when an approve or reject mutation completes successfully
- An error toast appears when an approve or reject mutation fails
- Toasts appear without interrupting the recruiter's workflow (non-blocking)

### Dependencies
- T-10, T-11

---

## T-13 — As a recruiter, I want to use the app comfortably on my phone

### Acceptance criteria
- On mobile (below the breakpoint defined in `constants/breakpoints.ts`), only the columns listed in `constants/columns.ts` are visible: name, status, and action
- On tablet and desktop, the full column set from `GET /columns` is shown
- Column visibility is managed via TanStack Table's `columnVisibility` state, merging the server config with the responsive override
- The toolbar (filter, search) and pagination controls are usable on a small screen without horizontal overflow

### Dependencies
- T-08

---

## T-14 — As a recruiter, I want to navigate the entire app using only a keyboard

### Acceptance criteria
- The status filter dropdown, search input, and pagination controls are all reachable and operable via `Tab` and `Enter`/`Space`
- The kebab button in each row is focusable; `Enter`/`Space` opens the dropdown
- Dropdown options are navigable with arrow keys; `Escape` closes the dropdown and returns focus to the kebab button
- The `ApproveDialog` and `RejectModal` trap focus while open; `Escape` closes them and returns focus to the triggering kebab button
- All checkboxes in `RejectModal` are reachable and togglable via keyboard
- No keyboard trap exists outside of an open dialog or modal

### Dependencies
- T-10, T-11

---

## T-15 — As a product owner, I want the app's hooks and key components covered by unit and integration tests

### Acceptance criteria
- `useCandidates` — tests verify data fetching, status derivation (`reason: ""` → approved, non-empty → rejected), and error state
- `useColumns` — tests verify the column map is returned as-is
- `useRejectionReasons` — tests verify the reasons array is returned correctly
- `useReclassifyCandidate` — tests verify the mutation calls the correct endpoint and invalidates the cache on success
- `StatusBadge` — tests verify correct badge variant per status, tooltip content, and `aria-describedby` linkage
- `ActionMenu` — tests verify the correct action label is shown for approved vs. rejected candidates
- `ApproveDialog` — tests verify the confirm button triggers the mutation and shows a spinner during loading
- `RejectModal` — tests verify reason checkboxes render, the confirm button is disabled with no selection, and triggers the mutation on submit

### Dependencies
- T-12

---

## T-16 — As a product owner, I want the approve and reject flows covered by end-to-end tests

### Acceptance criteria
- `approve.spec.ts`: finds a rejected candidate, opens the action menu, clicks "Approve Candidate", confirms the dialog, and verifies the status badge updates to "Approved" and a success toast appears
- `reject.spec.ts`: finds an approved candidate, opens the action menu, clicks "Reject Candidate", selects one or more reasons in the modal, confirms, and verifies the status badge updates to "Rejected" with the correct tooltip content and a success toast appears
- Both specs run against the live local server and client
- Both specs pass in CI

### Dependencies
- T-14, T-15
