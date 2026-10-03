# GITHUB BOUNTY
Turn a GitHub profile (`@user`) or repository (`owner/repo`) into a wanted poster.

![GitBount sample Poster](posters/bounty-Vara715%20(1).png)

## Run locally
```
npm install
cp .env.example .env.local     # optional: add GITHUB_TOKEN
npm run dev                    # http://localhost:3000
npm test                       # scoring engine tests
npm run typecheck
```
## Environment
| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Optional. Server-side only. Raises the rate limit (60 -> 5000/h) and unlocks commits/PRs/issues/reviews/consistency signals via GraphQL. A token with no scopes is enough. |
| `NEXT_PUBLIC_SITE_URL` | Absolute URL for Open Graph tags, e.g. `https://githubbounty.com`. |
| `DATA_DIR` | Where the leaderboard JSON lives (default `./.data`; `/tmp` on Vercel). |

## Features
Profile + repository bounties, cinematic analysis sequence, poster front/back (flip), PNG/SVG download identical to the on-screen poster (fonts embedded), shareable `/bounty/<user>` and `/bounty/<owner>/<repo>` pages with OG images (`/api/og`), leaderboard, How It Works page, light/night theme, recent searches, reduced-motion support.

## Architecture
- `lib/github.ts` fetch, cache, normalise (timeouts, 404/rate-limit mapping, optional GraphQL)
- `lib/scoring.ts` pure configurable scoring engine; `lib/scoring.test.ts`
- `lib/metrics.ts` glyph widths from the bundled fonts, for exact poster text fitting
- `lib/store.ts` JSON-file leaderboard store
- `components/Poster.tsx` SVG poster (front and back); `lib/exportPoster.ts` export

## Deploy
**Vercel (easiest):** push to GitHub, import the repo at vercel.com, set `GITHUB_TOKEN` and `NEXT_PUBLIC_SITE_URL`, deploy. The leaderboard file store is ephemeral there; use Upstash/Vercel KV or Postgres by replacing `lib/store.ts` if you want it permanent.
**Docker / VPS / Railway / Fly / Render:** `docker build -t github-bounty . && docker run -p 3000:3000 -e GITHUB_TOKEN=... -v bounty-data:/data github-bounty` (keeps the leaderboard on a volume).
