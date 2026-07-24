# CupPath

World Cup opponent difficulty analysis based on FIFA ranking points.

Analyze each team's tournament path from the group stage through the final, compare average opponent difficulty across all 48 teams, and toggle between FIFA ranking snapshots.

## Features

### Pages

- **Team path** (`/`) — Origin story, team path summary, difficulty gauge, tournament path table, advanced statistics
- **Tournament overview** (`/overview`) — Tournament snapshot, strength by stage, group and knockout deep dives
- **Groups** (`/groups`) — Group strength comparison, standings, path averages per team
- **Compare** (`/compare`) — Sortable leaderboard, head-to-head two-team comparison
- **Simulate** (`/simulate`) — What-if path exploration (group swaps, knockout overrides)
- **About** (`/about`) — Methodology and data sources

Legacy URLs `/team-analysis` and `/analysis` redirect to `/`.

### Metrics and UI

- **Path difficulty:** average opponent FIFA points (higher = harder)
- **Points gap** and **rank gap** on the path table (points gap is the primary per-match signal)
- **Advanced statistics:** opponent points chart (mean ± 1 SD, selected-team line), distribution stats, Spearman/Kendall cohort agreement
- **Summary context:** percentile vs all nations and closest anchor team
- **Cohort `#` rank** among teams at the furthest included stage
- **Five ranking modes:** pot-draw cutoff (19 Nov 2025), 19 Jan, 1 Apr, 11 Jun 2026, and post-tournament 20 Jul 2026 (default)
- Ranking mode persists across Team path, Tournament overview, Groups, Compare, and Simulate
- FIFA flag images and localized team names (Spanish default, English available)
- Responsive UI with next-intl (ES/EN)

Full methodology: see the **About** page in the app, or `specs/PLAN.md` locally (gitignored).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run sync:worldcup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional — refresh ranking snapshots from the API (requires `RAPIDAPI_KEY` in `.env.local`):

```bash
npm run sync:rankings
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Sync worldcup data and build |
| `npm run test` | Run domain unit tests (81 tests) |
| `npm run sync:worldcup` | Fetch latest 2026 data from openfootball |
| `npm run sync:rankings` | Fetch all FIFA ranking snapshots from RapidAPI into local runtime cache |
| `npm run seed:rankings` | Upload ranking snapshots to Vercel Blob |
| `npm run validate:teams` | Verify all 48 teams map to rankings |

## Environment variables

| Variable | Purpose |
|---|---|
| `RAPIDAPI_KEY` | World Football Ranking API key |
| `RAPIDAPI_HOST` | Defaults to `world-football-ranking.p.rapidapi.com` |
| `BLOB_STORE_ID` | Auto-set when Blob store is linked to the project (OIDC auth on Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Optional — for local/scripts outside Vercel only |
| `CRON_SECRET` | Protects cron API routes |

See [`.env.example`](.env.example).

## Methodology

- **Primary difficulty:** unweighted mean of opponent FIFA ranking points over selected stages (higher = harder)
- **Points gap:** opponent points minus team points (+ = harder opponent) — primary per-match signal
- **Rank gap:** opponent rank minus team rank (− = harder opponent) — secondary context
- **Cohort `#` rank:** competition ranking among teams that reached the furthest included stage; eliminated teams may show `—`
- **Elimination:** knockout loss (including extra time and penalties), or failure to advance from group stage (top 2 per group + 8 best third-place teams)
- Teams are keyed by **FIFA 3-letter codes** (`ARG`, `ENG`, `CPV`, etc.)

## Architecture

### Data flow (production)

```
openfootball JSON ──► Vercel Cron ──► Vercel Blob (match data)
RapidAPI rankings ──► Vercel Cron ──► Vercel Blob (rankings)
                              │
                              ▼
                        Next.js app
```

**Data refresh (production)**

| Method | Schedule | Route |
|---|---|---|
| **Vercel cron (Hobby)** | Once daily at 12:00 UTC (`vercel.json`) | `GET /api/cron/sync-scheduled` |
| **Manual** | Anytime | `POST /api/cron/sync-scheduled` with `Authorization: Bearer CRON_SECRET` |

`vercel.json` defines one daily cron (Hobby limit: once per day). It syncs ranking snapshots and match data. View or trigger it under **Settings → Cron Jobs** after production deploy.

Bundled JSON in `data/` is the fallback when Blob is empty or unavailable.

### Application layers

Tournament data is loaded once per request at the **service boundary**, then passed into pure domain functions as `TournamentContext`:

```
Vercel Blob / bundled JSON
        │
        ▼
  data/ (worldcup-store, rankings-store, team-registry)
        │
        ▼
  loadTournamentRuntime(mode)  →  { ctx, rankings }
        │
        ▼
  services/ (analysis, simulation, facts)
        │  precompute read-side analytics (group strength, path charts, …)
        ▼
  API routes  →  JSON DTOs
        │
        ▼
  page clients (useApiQuery + useUrlParamsSync)
        │
        ▼
  components (presentation only)
```

- **`TournamentContext`** (`src/lib/domain/tournament-context.ts`) — matches + team lookup; domain modules take `ctx` as their first argument instead of reading data singletons.
- **`loadTournamentRuntime`** (`src/lib/services/tournament-runtime.ts`) — ensures worldcup data, builds context, loads rankings for a mode.
- **Shared DTOs** — `src/lib/types.ts` for cross-layer shapes; `src/lib/api/responses.ts` re-exports service result types for page clients.
- **Client hooks** — `useApiQuery` (fetch + abort + error state), `useUrlParamsSync` (URL param persistence), `useSyncedRankingMode` (ranking mode cookie/URL sync).
- **Interactive simulation edits** (group swaps, knockout winner picks) stay on the client and POST scenario state to `/api/simulation`.

**Ranking modes**

| Mode | FIFA release date | Role | Refresh |
|---|---|---|---|
| `july20` | 20 July 2026 | Post-tournament ranking (default) | Fixed snapshot |
| `june11` | 11 June 2026 | Tournament-start snapshot | Fixed snapshot |
| `april` | 1 April 2026 | Pre-tournament snapshot | Fixed snapshot |
| `january` | 19 January 2026 | Early-year snapshot | Fixed snapshot |
| `november19` | 19 November 2025 | Pot-draw cutoff (groups seeded from this ranking) | Fixed snapshot |

Legacy URL params `live`, `yearStart`, and `tournamentStart` map to `july20`, `january`, and `june11`.

## Project structure

```
├── data/
│   ├── rankings/           # Seed ranking snapshots (fixed FIFA release dates)
│   └── worldcup/2026/      # Synced openfootball match data
├── messages/
│   ├── en.json, es.json    # UI strings
│   └── teams/              # Localized team names by FIFA code
├── scripts/                # Sync, seed, and validation scripts
├── specs/                  # Local planning docs (gitignored)
├── src/
│   ├── app/                # Pages and API routes
│   ├── components/         # UI components
│   ├── hooks/              # useApiQuery, useUrlParamsSync, useSyncedRankingMode
│   └── lib/
│       ├── api/            # Shared API response type re-exports
│       ├── client/         # Browser-only helpers (group selection, ranking prefs, …)
│       ├── data/           # Team registry, rankings client/store, tournament context loader
│       ├── domain/         # Pure logic (path builder, standings, difficulty, correlation)
│       └── services/       # Analysis, simulation, facts, tournament-runtime
└── vercel.json             # Vercel cron (once daily on Hobby)
```

## API routes

| Route | Purpose |
|---|---|
| `GET /api/teams?mode=july20` | World Cup teams with flags |
| `GET /api/facts?mode=july20` | Tournament snapshot, stage cohorts, highlights |
| `POST /api/analysis` | Full path analysis (body: `{ team, mode, stages }`) |
| `POST /api/comparison` | All-team difficulty leaderboard + team counts (body: `{ mode, stages, teamRound, team?, vs? }`) |
| `GET /api/groups?mode=july20` | Group cards, strength ordering, points benchmarks |
| `POST /api/simulation` | Simulation state (body: `{ mode, team, compareTeam?, scenario }`) |
| `POST /api/simulation/strongest-winners` | Pick strongest winners for bracket |
| `GET /api/cron/sync-scheduled` | Refresh all data in Blob (daily cron on Hobby) |
| `GET /api/cron/sync-rankings` | Refresh ranking snapshots only (manual) |
| `GET /api/cron/sync-worldcup` | Refresh match data only (manual) |

### Notable response fields

- **`GET /api/groups`** — `{ groups, strengthOrdering, pointsBenchmarks }`
- **`POST /api/simulation`** — `SimulationResult` including precomputed `actualPathChart`, `simulatedPathChart`, `comparisonPathChart`

## Data sources

- Match data from [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- FIFA rankings from [World Football Ranking API](https://rapidapi.com/sharmadhirajnp2/api/world-football-ranking)

## Deployment (Vercel)

1. Import the repository on Vercel
2. Enable **Vercel Blob** in project storage settings
3. Set environment variables from `.env.example`
4. Deploy (`vercel.json` registers the daily cron on production)
5. Confirm under **Settings → Cron Jobs** that `/api/cron/sync-scheduled` is listed
6. Seed Blob on first deploy: `npm run seed:rankings` and `POST /api/cron/sync-scheduled` (with `CRON_SECRET`)
7. Run `npm run validate:teams` to confirm all 48 teams map correctly

## Tech stack

Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-intl, Vercel Blob
