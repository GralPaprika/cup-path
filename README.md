# CupPath

World Cup opponent difficulty analysis based on FIFA ranking points.

Analyze each team's tournament path from the group stage through the final, compare average opponent difficulty across all 48 teams, and toggle between FIFA ranking snapshots or live rankings.

## Features

- Team path analysis with opponent difficulty, results, rank gaps, and next opponent
- Comparison leaderboard across all World Cup 2026 teams (sortable table, stage filters, cohort ranking)
- **Five ranking modes:** pot-draw cutoff (19 Nov 2025), 19 Jan, 1 Apr, and 11 Jun 2026 snapshots, plus live (hourly)
- Ranking mode persists across Analysis and Compare pages
- FIFA flag images and localized team names (Spanish default, English available)
- Responsive UI with next-intl (ES/EN)
- Match data from [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- FIFA rankings from [World Football Ranking API](https://rapidapi.com/sharmadhirajnp2/api/world-football-ranking)

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
| `npm run sync:worldcup` | Fetch latest 2026 data from openfootball |
| `npm run sync:rankings` | Fetch all ranking snapshots + live from RapidAPI into local runtime cache |
| `npm run seed:rankings` | Upload ranking snapshots to Vercel Blob |
| `npm run validate:teams` | Verify all 48 teams map to rankings |

## Environment variables

| Variable | Purpose |
|---|---|
| `RAPIDAPI_KEY` | World Football Ranking API key |
| `RAPIDAPI_HOST` | Defaults to `world-football-ranking.p.rapidapi.com` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for cached rankings |
| `CRON_SECRET` | Protects cron API routes |

See [`.env.example`](.env.example).

## Methodology

- **Difficulty metric:** average opponent FIFA ranking points (higher = harder)
- **Rank gap:** opponent rank minus team rank (negative = harder opponent)
- **Elimination:** knockout loss (including extra time and penalties), or failure to advance from group stage (top 2 per group + 8 best third-place teams)
- Teams are keyed by **FIFA 3-letter codes** (`ARG`, `ENG`, `CPV`, etc.)
- Flags come from the API `flag` field or `https://api.fifa.com/api/v3/picture/flags-sq-2/{CODE}`

## Architecture

```
openfootball JSON ──► Next.js app ◄── Vercel Blob (cached rankings)
                            ▲
RapidAPI rankings ──► Cron (hourly) ──┘
```

**Ranking modes**

| Mode | FIFA release date | Role |
|---|---|---|
| `november19` | 19 November 2025 | Pot-draw cutoff (groups seeded from this ranking) |
| `january` | 19 January 2026 | Early-year snapshot |
| `april` | 1 April 2026 | Pre-tournament snapshot |
| `june11` | 11 June 2026 | Tournament-start snapshot |
| `live` | Current | Hourly via Vercel cron |

Legacy URL params `yearStart` and `tournamentStart` map to `january` and `june11`.

Bundled seed JSON in `data/rankings/` is used when Blob or the API is unavailable.

## Project structure

```
├── data/
│   ├── rankings/           # Seed ranking snapshots (live + 4 historical dates)
│   └── worldcup/2026/      # Synced openfootball match data
├── messages/
│   ├── en.json, es.json    # UI strings
│   └── teams/              # Localized team names by FIFA code
├── scripts/                # Sync, seed, and validation scripts
├── src/
│   ├── app/                # Pages and API routes
│   ├── components/         # UI components
│   ├── hooks/              # Client hooks (e.g. synced ranking mode)
│   └── lib/
│       ├── data/           # Team registry, rankings client/store, flags
│       └── domain/         # Path builder, standings, difficulty logic
└── vercel.json             # Hourly cron configuration
```

## API routes

| Route | Purpose |
|---|---|
| `GET /api/teams?mode=live` | World Cup teams with flags |
| `GET /api/analysis?team=ENG&mode=live` | Full path analysis for one team |
| `GET /api/comparison?mode=live` | All-team difficulty leaderboard |
| `GET /api/cron/sync-rankings` | Refresh live rankings in Blob (cron) |

## Deployment (Vercel)

1. Import the repository on Vercel
2. Enable **Vercel Blob** in project storage settings
3. Set environment variables from `.env.example`
4. Deploy — hourly cron refreshes live rankings via `/api/cron/sync-rankings`
5. Seed fixed snapshots once: `npm run seed:rankings` or `POST /api/cron/sync-rankings?action=seed-snapshots`
6. Run `npm run validate:teams` to confirm all 48 teams map correctly

## Tech stack

Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-intl, Vercel Blob
