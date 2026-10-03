import { buildBounty } from "./github";
import { saveBounty } from "./store";
export async function getBounty(q: string) { const r = await buildBounty(q); await saveBounty(r); return r; }
