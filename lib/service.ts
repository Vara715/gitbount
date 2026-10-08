import { buildBounty } from "./github";
import { rankInfo, saveBounty } from "./store";
export async function getBounty(q: string) {
  const r = await buildBounty(q); await saveBounty(r);
  const rarity = await rankInfo(r.bounty);
  return rarity ? { ...r, rarity } : r;
}
