import type { BountyResult, Signals } from "./types";
import { score } from "./scoring";

export class BountyError extends Error {
  constructor(public code: "INVALID" | "NOT_FOUND" | "RATE_LIMIT" | "TIMEOUT" | "UPSTREAM", message: string, public status = 400) { super(message); }
}
const cache = new Map<string, { at: number; v: unknown }>();
const TTL = 10 * 60_000;

async function gh<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.v as T;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "github-bounty" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let res: Response;
  try { res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(8000) }); }
  catch (e) { throw new BountyError((e as Error).name === "TimeoutError" ? "TIMEOUT" : "UPSTREAM", "GitHub did not answer in time.", 504); }
  if (res.status === 404) throw new BountyError("NOT_FOUND", "We couldn't find this GitHub outlaw.", 404);
  if (res.status === 403 || res.status === 429) throw new BountyError("RATE_LIMIT", "GitHub's API rate limit has been reached. Try again later.", 429);
  if (!res.ok) throw new BountyError("UPSTREAM", "GitHub sent an unexpected response.", 502);
  const v = (await res.json()) as T;
  cache.set(path, { at: Date.now(), v });
  return v;
}

async function avatarData(url: string): Promise<string> {
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "s=800", { signal: AbortSignal.timeout(5000) });
    const buf = Buffer.from(await r.arrayBuffer());
    return `data:${r.headers.get("content-type") || "image/png"};base64,${buf.toString("base64")}`;
  } catch { return ""; } // poster falls back to a silhouette
}
/** Contribution signals (last year) via GraphQL. Required: every profile is scored the same way. */
async function contributions(login: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new BountyError("UPSTREAM", "This server has no GITHUB_TOKEN configured, so it can't read contribution data.", 500);
  let res: Response;
  try {
    res = await fetch("https://api.github.com/graphql", {
      method: "POST", signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "github-bounty" },
      body: JSON.stringify({ query: `query($l:String!){user(login:$l){contributionsCollection{totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions contributionCalendar{weeks{contributionDays{contributionCount}}}}}}`, variables: { l: login } }),
    });
  } catch (e) { throw new BountyError((e as Error).name === "TimeoutError" ? "TIMEOUT" : "UPSTREAM", "GitHub did not answer in time.", 504); }
  if (res.status === 403 || res.status === 429) throw new BountyError("RATE_LIMIT", "GitHub's API rate limit has been reached. Try again later.", 429);
  const json = await res.json().catch(() => null);
  if (json?.errors?.some((x: any) => x.type === "RATE_LIMITED")) throw new BountyError("RATE_LIMIT", "GitHub's API rate limit has been reached. Try again later.", 429);
  const c = json?.data?.user?.contributionsCollection;
  if (!c) throw new BountyError("UPSTREAM", "GitHub's contribution data is unavailable right now. Try again in a moment.", 502);
  const weeks: any[] = c.contributionCalendar.weeks;
  const active = weeks.filter((w) => w.contributionDays.some((d: any) => d.contributionCount > 0)).length;
  return { commits: c.totalCommitContributions, prs: c.totalPullRequestContributions, issues: c.totalIssueContributions, reviews: c.totalPullRequestReviewContributions, activeWeeks: (active / Math.max(1, weeks.length)) * 52 };
}
const yrs = (d: string) => (Date.now() - new Date(d).getTime()) / (365.25 * 864e5);
const fmt = (n: number) => n.toLocaleString("en-US");
const NAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const REPO = /^[\w.-]{1,100}$/;

export function parseInput(raw: string): { mode: "profile" | "repo"; owner: string; repo?: string } {
  const t = raw.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/^@/, "").replace(/\/+$/, "");
  const [owner, repo, ...rest] = t.split("/");
  if (!owner || !NAME.test(owner) || rest.length > 0 && !repo || (repo && !REPO.test(repo)))
    throw new BountyError("INVALID", "That doesn't look like a GitHub username or owner/repository.");
  return repo ? { mode: "repo", owner, repo } : { mode: "profile", owner };
}

export async function buildBounty(raw: string): Promise<BountyResult> {
  const p = parseInput(raw);
  const now = new Date().toISOString();
  const bid = (s: string) => "B-" + [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).toUpperCase().padStart(7, "0");

  if (p.mode === "profile") {
    const [u, repos, con] = await Promise.all([
      gh<any>(`/users/${p.owner}`),
      gh<any[]>(`/users/${p.owner}/repos?per_page=100&sort=pushed`),
      contributions(p.owner),
    ]);
    const own = repos.filter((r) => !r.fork);
    const langs = new Set(own.map((r) => r.language).filter(Boolean));
    const recent = own.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < 180 * 864e5).length;
    const stars = own.reduce((a, r) => a + r.stargazers_count, 0), forks = own.reduce((a, r) => a + r.forks_count, 0);
    const hyg = own.length ? own.filter((r) => r.description && r.license).length / own.length : 0;
    const s: Signals = { stars, forks, followers: u.followers, repos: own.length, recentRepos: recent, languages: langs.size, hygiene: hyg, ageYears: yrs(u.created_at),
      commits: con.commits, prs: con.prs, issues: con.issues, reviews: con.reviews, activeWeeks: con.activeWeeks };
    const r = score("profile", s);
    const years = yrs(u.created_at).toFixed(1);
    const statRows = [["STARS", fmt(stars)], ["FORKS", fmt(forks)], ["FOLLOWERS", fmt(u.followers)], ["COMMITS 1Y", fmt(con.commits)], ["PULL REQUESTS", fmt(con.prs)], ["YEARS AT SEA", years]];
    return { mode: "profile", id: bid(u.login), name: u.name || u.login, handle: u.login, url: u.html_url, avatar: await avatarData(u.avatar_url),
      bounty: r.bounty, score: r.total, tier: r.tier, categories: r.categories, generatedAt: now,
      stats: statRows.map(([label, value]) => ({ label, value })) };
  }

  const [r, langs, rel, contrib, hasReadme] = await Promise.all([
    gh<any>(`/repos/${p.owner}/${p.repo}`),
    gh<Record<string, number>>(`/repos/${p.owner}/${p.repo}/languages`).catch(() => ({})),
    gh<any[]>(`/repos/${p.owner}/${p.repo}/releases?per_page=100`).catch(() => []),
    gh<any[]>(`/repos/${p.owner}/${p.repo}/contributors?per_page=100`).catch(() => []),
    gh<any>(`/repos/${p.owner}/${p.repo}/readme`).then(() => true).catch(() => false),
  ]);
  if (r.private) throw new BountyError("NOT_FOUND", "This repository is private.", 404);
  const hyg = [r.description, r.license, r.has_issues, r.homepage, hasReadme].filter(Boolean).length / 5;
  const s: Signals = { stars: r.stargazers_count, forks: r.forks_count, watchers: r.subscribers_count ?? r.watchers_count, contributors: contrib.length,
    releases: rel.length, languages: Object.keys(langs).length, hygiene: hyg, ageYears: yrs(r.created_at), recencyDays: (Date.now() - new Date(r.pushed_at).getTime()) / 864e5 };
  const res = score("repo", s);
  return { mode: "repo", id: bid(r.full_name), name: r.name, handle: r.full_name, url: r.html_url, avatar: await avatarData(r.owner.avatar_url),
    bounty: res.bounty, score: res.total, tier: res.tier, categories: res.categories, generatedAt: now,
    stats: [["STARS", fmt(r.stargazers_count)], ["FORKS", fmt(r.forks_count)], ["CONTRIBUTORS", fmt(contrib.length) + (contrib.length >= 100 ? "+" : "")], ["RELEASES", fmt(rel.length)], ["LANGUAGES", fmt(Object.keys(langs).length)], ["LICENSE", r.license?.spdx_id || "NONE"]].map(([label, value]) => ({ label, value })) };
}
