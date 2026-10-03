import type { BountyResult } from "./types";
import { TIERS } from "./scoring";
// Fictional design preview only. Never shown as real data.
export const EXAMPLE: BountyResult = {
  mode: "profile", id: "B-EXAMPLE", name: "Silas Codewell", handle: "silas-codewell", url: "https://github.com/silas-codewell", avatar: "",
  bounty: 482391000, score: 71.2, tier: TIERS[5], generatedAt: "2026-01-01T00:00:00.000Z", categories: [],
  stats: [["STARS", "12,408"], ["FORKS", "1,902"], ["FOLLOWERS", "5,310"], ["COMMITS 1Y", "2,874"], ["PULL REQUESTS", "311"], ["YEARS AT SEA", "9.4"]].map(([label, value]) => ({ label, value })),
};
