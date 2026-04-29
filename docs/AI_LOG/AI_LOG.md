# AI Log

> Full session transcripts for Claude Code sessions are exported with `/export` and committed to `docs/AI_LOG/`.
> Cursor Agent sessions are summarized manually below.

---

## Claude Code Session 1 — 2026-04-27

**Transcript:** [`docs/AI_LOG/2026-04-27-232810-read-manifestmd-and-readmemd-before-doing-any.txt`](./AI_LOG/2026-04-27-232810-read-manifestmd-and-readmemd-before-doing-any.txt)
**Tools / skills used:** grill-me skill, RADIO framework

---

### 1. Session bootstrap

**Prompts:** Read `MANIFEST.md`, `README.md`, and the `grill-me` skill file before doing anything; confirm understanding and begin Q&A.

**Outcome:** Claude read all three files, summarised the constraints (fixed stack, RADIO process, custom hooks as data layer, RTL + Playwright), and invoked the grill-me skill to start structured design Q&A.

**Decision:** Accepted

---

### 2. Design Q&A — Table UX

One question at a time following the grill-me format.

| Q | Topic | User answer |
|---|-------|-------------|
| 1 | Default view | All candidates shown by default |
| 2 | Table features | Global text search on name + email; pagination at 25 per page |
| 4 | Reclassification UX | Horizontal kebab (⋯) in an Action column → dropdown showing only the opposite action → modal (reject, multi-select checkboxes) or confirmation dialog (approve); shadcn Badge for status; tooltip with rejection reasons on hover over a rejected badge |
| 10 | Status and Action columns | Always visible; pinned outside `columnVisibility` |
| 11 | Loading / error states | Skeleton table on load; inline error with retry button on failure |
| 12 | Responsive behavior | Hide lower-priority columns on mobile using TanStack `columnVisibility` overrides per breakpoint |

**Decision:** Accepted (all answers accepted as proposed by user)

---

### 3. Design Q&A — API and data design

| Q | Topic | User answer |
|---|-------|-------------|
| 3 | Rejection reasons source | Dedicated `GET /rejection-reasons` endpoint; hardcoded list on server |
| 6 | API contract | `PATCH /candidates/:id` with `{ reasons: string[] }`; server owns comma-joining; hook named `useReclassifyCandidate` |
| 7 | Status derivation | Client-side pure utility; derived inside `useCandidates` hook |
| 8 | Columns endpoint format | Return raw boolean map from `columns.json`; TanStack `columnVisibility` handles it on the client |

**Decision:** Accepted

---

### 4. Design Q&A — Mutation feedback

| Q | Topic | User answer |
|---|-------|-------------|
| 5 | Optimistic vs server-confirmed | Server-confirmed; loading spinner on modal action button; toast on success or error |

**Decision:** Accepted

---

### 5. Design Q&A — Testing scope

| Q | Topic | User answer |
|---|-------|-------------|
| 9 | RTL vs Playwright split | RTL for hooks, utilities, and key components; Playwright for the end-to-end approve and reject flows |

**Decision:** Accepted

---

### 6. Design Q&A — Accessibility

| Q | Topic | User answer |
|---|-------|-------------|
| 16 | Keyboard operability | Fully keyboard-operable; shadcn `DropdownMenu` + `Dialog` (Radix UI) handle focus trap, Escape, arrow keys |
| 17 | Status color contrast | Badge text ("Approved" / "Rejected") is the primary signal; color is decorative only |
| 18 | Rejection reasons tooltip | Tooltip on hover + focus (shadcn `Tooltip`); `aria-describedby` + `sr-only` span for screen readers |

**Decision:** Accepted

---

### 7. Design Doc — creation

**Prompts:** "Let's move on to the Design Doc."

**Outcome:** Claude wrote `DESIGN_DOC.md` (246 lines) with all RADIO sections: Requirements, Architecture, Data Model, Interface Design, Optimizations, Assumptions. Included 11 functional requirements, 4 API endpoints with contracts, TypeScript types, ASCII layout, component list, responsive breakpoint table, 8 scoped-out features, and 10 explicit assumptions.

**Decision:** Accepted (pending revisions below)

---

### 8. Design Doc — revisions

**Prompts:** Remove "sort candidates by clicking column headers" from functional requirements; remove both User Flow sections; remove "Real persistence" from Optimizations; add two new nice-to-haves.

**Outcome:** All four changes applied:
- Removed sorting from Functional Requirements
- Removed Approve and Reject user flow sections from Interface Design
- Removed "Real persistence" from Optimizations
- Added "Column toggle UI" (show/hide columns from main table) and "Add rejection reasons on the fly" as Nice-to-haves

**Decision:** Modified — user directed all changes

---

### 9. Folder structure — decisions and reorganization

**Prompts (multiple rounds):**
1. "Let's move to the Folder Structure." → Claude wrote `FOLDER_STRUCTURE.md`
2. Move `candidates.json`/`columns.json` to `server/src/data/`; remove `utils/getStatus.ts` (logic lives in `useCandidates`); remove `FOLDER_STRUCTURE.md` (merge into `DESIGN_DOC.md`); add `client/src/constants/`
3. Move `.md` files from root to a `docs/` directory

**Outcome:**
- `candidates.json` and `columns.json` moved to `server/src/data/`
- `FOLDER_STRUCTURE.md` deleted; folder tree + key decisions appended as final section of `DESIGN_DOC.md`
- `constants/` added with `api.ts`, `breakpoints.ts`, `columns.ts`
- `DESIGN_DOC.md`, `MANIFEST.md`, `TICKETS.md`, `AI_LOG.md` moved to `docs/`; `README.md` stays at root; cross-references updated
- Vite boilerplate READMEs removed

**Decision:** Modified — user directed all structural changes

---

### 10. Tickets

**Prompts:** "Yes, let's move to the Tickets." → "Tickets look good."

**Outcome:** Claude wrote `TICKETS.md` with 16 independent tickets ordered by dependency:

| ID | Story | Depends on |
|----|-------|------------|
| T-01 | Monorepo scaffolding | — |
| T-02 | Server: candidates + columns endpoints | T-01 |
| T-03 | Client foundation (types, constants, api/, hooks) | T-01, T-02 |
| T-04 | Candidate table with skeleton + error states | T-03 |
| T-05 | Status badge with tooltip + screen reader support | T-04 |
| T-06 | Filter by status | T-04 |
| T-07 | Search by name + email | T-04 |
| T-08 | Pagination (25 per page) | T-06, T-07 |
| T-09 | Server: reclassification endpoints | T-01 |
| T-10 | Approve a rejected candidate | T-05, T-09 |
| T-11 | Reject an approved candidate | T-10 |
| T-12 | Toast notifications on success/error | T-10, T-11 |
| T-13 | Responsive: mobile column visibility | T-08 |
| T-14 | Keyboard accessibility audit | T-10, T-11 |
| T-15 | RTL unit + integration tests | T-12 |
| T-16 | Playwright e2e tests (approve + reject flows) | T-14, T-15 |

**Decision:** Accepted

---

### 11. T-01 — Monorepo scaffolding

**Prompts:** "Let's start." + follow-ups: use bun locally but npm-agnostic scripts; add root `package.json` with `concurrently`; README must show `npm` commands for reviewers.

**Outcome:**
- Server scaffolded: Express + TypeScript, `npm run dev` on port 3001
- Client scaffolded with `bun create vite` (react-ts template); TailwindCSS v4 via `@tailwindcss/vite`; shadcn/ui initialized; `@` path alias wired in `vite.config.ts` and `tsconfig.app.json`
- TanStack Query + TanStack Table + Lucide installed
- Vitest + React Testing Library + Playwright configured; test scripts use `--passWithNoTests`
- Root `package.json`: `npm run install:all` (installs all three packages) and `npm start` (runs both dev servers via `concurrently`)
- README updated with `npm run install:all` + `npm start` as canonical setup

**Decision:** Modified — user corrected the package manager to bun and requested the root `package.json` addition

---

### 12. T-02 + extras — Server endpoints

**Prompts:** "Implement server endpoints." + "Before moving to the client foundation, let's add an endpoint for the rejection reasons." + "We forgot to add an endpoint for `PATCH /candidates/:id`."

**Outcome:**
- `server/src/types.ts` — `Candidate` interface and `ColumnVisibilityMap` type
- `server/src/store.ts` — loads both JSON files once at startup
- `GET /candidates` — returns the in-memory candidates array
- `GET /columns` — returns the column visibility map
- `GET /rejection-reasons` — returns 8 hardcoded unique reasons (extracted from data via Python one-liner to verify accuracy)
- `PATCH /candidates/:id` — validates `reasons` is an array (400), finds by id (404), joins with `, ` and mutates in-memory store

**Decision:** Modified — rejection-reasons and PATCH endpoints added in follow-up prompts not covered by the original T-02 ticket

---

### 13. T-03 + extras — Client foundation

**Prompts:** "Yes." + "Add a hook for the rejection reasons as well." + "Before moving to T-04, we forgot to add an endpoint for PATCH and use it with `useReclassifyCandidate`."

**Outcome:**
- `src/types/index.ts` — `Candidate`, `ColumnVisibilityMap`, `CandidateStatus`, `CandidateWithStatus`, `ReclassifyPayload`, `RejectionReasonsResponse`
- `src/constants/` — `api.ts` (base URL), `breakpoints.ts` (640px mobile threshold), `columns.ts` (`MOBILE_VISIBLE_COLUMNS`)
- `src/api/` — `fetchCandidates()`, `fetchColumns()`, `fetchRejectionReasons()`, `patchCandidate()`
- `src/hooks/` — `useCandidates` (fetches + derives status inline), `useColumns`, `useRejectionReasons`, `useReclassifyCandidate` (useMutation; invalidates `["candidates"]` on success)
- `App.tsx` — `QueryClient` created outside component, `QueryClientProvider` wraps the tree

**Decision:** Modified — `useRejectionReasons` and `useReclassifyCandidate` added in follow-up prompts

---

### 14. T-04 — Candidate table

**Prompts:** "Let's move on to T-04."

**Outcome:**
- `candidateColumns.tsx` — 18 data columns matching `columns.json` keys + pinned `status` and `action` display columns (`enableHiding: false`); CV fields as "View" links; empty values as "—"
- `TableSkeleton.tsx` — 10 shimmer rows × 8 columns using shadcn `Skeleton`
- `TableError.tsx` — alert icon + message + "Try again" Button wired to `refetch()`
- `CandidateTable.tsx` — TanStack Table instance; `columnVisibility` initialized from `useColumns()`; shows skeleton while loading, error state if candidates fetch fails
- `App.tsx` — renders `<CandidateTable />` inside a `max-w-screen-2xl` container

**Decision:** Accepted

---

### 15. T-05 — Status badge

**Prompts:** "Yes, move on."

**Outcome:**
- Added `success` variant to `badge.tsx` (green tones, matching `destructive` pattern)
- `StatusBadge.tsx` — approved → green badge; rejected → destructive badge wrapped in shadcn `Tooltip` (hover + focus); `aria-describedby` pointing to a `sr-only` span with "Rejection reasons: ..."
- `candidateColumns.tsx` — status column switched from accessor to display column, renders `<StatusBadge />`
- `App.tsx` — `TooltipProvider` added at app level

**Decision:** Accepted

---

### 16. Table styling

**Prompts:** "Before moving on, style the candidate table to look polished and production-ready. Use shadcn/ui components and Tailwind. Specifically: alternate row colors for readability, a clear header with bold column labels. Use the color tokens from shadcn's theme, not hardcoded hex values."

**Outcome:**
- `CandidateTable.tsx` — container: `rounded-lg border shadow-sm`; header row: `bg-muted/50`; header cells: `text-xs font-semibold uppercase tracking-wide text-muted-foreground`; body rows: alternating `bg-muted/20` on odd rows; cells: `px-4 py-3 text-sm text-foreground`
- `candidateColumns.tsx` — `name` as `font-medium`; `id`, `email`, `career`, `location`, `reason` truncated with `title` attribute; `date` trimmed + `text-muted-foreground`; `desired_salary` prefixed with `$`; numeric fields with `tabular-nums`
- `TableSkeleton.tsx` — padding and alternating rows now match the live table

**Decision:** Accepted

---

### 17. T-06 — Status filter

**Prompts:** "Yes, let's continue."

**Outcome:**
- `StatusFilter.tsx` — shadcn `Select` with All / Approved / Rejected options; `aria-label` for accessibility; `onValueChange` guards against `null`
- `CandidateTable.tsx` — accepts `statusFilter` prop; `useMemo` filters candidates; renders empty-state row when filtered list is empty
- `App.tsx` — owns `statusFilter` state (defaults to "all"), renders filter in a toolbar

**Decision:** Accepted

---

### 18. T-07 — Search with debounce

**Prompts:** "Yes, let's continue with name + email search." + "Before moving to the pagination, I want to add a 300ms debounce timer in the input search."

**Outcome:**
- `SearchInput.tsx` — text input with leading Search icon; X clear button; 300ms debounce via `useEffect`; local `inputValue` state for immediate responsive feel; `handleClear` bypasses debounce and fires `onChange("")` immediately; parent-sync `useEffect` handles external value resets
- `CandidateTable.tsx` — `useMemo` composes status and search filters in one pass (case-insensitive substring match on name + email)
- `App.tsx` — owns `searchQuery` state; renders `<SearchInput>` in toolbar

**Decision:** Modified — debounce added in a follow-up prompt after initial implementation

---

### 19. Refactor — `useFilteredCandidates`

**Prompts:** "I want to extract the filtering and search logic into a custom hook called `useFilteredCandidates`. This way `CandidateTable` has the single responsibility of rendering."

**Outcome:**
- `src/hooks/useFilteredCandidates.ts` — composes `useCandidates` internally; applies status filter and search query; returns `{ candidates, isLoading, isError, refetch }`
- `CandidateTable.tsx` — dropped `useMemo`, `useCandidates`, and the inline filter block; now calls `useFilteredCandidates(statusFilter, searchQuery)` directly

**Decision:** Accepted — user-initiated refactor

---

### 20. T-08 — Pagination (attempted, then rolled back)

**Prompts:** "Yes, let's continue." → "Let's rollback the pagination implementation. I'll skip it for now."

**Outcome:**
- `TablePagination.tsx` was fully implemented (page count, Previous/Next, ellipsis, aria labels) and wired into `CandidateTable.tsx`
- User decided to roll it back; `TablePagination.tsx` deleted, `CandidateTable.tsx` reverted to flat list

**Decision:** Rejected — pagination built but removed at user request

---

### 21. T-10 — Approve flow

**Prompts:** "Let's move on to T-10."

**Outcome:**
- shadcn `dropdown-menu` and `alert-dialog` installed
- `ApproveDialog.tsx` — shadcn `AlertDialog`; shows candidate name in description; loading spinner on Confirm button while mutation is pending; calls `useReclassifyCandidate` with `{ reasons: [] }`
- `ActionMenu.tsx` — `MoreHorizontal` icon button as `DropdownMenuTrigger`; dropdown shows only the opposite action ("Approve Candidate" for rejected, "Reject Candidate" for approved); opens the appropriate modal via local state
- `candidateColumns.tsx` — action column cell now renders `<ActionMenu candidate={row.original} />`

**Decision:** Accepted

---

### 22. T-11 — Reject flow

**Prompts:** Continued from T-10 (T-11 implemented as part of the same session beat).

**Outcome:**
- shadcn `dialog` and `checkbox` installed
- `RejectModal.tsx` — shadcn `Dialog`; fetches reasons via `useRejectionReasons`; renders reasons as labeled `Checkbox` items with explicit `htmlFor`/`id` pairing; Confirm button disabled until at least one reason is selected; spinner while pending; calls `useReclassifyCandidate` with selected reasons array

**Decision:** Accepted

---

### 23. T-12 — Toast notifications

**Prompts:** Continued from T-11.

**Outcome:**
- shadcn `sonner` installed
- `<Toaster>` added to `App.tsx` (inside providers)
- `ApproveDialog.tsx` and `RejectModal.tsx` both call `toast.success` on mutation success and `toast.error` on failure

**Decision:** Accepted

---

### 24. T-13 — Responsive layout + `useColumnVisibility` refactor

**Prompts:** "Yes, let's continue." + "Let's explore a way to encapsulate the `columnVisibility` logic into its own reusable hook called `useColumnVisibility`."

**Outcome (T-13):**
- `src/hooks/useIsMobile.ts` — `window.matchMedia` listener against `MOBILE_BREAKPOINT - 1` (639px); SSR-safe; cleans up on unmount
- `CandidateTable.tsx` — `useMemo` merges server config with breakpoint-aware overrides: on mobile, all server columns hidden, only `MOBILE_VISIBLE_COLUMNS` entries re-enabled
- `App.tsx` — toolbar switches from `flex-row` to `flex-col` below `sm` breakpoint

**Outcome (refactor):**
- `src/hooks/useColumnVisibility.ts` — composes `useColumns` and `useIsMobile`; returns `{ columnVisibility, isLoading }`
- `CandidateTable.tsx` — dropped `useMemo`, `useColumns`, `useIsMobile`, and `MOBILE_VISIBLE_COLUMNS` import; calls `useColumnVisibility()` directly

**Decision:** Accepted — refactor user-initiated

---

### 25. T-14 — Keyboard accessibility audit

**Prompts:** "Let's move on."

**Outcome:**

Already handled by base-ui / Radix (no code needed):
- `DropdownMenu` — arrow keys + Escape + focus return to trigger
- `AlertDialog` / `Dialog` — focus trap + Escape + focus restore
- `Checkbox` — Tab + Space
- `Select` — fully keyboard-operable

Fixed in this ticket:
- `SearchInput.tsx` — clear button gained `focus-visible:ring-2 focus-visible:ring-ring rounded-sm`
- `RejectModal.tsx` — switched from wrapping `<label>` to explicit `htmlFor`/`id` pairing; `select-none` on label text

**Decision:** Accepted

---

### 26. T-15 — RTL unit and integration tests

**Prompts:** "Yes, move on to T-15."

**Outcome:**
- `tsconfig.app.json` — added `"vitest/globals"` to `types`
- `tests/utils.tsx` — `createWrapper()` (fresh `QueryClient`, retry disabled), `stubFetch()`, `stubFetchError()`, shared mock data
- Hook tests (8 tests): `useCandidates` (fetch + status derivation + error), `useColumns`, `useRejectionReasons`, `useReclassifyCandidate` (PATCH body + cache invalidation spy)
- Component tests (14 tests): `StatusBadge` (text, sr-only, aria-describedby), `ActionMenu` (correct item per status), `ApproveDialog` (name in description, PATCH body, disabled-while-pending), `RejectModal` (reasons rendered, confirm gating, PATCH body)
- All 22 tests pass

**Decision:** Accepted

---

### 27. T-16 — Playwright e2e tests

**Prompts:** "Yes, continue with e2e."

**Outcome:**
- `playwright.config.ts` — two-entry `webServer` array (server first, then client); `fullyParallel: false` (shared in-memory state)
- `e2e/approve.spec.ts` — `beforeEach` PATCHes Aiden Armstrong back to rejected; test searches → kebab → "Approve Candidate" → confirm → asserts "Approved" badge + success toast
- `e2e/reject.spec.ts` — `beforeEach` PATCHes Marcus Patrick back to approved; test searches → kebab → "Reject Candidate" → selects reason → confirm → asserts "Rejected" badge + toast + tooltip shows reason on hover
- All 22 RTL tests still pass after adding e2e files

**Decision:** Accepted

---

## Claude Code Session 2 — 2026-04-28

**Transcript:** [`docs/AI_LOG/2026-04-28-140659-command-messagegrill-mecommand-message.txt`](./AI_LOG/2026-04-28-140659-command-messagegrill-mecommand-message.txt)
**Tools / skills used:** grill-me skill

---

### 28. Design Q&A — Column toggle UI and interaction

**Prompts:** `/grill-me` — I want to add an option in `App.tsx` to give the user the ability to toggle column visibility and update `columns.json`.

| Q | Topic | User answer |
|---|-------|-------------|
| 1 | Where in the UI should the column toggle live? | Gear icon + "Visible Columns" label; when clicked, dropdown shows all columns each with a toggle switch; user selects and clicks Confirm |
| 5 | New Switch component or reuse Checkbox? | Create a new `switch.tsx` component wrapping `@base-ui/react/switch` |
| 9 | Should the column toggle be available on mobile? | Show it on mobile too |
| 10 | Should the mobile override in `useColumnVisibility` be removed? | Yes — remove entirely; server config becomes the single source of truth on all devices |
| 11 | Should `id` be excluded from the toggle list? | Yes — always keep it `false`, exclude from the dropdown |

**Decision:** Accepted

---

### 29. Design Q&A — API and state design

| Q | Topic | User answer |
|---|-------|-------------|
| 2 | How should the dropdown manage state before Confirm? | Local draft state — copy current config on open, flush to server on Confirm, discard on close without confirming |
| 3 | What HTTP method for the server endpoint? | `PUT /columns` — replaces full `ColumnVisibilityMap` |
| 4 | How should React Query update after PUT succeeds? | Invalidate `["columns"]` query and show a loading state |
| 12 | What should happen if the PUT fails? | Toast notification via sonner; dropdown stays open for retry |
| 13 | What should the Confirm button look like while PUT is in flight? | Disabled + spinner |

**Decision:** Accepted

---

### 30. Design Q&A — Component and hook architecture

| Q | Topic | User answer |
|---|-------|-------------|
| 6 | Where should `ColumnVisibilityFilter` live in the file structure? | `client/src/components/filters/` — alongside `StatusFilter` and `SearchInput` |
| 7 | Should the PUT mutation live in `useColumnVisibility` or a separate hook? | Separate `useUpdateColumns` hook — single responsibility |
| 8 | How should column keys be displayed as labels? | Auto-derive: convert `snake_case` to Title Case |

**Decision:** Accepted

---

### 31. Implementation — Column visibility toggle feature

**Prompts:** "Yes, do it."

**Outcome:**

New files:
- `client/src/components/ui/switch.tsx` — Switch component wrapping `@base-ui/react/switch`; consistent with existing shadcn component pattern
- `client/src/hooks/useUpdateColumns.ts` — `useMutation` hook that calls `PUT /columns` and invalidates `["columns"]` on success
- `client/src/components/filters/ColumnVisibilityFilter.tsx` — Gear icon + "Visible Columns" trigger; dropdown with per-column Switch toggles; local draft state; Confirm button (disabled + spinner while in flight); success/error toasts via sonner

Modified files:
- `server/src/routes/columns.ts` — `PUT /` route added: validates payload, forces `id: false`, mutates in-memory store and writes back to `columns.json`
- `client/src/api/columns.ts` — `updateColumns(payload)` fetch function added
- `client/src/hooks/useColumnVisibility.ts` — mobile override removed entirely; now returns `columns ?? {}` directly
- `client/src/App.tsx` — `<ColumnVisibilityFilter />` added to the filter bar

Both client and server passed `tsc --noEmit` with no errors.

**Decision:** Accepted

---

## Claude Code Session 3 — 2026-04-28

**Transcript:** [`docs/AI_LOG/2026-04-28-211005-command-messagegrill-mecommand-message.txt`](./AI_LOG/2026-04-28-211005-command-messagegrill-mecommand-message.txt)
**Tools / skills used:** grill-me skill

---

### 32. Challenge review + improvement triage

**Prompts:** `/grill-me` — review `docs/CHALLENGE.md`, assess what is already implemented, and suggest high-impact additions to impress reviewers.

**Outcome:**
- Claude performed a full codebase review and concluded core requirements were already covered end-to-end (CRUD reclassification, filters/search, pagination, loading/error states, accessibility, tests).
- Main gap identified: no table sorting despite TanStack Table already being in place.
- Session continued as guided Q&A, prioritizing low-effort / high-impact polish items.

**Decision:** Accepted

---

### 33. Implementation — Desired Salary sorting

**Prompts:** "Ok, what if we add sorting to the desired salary column?" + "keep the default [pagination behavior], and keep looking for more things"

**Outcome:**
- `client/src/hooks/useTableData.ts` updated with TanStack sorting state (`SortingState`), `getSortedRowModel()`, and `onSortingChange`.
- `client/src/components/candidates/utils/candidateColumns.tsx` updated so only `desired_salary` is sortable:
  - clickable header button with three visual states (unsorted/asc/desc),
  - numeric `sortingFn` to avoid lexicographic mistakes,
  - dynamic `aria-label` reflecting next sort action.
- Type-check attempt surfaced a pre-existing TS deprecation warning in `tsconfig.json` (`baseUrl` deprecation), unrelated to feature changes.

**Decision:** Accepted

---

### 34. Implementation — Candidate stats bar (iterative semantics)

**Prompts (multiple rounds):**
1. "Yes, add it." (stats bar above table)
2. Several follow-ups to refine count semantics between filtered table totals vs global approved/rejected totals

**Outcome:**
- `client/src/components/candidates/CandidateStats.tsx` created and wired into `App.tsx`.
- Stats behavior was iterated based on user feedback:
  - initial filtered-only counts,
  - temporary variant showing global totals plus `shown`,
  - final behavior set to: **total = filtered table count**, **approved/rejected = global totals**.
- Final intended label pattern documented in the session: e.g. `58 candidates — 8 approved · 58 rejected` when filtered to rejected candidates.

**Decision:** Modified — behavior adjusted through multiple user clarifications

---

### 35. Layout polish — Toolbar placement and mobile responsiveness

**Prompts:** place stats on same row as filters (to the right of "Visible Columns"); then improve mobile alignment and width.

**Outcome:**
- `client/src/App.tsx` toolbar layout adjusted so stats sit inline with filters on desktop.
- Mobile UX improvements:
  - filter row alignment changed to centered,
  - filter controls updated to full width on small screens,
  - desktop behavior preserved with `sm:` overrides.
- Files touched for responsive updates: `StatusFilter.tsx`, `SearchInput.tsx`, `ColumnVisibilityFilter.tsx`, and `App.tsx`.

**Decision:** Accepted

---

### 36. Implementation — CSV export button

**Prompts (Q&A then implementation):**
- Add CSV export button next to stats
- Export scope: filtered rows only
- Export columns: all columns
- Filename: dynamic with date
- Follow-up refinement: derive columns from `useColumns` hook instead of hardcoding

**Outcome:**
- `client/src/components/candidates/ExportButton.tsx` created and wired into toolbar beside stats.
- Export behavior:
  - downloads filtered dataset currently shown by active filters/search,
  - uses CSV escaping for quotes/commas,
  - filename format `candidates-YYYY-MM-DD.csv`,
  - columns generated dynamically from `useColumns` keys, with derived `status` appended.
- Intermediate className customization added to `CandidateStats` was later removed after layout refactor.

**Decision:** Accepted (with user-directed refinement to dynamic column source)

---

### 37. Closing recommendations (not implemented)

**Prompts:** "What else would you imagine?" → user declined further additions.

**Outcome:**
- Claude suggested additional polish opportunities (optimistic mutations, clear-filters action, URL-persisted filters, undo on reclassify, date sorting).
- No further code changes were requested in this session.

**Decision:** Accepted — advisory only
