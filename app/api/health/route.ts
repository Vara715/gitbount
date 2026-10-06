import { NextResponse } from "next/server";
import { storageStatus } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ github_token: Boolean(process.env.GITHUB_TOKEN), storage: await storageStatus() });
}
