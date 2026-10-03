import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { buildBounty } from "@/lib/github";
export const runtime = "nodejs";
const font = (f: string) => readFile(path.join(process.cwd(), "public/fonts", f));
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  let r; try { r = await buildBounty(q); } catch { r = null; }
  const [f9, f4] = await Promise.all([font("playfair-display-latin-900-normal.woff"), font("special-elite-latin-400-normal.woff")]);
  const ink = "#4a2a12";
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", background: "#d2b98e", color: ink, padding: 40, fontFamily: "Playfair" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, border: `6px solid ${ink}`, padding: 30, justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 1 }}>WANTED</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900 }}>{(r?.name || "UNKNOWN OUTLAW").toUpperCase().slice(0, 22)}</div>
        <div style={{ display: "flex", fontSize: 54, fontFamily: "Elite" }}>{r ? `฿ ${r.bounty.toLocaleString("en-US")}-` : "THE TRAIL HAS GONE COLD"}</div>
        <div style={{ display: "flex", fontSize: 30, fontFamily: "Elite" }}>{r ? `${r.tier.name} · githubbounty` : "githubbounty"}</div>
      </div>
      {r?.avatar && /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.avatar} width={440} height={440} style={{ marginLeft: 30, alignSelf: "center", border: `10px solid ${ink}` }} alt="" />}
    </div>),
    { width: 1200, height: 630, fonts: [{ name: "Playfair", data: f9, weight: 900 }, { name: "Elite", data: f4, weight: 400 }] });
}
