# wam — Work Application Management

Local web app for tracking job applications through their full lifecycle, with AI-assisted skill extraction from job ads.

---

## Setup (first run)

**Prerequisites**

| Dependency | Notes |
|---|---|
| Go 1.25+ | A C compiler is required (CGO — used by the SQLite driver) |
| Node.js/npm | Client runtime and package manager |

**Steps**

```bash
# 1. Create the database — run once, refuses to run if DB already exists
cd server
go run . migrate

# 2. Start the API server (port 8000)
go run . start-server

# 3. In a second terminal — install client deps and start the dev server
cd client
npm install
npm run dev
```

Open `http://localhost:3000`. On first launch you will be redirected to the welcome screen — create a profile to proceed.

---

## Docker

Build a production image containing the compiled Go server and client bundle:

```bash
docker build -t wam .
```

Run it with a named volume so the SQLite database survives container replacement:

```bash
docker run --rm -p 8000:8000 -v wam-data:/data wam
```

Open `http://localhost:8000`. On its first start against an empty volume, the container creates `/data/sqlite.db` with the empty production schema. Existing databases in the volume are never changed.

To enable the LLM provider, provide its URL and model at runtime:

```bash
docker run --rm -p 8000:8000 -v <host-mount-directory>:/data \
  --add-host=host.docker.internal:host-gateway \
  -e LLAMA_URL=http://host.docker.internal:8001 \
  wam:latest
```

Use the hostname of the LLM service instead of `host.docker.internal` when both services share a Docker network.

---

## Environment (`server/.env`)

The file is gitignored. A missing file is non-fatal; the server starts with built-in defaults.

| Variable | Default | Description |
|---|---|---|
| `LLAMA_URL` | `http://127.0.0.1:8001/v1` | Base URL of the llama.cpp-compatible OpenAI API server |

---

## Commands

### Server (`cd server`)

| Command | Purpose |
|---|---|
| `go run . migrate` | Create the SQLite DB and apply schema + seed data |
| `go run . init-db` | Create an empty SQLite database if none exists |
| `go run . start-server` | Start the API on port 8000 |
| `go test ./...` | Run all tests |
| `go build .` | Compile the binary |

### Client (`cd client`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR on port 3000 |
| `npm run build` | Build the production bundle, then type-check |
| `npm run serve` | Preview the production build |
| `npm run start` | Start the Vite development server |

---

## Database

- SQLite file lives at `~/.local/share/wam/sqlite.db` by default. Set `SQLITE_PATH` to use another directory; the Docker image uses `/data/sqlite.db`.
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
| Client | SolidJS, TypeScript, Vite, Tailwind CSS v4, DaisyUI, TanStack Solid Router/Form |
| AI | llama.cpp-compatible server (OpenAI API) |
