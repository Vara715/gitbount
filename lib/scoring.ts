import type { Category, Signals, Tier } from "./types";
// Tune everything here. Weights sum to 1.
export const SCORING_CONFIG = {
  weights: { activity: 0.2, impact: 0.3, engineering: 0.15, community: 0.2, consistency: 0.15 },
  // bounty = BASE * 10^(score * EXPONENT): score 0 -> 1M, score 100 -> ~3.2B
  bountyBase: 1_000_000, bountyExponent: 0.035,
  // saturation constants: value at which a signal earns ~63% of its points
  k: { stars: 400, forks: 120, followers: 300, repos: 25, age: 6, languages: 5, watchers: 150, releases: 15, contributors: 30, contribs: 400 },
};
export const TIERS: Tier[] = [
  { name: "UNKNOWN", min: 0, color: "#8a7a62", description: "Barely a whisper on the open-source seas." },
  { name: "ROOKIE", min: 12, color: "#7a5c3a", description: "A fresh name starting to appear on harbor boards." },
  { name: "DECKHAND", min: 25, color: "#6b4a2b", description: "Reliable hands, steady contributions." },
  { name: "RAIDER", min: 40, color: "#8b3a2a", description: "A known troublemaker with real commits behind it." },
  { name: "CAPTAIN", min: 55, color: "#9b2226", description: "Leads crews and ships serious work." },
  { name: "SUPERNOVA", min: 70, color: "#b01e2a", description: "An unusually dangerous presence in the open-source seas." },
  { name: "YONKO", min: 85, color: "#7a0f1a", description: "Rules entire waters of the ecosystem." },
  { name: "LEGENDARY", min: 95, color: "#5a0a12", description: "Spoken of in every port." },
];
// Diminishing returns: 0..100
const sat = (x: number, k: number) => 100 * (1 - Math.exp(-Math.max(0, x) / k));
const clamp = (x: number) => Math.max(0, Math.min(100, x));
export const tierFor = (score: number) => [...TIERS].reverse().find((t) => score >= t.min)!;
export const bountyFor = (score: number) =>
  Math.round(SCORING_CONFIG.bountyBase * Math.pow(10, score * SCORING_CONFIG.bountyExponent) / 1000) * 1000;

const NOTES: Record<string, string[]> = {
  activity: ["Little recent public activity.", "Steady public output.", "Highly active lately."],
  impact: ["Few people have noticed the work yet.", "Real traction on projects.", "Widely starred and forked."],
  engineering: ["Light on polish and variety.", "Documented, licensed, varied work.", "Broad, well-maintained engineering."],
  community: ["A quiet crew so far.", "A growing following.", "A large and engaged community."],
  consistency: ["Short or sporadic trail.", "A consistent trail over time.", "Years of sustained presence."],
};
const note = (k: string, s: number) => NOTES[k][s < 35 ? 0 : s < 70 ? 1 : 2];

/** Signals are pre-normalised by the normaliser; this stays pure and testable. */
export function score(mode: "profile" | "repo", s: Signals) {
  const K = SCORING_CONFIG.k;
  const raw: Record<string, number> =
    mode === "profile"
      ? {
          activity: 0.3 * sat(s.recentRepos, 6) + 0.1 * sat(s.repos, K.repos) + 0.6 * sat(s.commits + 3 * s.prs + 2 * s.reviews + s.issues, K.contribs),
          impact: 0.7 * sat(s.stars, K.stars) + 0.3 * sat(s.forks, K.forks),
          engineering: 0.4 * sat(s.languages, K.languages) + 0.6 * s.hygiene * 100,
          community: 0.8 * sat(s.followers, K.followers) + 0.2 * sat(s.reviews, 60),
          consistency: 0.4 * sat(s.ageYears, K.age) + 0.6 * clamp((s.activeWeeks / 52) * 100),
        }
      : {
          activity: sat(s.recencyDays < 0 ? 0 : 365 / (1 + s.recencyDays), 40),
          impact: 0.7 * sat(s.stars, K.stars * 4) + 0.3 * sat(s.forks, K.forks * 4),
          engineering: 0.3 * sat(s.languages, 4) + 0.3 * sat(s.releases, K.releases) + 0.4 * s.hygiene * 100,
          community: 0.6 * sat(s.contributors, K.contributors) + 0.4 * sat(s.watchers, K.watchers * 2),
          consistency: sat(s.ageYears, 4),
        };
  // Anti-spam: a pile of forks-with-no-stars should not inflate profile activity.
  if (mode === "profile" && s.repos > 50 && s.stars < 5) raw.activity *= 0.6;
  const labels: Record<string, string> = { activity: "ACTIVITY", impact: "IMPACT", engineering: "ENGINEERING", community: "COMMUNITY", consistency: "CONSISTENCY" };
  const W = SCORING_CONFIG.weights as Record<string, number>;
  const cats = Object.keys(W).map((key) => ({ key, label: labels[key], score: Math.round(clamp(raw[key]) * 10) / 10, weight: W[key] }));
  const total = Math.round(cats.reduce((a, c) => a + c.score * c.weight, 0) * 10) / 10;
  const sumW = cats.reduce((a, c) => a + c.score * c.weight, 0) || 1;
  const bounty = bountyFor(total);
  const categories: Category[] = cats.map((c) => ({ ...c, note: note(c.key, c.score), share: Math.round(bounty * ((c.score * c.weight) / sumW)) }));
  return { total, bounty, tier: tierFor(total), categories };
}
