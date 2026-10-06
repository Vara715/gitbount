import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { BoardEntry, BountyResult } from "./types";

/**
 * Leaderboard storage.
 *  - Upstash Redis when its REST env vars are present (production / Vercel).
 *  - Local JSON file otherwise (`npm run dev`, Docker with a volume).
 * Both back the same two functions: saveBounty() and listBounties().
 */
export type Sort = "highest" | "recent" | "active" | "repo";
const MAX = 500;

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const toEntry = (r: BountyResult): BoardEntry => ({
  handle: r.handle, name: r.name, mode: r.mode, bounty: r.bounty, tier: r.tier.name, tierColor: r.tier.color, score: r.score,
  activity: r.categories.find((c) => c.key === "activity")?.score ?? 0, at: r.generatedAt,
});

/* ---------- Redis ---------- */
const H = "gb:entries";                                   // hash: handle(lowercase) -> entry
const Z: Record<Sort, string> = { highest: "gb:z:bounty", recent: "gb:z:recent", active: "gb:z:activity", repo: "gb:z:repo" };

async function saveRedis(db: Redis, e: BoardEntry) {
  const id = e.handle.toLowerCase();
  const p = db.pipeline();
  p.hset(H, { [id]: e });
  p.zadd(Z.highest, { score: e.bounty, member: id });
  p.zadd(Z.recent, { score: Date.parse(e.at), member: id });
  p.zadd(Z.active, { score: e.activity, member: id });
  if (e.mode === "repo") p.zadd(Z.repo, { score: e.bounty, member: id });
  await p.exec();
  // keep the board bounded: drop the oldest entries beyond MAX everywhere
  const total = await db.zcard(Z.recent);
  if (total > MAX) {
    const old = (await db.zrange(Z.recent, 0, total - MAX - 1)) as string[];
    if (old.length) {
      const c = db.pipeline();
      c.hdel(H, ...old);
      for (const k of Object.values(Z)) c.zrem(k, ...old);
      await c.exec();
    }
  }
}
async function listRedis(db: Redis, sort: Sort, limit: number): Promise<BoardEntry[]> {
  const ids = (await db.zrange(Z[sort], 0, limit - 1, { rev: true })) as string[];
  if (!ids.length) return [];
  const map = (await db.hmget<Record<string, BoardEntry>>(H, ...ids)) ?? {};
  return ids.map((id) => map[id]).filter(Boolean);
}

/* ---------- JSON file (local fallback) ---------- */
const DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data"));
const FILE = path.join(DIR, "bounties.json");
async function readFile(): Promise<BoardEntry[]> { try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return []; } }
async function saveFile(e: BoardEntry) {
  const all = (await readFile()).filter((x) => x.handle.toLowerCase() !== e.handle.toLowerCase());
  all.unshift(e);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all.slice(0, MAX)));
}
async function listFile(sort: Sort, limit: number) {
  let all = await readFile();
  if (sort === "repo") all = all.filter((e) => e.mode === "repo");
  const by: Record<Sort, (a: BoardEntry, b: BoardEntry) => number> = {
    highest: (a, b) => b.bounty - a.bounty, repo: (a, b) => b.bounty - a.bounty,
    recent: (a, b) => b.at.localeCompare(a.at), active: (a, b) => b.activity - a.activity };
  return all.sort(by[sort]).slice(0, limit);
}

/* ---------- public API (best-effort: storage failures never break a bounty) ---------- */
export async function saveBounty(r: BountyResult) {
  try { const e = toEntry(r); redis ? await saveRedis(redis, e) : await saveFile(e); } catch (err) { console.error("[store] save failed:", err); }
}
export async function listBounties(sort: Sort = "highest", limit = 24): Promise<BoardEntry[]> {
  try { return redis ? await listRedis(redis, sort, limit) : await listFile(sort, limit); } catch (err) { console.error("[store] list failed:", err); return []; }
}

/** For /api/health: which backend is active and whether it responds. Never returns secrets. */
export async function storageStatus() {
  if (!redis) return { backend: "file", ok: false, note: "Upstash env vars not found, using local/tmp JSON file (not persistent on Vercel)" };
  try { await redis.ping(); return { backend: "redis", ok: true, entries: await redis.zcard(Z.recent) }; }
  catch (e) { return { backend: "redis", ok: false, error: String((e as Error).message).slice(0, 160) }; }
}
