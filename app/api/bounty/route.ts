import { NextRequest, NextResponse } from "next/server";
import { BountyError, buildBounty } from "@/lib/github";
export const runtime = "nodejs";
const hits = new Map<string, number[]>();
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 12) return NextResponse.json({ code: "RATE_LIMIT", error: "Too many requests. Slow down, outlaw." }, { status: 429 });
  hits.set(ip, [...recent, now]);
  try { return NextResponse.json(await buildBounty(req.nextUrl.searchParams.get("q") || "")); }
  catch (e) {
    if (e instanceof BountyError) return NextResponse.json({ code: e.code, error: e.message }, { status: e.status });
    return NextResponse.json({ code: "UPSTREAM", error: "Something unexpected happened." }, { status: 500 });
  }
}
