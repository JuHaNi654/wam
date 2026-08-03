# wam — Work Application Management

Local web app for tracking job applications through their full lifecycle, with AI-assisted skill extraction from job ads.

---

## Setup (first run)

**Prerequisites**

| Dependency | Notes |
|---|---|
| Go 1.25+ | A C compiler is required (CGO — used by the SQLite driver) |
| Bun | Client package manager |

**Steps**

```bash
# 1. Create the database — run once, refuses to run if DB already exists
cd server
go run . migrate

# 2. Start the API server (port 8000)
go run . start-server

# 3. In a second terminal — install client deps and start the dev server
cd client
bun install
bun run dev
```

Open `http://localhost:5173`. On first launch you will be redirected to the welcome screen — create a profile to proceed.

---

## Environment (`server/.env`)

The file is gitignored. A missing file is non-fatal; the server starts with built-in defaults.

| Variable | Default | Description |
|---|---|---|
| `LLAMA_URL` | `http://127.0.0.1:8001/v1` | Base URL of the llama.cpp-compatible OpenAI API server |
| `LLAMA_DEFAULT_MODEL` | — | Model name shown in the `/models` UI on startup |

---

## Commands

### Server (`cd server`)

| Command | Purpose |
|---|---|
| `go run . migrate` | Create the SQLite DB and apply schema + seed data |
| `go run . start-server` | Start the API on port 8000 |
| `go test ./...` | Run all tests |
| `go build .` | Compile the binary |

### Client (`cd client`)

| Command | Purpose |
|---|---|
| `bun run dev` | Vite dev server with HMR |
| `bun run build` | Type-check (`tsc -b`) then build |
| `bun run lint` | ESLint over all `.ts`/`.tsx` files |
| `bun run preview` | Preview the production build |

---

## Database

- SQLite file lives at `~/.local/share/wam/sqlite.db` — outside the repo. (Note: path is currently hard coded)
- `go run . migrate` refuses to run if the file already exists. This is intentional.
- To reset: delete the file manually, then re-run `migrate`. (Note: or backup old file)

```bash
rm ~/.local/share/wam/sqlite.db
cd server && go run . migrate
```

---

## AI features

AI is used to extract hard technical skills from stored job ad text.

- Requires a running llama.cpp-compatible server (OpenAI-compatible API).
- After starting the server, visit `/models`, load a model, and enable it.
- **Model selection is in-memory only** — you must re-select a model after every server restart.

---

## Tech stack

| Layer | Technologies |
|---|---|
| Server | Go, Gin, GORM, SQLite (CGO), Firebase Genkit |
| Client | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query |
| AI | llama.cpp-compatible server (OpenAI API) |
