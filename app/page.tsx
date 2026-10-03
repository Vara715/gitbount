"use client";
import { useEffect, useRef, useState } from "react";
import type { BountyResult } from "@/lib/types";
import { Poster, POSTER_H, POSTER_W } from "@/components/Poster";

const STAGES = ["FETCHING GITHUB DATA", "SCANNING REPOSITORIES", "MEASURING ACTIVITY", "ANALYZING IMPACT", "CALCULATING BOUNTY", "BOUNTY IDENTIFIED"];
const ERRORS: Record<string, [string, string]> = {
  NOT_FOUND: ["THE TRAIL HAS GONE COLD", ""], RATE_LIMIT: ["THE MARINES HAVE BLOCKED THE ROUTE", ""],
  INVALID: ["THAT NAME WON'T HOLD UP", ""], TIMEOUT: ["THE SEAS ARE TOO CALM", ""], UPSTREAM: ["SOMETHING WENT OVERBOARD", ""],
};

function Counter({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setV(to);
    const t0 = performance.now(), D = 2600; let raf = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / D); setV(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>฿ {v.toLocaleString("en-US")}</>;
}

export default function Home() {
  const [q, setQ] = useState(""); const [stage, setStage] = useState(-1);
  const [res, setRes] = useState<BountyResult | null>(null); const [err, setErr] = useState<{ code: string; error: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null); const posterRef = useRef<HTMLDivElement>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault(); if (!q.trim()) return;
    setRes(null); setErr(null); setStage(0);
    // Cinematic sequence runs alongside the real request; reveal waits for both.
    const seq = (async () => { for (let i = 0; i < STAGES.length; i++) { setStage(i); await new Promise((r) => setTimeout(r, 750)); } })();
    const call = fetch(`/api/bounty?q=${encodeURIComponent(q)}`).then(async (r) => ({ ok: r.ok, body: await r.json() })).catch(() => ({ ok: false, body: { code: "UPSTREAM", error: "Network failure. Check your connection." } }));
    const [, out] = await Promise.all([seq, call]);
    setStage(-1);
    out.ok ? setRes(out.body as BountyResult) : setErr(out.body);
  }

  const onMove = (e: React.MouseEvent) => {
    const el = posterRef.current; if (!el) return; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };
  const svgString = () => new XMLSerializer().serializeToString(svgRef.current!);
  const save = (href: string, name: string) => { const a = document.createElement("a"); a.href = href; a.download = name; a.click(); };
  const dlSvg = () => save(URL.createObjectURL(new Blob([svgString()], { type: "image/svg+xml" })), `bounty-${res!.handle.replace("/", "-")}.svg`);
  const dlPng = () => {
    const img = new Image(), c = document.createElement("canvas"); c.width = 1600; c.height = Math.round(1600 * POSTER_H / POSTER_W);
    img.onload = () => { c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); save(c.toDataURL("image/png"), `bounty-${res!.handle.replace("/", "-")}.png`); };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString());
  };
  const copy = (t: string) => navigator.clipboard?.writeText(t);
  const busy = stage >= 0;

  return (<>
    <header className="nav serif"><strong>GITHUB BOUNTY</strong><span className="mono">Every coder has a bounty.</span></header>
    <main>
      {!res && (<section className="hero">
        <div className="wanted serif">WANTED</div>
        <h1 className="serif">EVERY CODER<br />HAS A BOUNTY.</h1>
        <form className="search" onSubmit={run}>
          <input aria-label="GitHub username or owner/repository" className="mono" placeholder="@username  or  owner/repo" value={q} onChange={(e) => setQ(e.target.value)} disabled={busy} autoFocus />
          <button className="cta" disabled={busy}>CALCULATE BOUNTY</button>
        </form>
        <p className="hint">Analyze activity. Measure impact. Claim your bounty. Enter <b>owner/repo</b> for a project bounty.</p>
        {busy && <ol className="seq" aria-live="polite">{STAGES.map((s, i) => <li key={s} className={i < stage ? "done" : i === stage ? "on" : ""}>{s}</li>)}</ol>}
        {err && <div className="err" role="alert"><h2 className="serif">{(ERRORS[err.code] || ERRORS.UPSTREAM)[0]}</h2><p>{err.error}</p></div>}
      </section>)}
      {res && (<section className="result">
        <div className="poster-wrap"><div className="poster" ref={posterRef} onMouseMove={onMove} onMouseLeave={() => posterRef.current && (posterRef.current.style.transform = "")}><Poster r={res} svgRef={svgRef} /></div></div>
        <div>
          <p className="mono hint">{res.mode === "repo" ? "REPOSITORY BOUNTY" : "PROFILE BOUNTY"} · {res.id}</p>
          <p className="big serif"><Counter to={res.bounty} /></p>
          <span className="tier serif" style={{ color: res.tier.color }}>{res.tier.name}</span> <b className="mono">SCORE {res.score}</b>
          <p><em>{res.tier.description}</em></p>
          <div className="actions">
            <button className="cta" onClick={dlPng}>DOWNLOAD PNG</button><button className="cta" onClick={dlSvg}>SVG</button>
            <button className="cta" onClick={() => copy(`${res.handle} has a GitHub bounty of ฿${res.bounty.toLocaleString("en-US")} (${res.tier.name}) — ${res.url}`)}>COPY BOUNTY</button>
            <button className="cta" onClick={() => { setRes(null); setQ(""); }}>NEW TARGET</button>
          </div>
          {res.categories.map((c) => (<details key={c.key}><summary>{c.label} — {c.score}</summary>
            <div className="bar"><i style={{ width: `${c.score}%` }} /></div>
            <p>{c.note} Weight {Math.round(c.weight * 100)}% · contributes ≈ ฿{c.share.toLocaleString("en-US")}</p></details>))}
          <details><summary>HOW WAS THIS CALCULATED?</summary>
            <p className="mono">Each signal is squashed with diminishing returns (1 − e^(−x/k)), weighted per category, summed into a 0–100 score, then bounty = 1,000,000 × 10^(0.035 × score). Tiers are a gamified label, not a measure of programming ability. Weights live in lib/scoring.ts.</p></details>
        </div>
      </section>)}
    </main>
  </>);
}
