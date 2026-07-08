# CupPath

World Cup opponent difficulty analysis based on FIFA ranking points.

Analyze each team's tournament path from the group stage through the final, compare average opponent difficulty across all 48 teams, and toggle between year-start, tournament-start, and live FIFA rankings.

## Features

- Team path analysis with opponent difficulty, results, rank gaps, and next opponent
- Comparison leaderboard across all World Cup 2026 teams
- Three ranking modes: year-start (Jan 1), tournament-start (Jun 11), live (hourly)
- FIFA flag images and 3-letter country codes in the UI
- Responsive UI with i18n scaffold (English)
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

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Sync worldcup data and build |
| `npm run sync:worldcup` | Fetch latest 2026 data from openfootball |
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
- **Elimination:** knockout loss, or failure to advance from group stage (top 2 per group + 8 best third-place teams)
- Teams are keyed by **FIFA 3-letter codes** (`ARG`, `ENG`, `ALG`, etc.)
- Flags come from the API `flag` field or `https://api.fifa.com/api/v3/picture/flags-sq-2/{CODE}`

## Architecture

```
openfootball JSON ──► Next.js app ◄── Vercel Blob (cached rankings)
                            ▲
RapidAPI rankings ──► Cron (hourly) ──┘
```

**Ranking modes**

| Mode | Source | Update |
|---|---|---|
| `yearStart` | Nearest release on/before Jan 1, 2026 | Fixed snapshot |
| `tournamentStart` | Nearest release on/before Jun 11, 2026 | Fixed snapshot |
| `live` | Current API response | Hourly via Vercel cron |

Bundled seed JSON in `data/rankings/` is used when Blob or the API is unavailable.

## Project structure

```
├── data/
│   ├── rankings/           # Seed ranking snapshots
│   └── worldcup/2026/      # Synced openfootball match data
├── messages/en.json        # i18n strings
├── scripts/                # Sync, seed, and validation scripts
├── src/
│   ├── app/                # Pages and API routes
│   ├── components/         # UI components
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
