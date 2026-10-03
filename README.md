# GITHUB BOUNTY
Turn a GitHub profile (`@user`) or repository (`owner/repo`) into a wanted poster.

## Run
```
npm install
cp .env.example .env.local   # optionally add GITHUB_TOKEN (server-side only)
npm run dev                  # http://localhost:3000
```
## Architecture
- `lib/github.ts` fetch + cache + normalise (timeouts, rate-limit and 404 mapping)
- `lib/scoring.ts` pure, configurable scoring engine, tiers, score→bounty mapping
- `app/api/bounty/route.ts` validated API with per-IP rate limiting
- `components/Poster.tsx` deterministic SVG poster (exported to PNG/SVG client-side)
Bounty = 1,000,000 × 10^(0.035 × score); all weights/constants in `SCORING_CONFIG`.

## Not yet built
Poster flip/back, shareable `/bounty/[user]` pages + OG images, leaderboard (needs persistence), How It Works page, commit/PR/review signals (need GraphQL + token), manual dark-mode toggle, tests.
