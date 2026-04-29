# 🗂️ AI Manifest

> This file defines the constraints, stack decisions, and process rules used with the AI assistant throughout this project.
> It served as the single source of truth for all AI-assisted design and development.
> See [`AI_LOG.md`](./AI_LOG.md) for the full interaction history.

---

## 📋 Challenge

See [`CHALLENGE.md`](./CHALLENGE.md) for the full brief.

---

## 🛠️ Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Backend          | Node.js + Express                   |
| Frontend         | React + TypeScript + Vite           |
| Styling          | TailwindCSS                         |
| Server state     | TanStack Query                      |
| Table            | TanStack Table                      |
| Component system | [shadcn/ui](https://ui.shadcn.com/) |
| Icons            | [Lucide](https://lucide.dev/icons/) |

**Responsive design:** mobile, tablet, and desktop.

---

## 🏗️ Architecture Preferences

- **Monorepo structure** with two top-level folders: `client/` and `server/`
- **Custom hooks as the data layer** — all TanStack Query calls (fetching, mutations) live in dedicated custom hooks, keeping components free of direct API or query logic
- **Testing** — unit and integration tests with [React Testing Library](https://testing-library.com/), e2e tests with [Playwright](https://playwright.dev/)
- **Accessibility** — general best practices (ARIA labels, keyboard navigation, color contrast). Note: a production-ready version would require a higher standard such as WCAG 2.1 AA.

---

## 🤖 AI Process Rules

The AI was instructed to follow the **RADIO framework** for system design:
[https://www.greatfrontend.com/front-end-system-design-playbook/framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework)

Additionally, the [grill-me skill](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) was used to drive the design Q&A:
one question at a time, until enough ground was covered to produce the deliverables below.

### Constraints applied to every session

- Apply RADIO pragmatically — small full-stack take-home, not a distributed system
- Skip infrastructure concerns unless directly relevant
- Keep questions focused on decisions that affect the code

---

## 🔄 Feedback Rules

During the Q&A and throughout the entire process:

- If I disagree with a design decision, **revise it before moving on** — don't just acknowledge and continue
- If I ask to change something, update the relevant deliverable in full — don't just describe what would change
- If something is ambiguous, ask for clarification rather than assuming

---

## 📦 Deliverables (in order)

### 1. Design Doc

Sections:

- **Requirements** — functional, non-functional (including responsiveness), and out of scope
- **Architecture** — client/server split, communication conventions, state management rationale
- **Data Model** — TypeScript types for `candidates.json`, `columns.json`, rejection reasons, and derived UI types
- **Interface Design** — main views, key components, user flows for approving and rejecting
- **Optimizations & Nice-to-haves** — scoped-out features and anything beyond the minimum
- **Assumptions** — explicit decisions where the challenge left gaps

### 2. Folder Structure

Reflects the architecture and component breakdown from the design doc, including a dedicated `hooks/` directory for the data layer.

> Reviewed and validated before moving on to tickets.

### 3. Tickets

Small independent tasks ordered by dependency, framed as:

> "As a recruiter, I want to..."

Every ticket represents a piece of recruiter-facing value, including:

- Responsiveness (e.g. "As a recruiter, I want to use the app comfortably on my phone")
- Testing (e.g. "As a product owner, I want the app to be reliable and covered by unit, integration, and e2e tests")
- Accessibility (e.g. "As a recruiter, I want to navigate the app using only a keyboard")

> Each ticket is validated before implementation begins.

---

## 🧰 AI Agents

| Tool              | Model               | Purpose                                                                                                                 |
| ----------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Claude Code (CLI) | `claude-sonnet-4-6` | Architecture, design, and feature implementation. Full session logs exported with `/export` at the end of each session. |
| Cursor Agent      | `claude-sonnet-4-6` | UI alignment and visual iteration against localhost. Interactions summarized manually in `AI_LOG.md`.                   |

---

## 📝 AI Log Format

Every session is logged in [`AI_LOG.md`](./AI_LOG.md).

### Claude Code sessions

At the end of every Claude Code session, run `/export` to save the full transcript. Commit the exported file alongside any code changes.

### Cursor Agent sessions

Cursor does not support automatic export. After each session, add a manual summary entry to `AI_LOG.md` using this format:

```markdown
## Cursor Session N — YYYY-MM-DD

### Focus

[What UI area or problem was being worked on]

### Prompts Used

[A brief description of the type of prompts sent]

### Decision

- **Accepted** / **Modified** / **Rejected**
- Reason: [why]
```

---

## 📅 Changelog

| Date       | Change          |
| ---------- | --------------- |
| YYYY-MM-DD | Initial version |
