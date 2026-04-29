## Challenge Build Context

- The challenge was built with AI after first defining scope and alignments to establish a shared understanding of _what_ and _how_ to build, before writing a single line of code. The condensed outcome of those conversations with the agent (Claude Sonnet 4.6) is documented in `docs/MANIFEST.md`. Full conversation transcripts are available in `docs/AI_LOG/` (two text files covering two days of work), along with a summary in `docs/AI_LOG/AI_LOG.md`. During this initial phase, I relied entirely on the `/grill-me` skill created by Matt Pocock. This was my first time using it, and the results were excellent. More details here: [My "Grill Me" Skill Went Viral](https://www.aihero.dev/my-grill-me-skill-has-gone-viral).

- After aligning on the _what_ and _how_, I asked the AI to generate a backlog of tickets to progressively build the challenge under my strict supervision. These tickets are documented in `docs/TICKETS.md`.

- After completing the initial tickets, I iteratively introduced additional features, such as column visibility toggling, adding reject reasons on the fly, pagination, sort columns, export filtered candidates to a CSV file, candidates total stats.

- The project includes comprehensive testing for key functionalities (unit, integration, and end-to-end), along with built-in accessibility support and responsive design.

- Lastly, the frontend design system considered for this challenge is documented in `docs/DESIGN_DOC.md`.

Link to live demo: https://candidates-client-eiw1.vercel.app/

## Running the project

### Install dependencies

Run in each directory before starting:

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### Start

The server and client must run in **separate terminals at the same time**.

**Terminal 1 — Server:**

```bash
cd server
npm run dev
```

**Terminal 2 — Client:**

```bash
cd client
npm run dev
```

- Server: `http://localhost:3001`
- Client: `http://localhost:5173`

### Tests

```bash
# Unit and integration tests (React Testing Library + Vitest)
cd client
npm test

# End-to-end tests (Playwright) — requires both server and client running
cd client
npm run test:e2e
```
