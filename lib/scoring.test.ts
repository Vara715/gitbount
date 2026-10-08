import test from "node:test";
import assert from "node:assert/strict";
import { score, bountyFor, tierFor } from "./scoring";
const base = { stars: 0, forks: 0, followers: 0, repos: 0, recentRepos: 0, languages: 0, hygiene: 0, ageYears: 0, commits: 0, prs: 0, issues: 0, reviews: 0, activeWeeks: 0 };
test("deterministic", () => assert.deepEqual(score("profile", { ...base, stars: 50 }), score("profile", { ...base, stars: 50 })));
test("bounty range", () => { assert.equal(bountyFor(0), 1_000_000); assert.ok(bountyFor(100) > 3e9 && bountyFor(100) < 3.3e9); });
test("monotonic in stars", () => assert.ok(score("profile", { ...base, stars: 500 }).bounty > score("profile", { ...base, stars: 50 }).bounty));
test("diminishing returns", () => {
  const a = score("profile", { ...base, stars: 400 }).total - score("profile", { ...base, stars: 0 }).total;
  const b = score("profile", { ...base, stars: 4400 }).total - score("profile", { ...base, stars: 4000 }).total;
  assert.ok(a > b * 10);
});
test("100 junk repos lose to 10 impactful ones", () => {
  const junk = score("profile", { ...base, repos: 100, recentRepos: 5, stars: 2, languages: 2, ageYears: 2 });
  const strong = score("profile", { ...base, repos: 10, recentRepos: 6, stars: 1500, forks: 300, languages: 5, hygiene: 1, ageYears: 6, followers: 400 });
  assert.ok(strong.bounty > junk.bounty);
});
test("contribution data is rewarded, with diminishing returns", () => {
  const a = score("profile", { ...base, commits: 200, prs: 6, activeWeeks: 30 }).total;
  const b = score("profile", { ...base, commits: 2000, prs: 60, activeWeeks: 30 }).total;
  assert.ok(a > score("profile", base).total && b > a && b - a < a);
});
test("tiers ascend", () => { assert.equal(tierFor(0).name, "UNKNOWN"); assert.equal(tierFor(99).name, "LEGENDARY"); });
test("category shares sum ~ bounty", () => {
  const r = score("repo", { ...base, stars: 900, forks: 100, watchers: 40, contributors: 20, releases: 8, recencyDays: 5, ageYears: 4 });
  assert.ok(Math.abs(r.categories.reduce((a, c) => a + c.share, 0) - r.bounty) < 10);
});
