# CupPath

World Cup opponent difficulty analysis based on FIFA ranking points.

Analyze each team's tournament path from the group stage through the final, compare average opponent difficulty across all 48 teams, and toggle between FIFA ranking snapshots or live rankings.

## Features

### Pages

- **Overview** (`/`) — Tournament snapshot, strength by stage, highlights (upsets, over/under performers)
- **Analysis** (`/team-analysis`) — Team path summary, difficulty gauge, tournament path table, advanced statistics
- **Groups** (`/groups`) — Group strength comparison, standings, path averages per team
- **Compare** (`/compare`) — Sortable leaderboard, head-to-head two-team comparison
- **Simulate** (`/simulate`) — What-if path exploration (group swaps, knockout overrides)
- **About** (`/about`) — Methodology and data sources

### Metrics and UI

- **Path difficulty:** average opponent FIFA points (higher = harder)
- **Points gap** and **rank gap** on the path table (points gap is the primary per-match signal)
- **Advanced statistics:** opponent points chart (mean ± 1 SD, selected-team line), distribution stats, Spearman/Kendall cohort agreement
- **Summary context:** percentile vs all nations and closest anchor team
- **Cohort `#` rank** among teams at the furthest included stage
- **Five ranking modes:** pot-draw cutoff (19 Nov 2025), 19 Jan, 1 Apr, 11 Jun 2026 snapshots, plus live
- Ranking mode persists across Overview, Analysis, Groups, Compare, and Simulate
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
| `npm run test` | Run domain unit tests (55 tests) |
| `npm run sync:worldcup` | Fetch latest 2026 data from openfootball |
| `npm run sync:rankings` | Fetch all ranking snapshots + live from RapidAPI into local runtime cache |
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

`vercel.json` defines one daily cron (Hobby limit: once per day). It syncs live rankings, snapshots, and match data. View or trigger it under **Settings → Cron Jobs** after production deploy.

**Pro plan:** add more crons in `vercel.json` (e.g. hourly `/api/cron/sync-rankings`).

Bundled JSON in `data/` is the fallback when Blob is empty or unavailable.

**Ranking modes**

| Mode | FIFA release date | Role | Refresh |
|---|---|---|---|
| `november19` | 19 November 2025 | Pot-draw cutoff (groups seeded from this ranking) | Daily (cron) |
| `january` | 19 January 2026 | Early-year snapshot | Daily (cron) |
| `april` | 1 April 2026 | Pre-tournament snapshot | Daily (cron) |
| `june11` | 11 June 2026 | Tournament-start snapshot | Daily (cron) |
| `live` | Current | Current FIFA ranking | Daily on Hobby; hourly on Pro if configured |

Legacy URL params `yearStart` and `tournamentStart` map to `january` and `june11`.

## Project structure

```
├── data/
│   ├── rankings/           # Seed ranking snapshots (live + 4 historical dates)
│   └── worldcup/2026/      # Synced openfootball match data
├── messages/
│   ├── en.json, es.json    # UI strings
│   └── teams/              # Localized team names by FIFA code
├── scripts/                # Sync, seed, and validation scripts
├── specs/                  # Local planning docs (gitignored)
├── src/
│   ├── app/                # Pages and API routes
│   ├── components/         # UI components
│   ├── hooks/              # Client hooks (e.g. synced ranking mode)
│   └── lib/
│       ├── data/           # Team registry, rankings client/store, flags
│       ├── domain/         # Path builder, standings, difficulty, correlation
│       └── services/       # Analysis, simulation, sync services
└── vercel.json             # Vercel cron (once daily on Hobby)
```

## API routes

| Route | Purpose |
|---|---|
| `GET /api/teams?mode=live` | World Cup teams with flags |
| `GET /api/analysis?team=ENG&mode=live` | Full path analysis for one team |
| `GET /api/comparison?mode=live` | All-team difficulty leaderboard |
| `GET /api/groups?mode=live` | Groups analysis data |
| `GET /api/simulation?team=...&mode=...` | Simulation state for a team |
| `POST /api/simulation/strongest-winners` | Pick strongest winners for bracket |
| `GET /api/cron/sync-scheduled` | Refresh all data in Blob (daily cron on Hobby) |
| `GET /api/cron/sync-rankings` | Refresh live rankings only (manual, or Pro cron) |
| `GET /api/cron/sync-worldcup` | Refresh match data only (manual) |

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
