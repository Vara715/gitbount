import { promises as fs } from "fs";
import path from "path";
import type { BoardEntry, BountyResult } from "./types";
// Simple JSON file store. On Vercel the filesystem is ephemeral (/tmp), so use a DB there for permanence.
const DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data"));
const FILE = path.join(DIR, "bounties.json");
const MAX = 500;
async function read(): Promise<BoardEntry[]> { try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return []; } }
export async function saveBounty(r: BountyResult) {
  try {
    const all = (await read()).filter((e) => e.handle.toLowerCase() !== r.handle.toLowerCase());
    all.unshift({ handle: r.handle, name: r.name, mode: r.mode, bounty: r.bounty, tier: r.tier.name, tierColor: r.tier.color, score: r.score,
      activity: r.categories.find((c) => c.key === "activity")?.score ?? 0, at: r.generatedAt });
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all.slice(0, MAX)));
  } catch { /* persistence is best-effort */ }
}
export type Sort = "highest" | "recent" | "active" | "repo";
export async function listBounties(sort: Sort = "highest", limit = 24): Promise<BoardEntry[]> {
  let all = await read();
  if (sort === "repo") all = all.filter((e) => e.mode === "repo");
  const by: Record<Sort, (a: BoardEntry, b: BoardEntry) => number> = {
    highest: (a, b) => b.bounty - a.bounty, repo: (a, b) => b.bounty - a.bounty,
    recent: (a, b) => b.at.localeCompare(a.at), active: (a, b) => b.activity - a.activity };
  return all.sort(by[sort]).slice(0, limit);
}
