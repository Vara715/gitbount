"use client";
import { useRef, useState } from "react";
import type { BountyResult } from "@/lib/types";
import { Poster, PosterBack } from "./Poster";
import { Counter } from "./Counter";
import { posterPng, posterSvg } from "@/lib/exportPoster";

const short = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : String(n));

export function Result({ r, onReset }: { r: BountyResult; onReset?: () => void }) {
  const [flip, setFlip] = useState(false); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const front = useRef<SVGSVGElement>(null), back = useRef<SVGSVGElement>(null), tilt = useRef<HTMLDivElement>(null);
  const slug = r.handle.replace("/", "-"), link = () => `${location.origin}/bounty/${r.handle}`;
  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2200); };
  const save = (href: string, name: string) => { const a = document.createElement("a"); a.href = href; a.download = name; a.click(); };
  const face = () => (flip ? back.current! : front.current!);
  const png = async () => { setBusy(true); try { save(await posterPng(face()), `bounty-${slug}${flip ? "-back" : ""}.png`); } finally { setBusy(false); } };
  const svg = async () => save(URL.createObjectURL(new Blob([await posterSvg(face())], { type: "image/svg+xml" })), `bounty-${slug}.svg`);
  const copy = async (t: string, m: string) => { await navigator.clipboard?.writeText(t); toast(m); };
  const share = async () => {
    const data = { title: `${r.name} is WANTED`, text: `${r.handle}: ฿${r.bounty.toLocaleString("en-US")} (${r.tier.name})`, url: link() };
    if (navigator.share) { try { await navigator.share(data); } catch {} } else copy(link(), "Link copied");
  };
  const move = (e: React.MouseEvent) => {
    const el = tilt.current; if (!el) return; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    el.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`; el.style.setProperty("--sx", `${-x * 40}px`); el.style.setProperty("--sy", `${-y * 40 + 30}px`);
    el.style.setProperty("--px", `${-x * 14}px`); el.style.setProperty("--py", `${-y * 14}px`);
  };
  return (
    <section className="result">
      <div>
        <div className="poster-wrap" onMouseMove={move} onMouseLeave={() => tilt.current && (tilt.current.style.transform = "")}>
          <div className="tilt" ref={tilt}>
            <div className={`flipper ${flip ? "flipped" : ""}`}>
              <div className="face"><Poster r={r} svgRef={front} /></div>
              <div className="face backface"><PosterBack r={r} svgRef={back} /></div>
            </div>
          </div>
        </div>
        <button className="cta ghost" onClick={() => setFlip(!flip)} aria-pressed={flip}>{flip ? "VIEW FRONT" : "FLIP / INSPECT"}</button>
      </div>
      <div className="panel">
        <p className="mono hint">{r.mode === "repo" ? "REPOSITORY BOUNTY" : "PROFILE BOUNTY"} · {r.id}</p>
        <h2 className="serif name">{r.name}</h2>
        <p className="big serif"><Counter to={r.bounty} /></p>
        <span className="tier serif" style={{ color: r.tier.color }}>{r.tier.name}</span> <b className="mono">SCORE {r.score}</b>
        <p><em>{r.tier.description}</em></p>
        {r.rarity && <p className="mono hint">Top {r.rarity.topPercent}% of {r.rarity.total.toLocaleString("en-US")} bounties on the board</p>}
        <div className="actions">
          <button className="cta" onClick={png} disabled={busy}>{busy ? "PRINTING…" : "DOWNLOAD POSTER"}</button>
          <button className="cta ghost" onClick={svg}>SVG</button>
          <button className="cta ghost" onClick={() => copy(link(), "Link copied")}>COPY LINK</button>
          <button className="cta ghost" onClick={share}>SHARE</button>
          <button className="cta ghost" onClick={() => copy(`฿${r.bounty.toLocaleString("en-US")}`, "Bounty copied")}>COPY BOUNTY</button>
          {onReset && <button className="cta ghost" onClick={onReset}>NEW TARGET</button>}
        </div>
        <p className="toast" role="status">{msg}</p>
        <h3 className="serif">WHY THIS BOUNTY?</h3>
        <ul className="ledger">{[...r.categories].sort((a, b) => b.share - a.share).map((c, i) => (
          <li key={c.key}><span className="mono plus">+ {short(c.share)}</span><span className="lbl">{c.label}</span>
            <span className="stars" aria-label={`${Math.round(c.score / 10)} out of 10`}>{"★".repeat(Math.round(c.score / 10))}{"☆".repeat(10 - Math.round(c.score / 10))}</span>
            <div className="bar"><i style={{ width: `${(c.share / Math.max(1, ...r.categories.map((x) => x.share))) * 100}%`, animationDelay: `${0.3 + i * 0.12}s` }} /></div></li>))}</ul>
        {r.categories.map((c) => (
          <details key={c.key}><summary><span>{c.label}</span><span>{c.score}</span></summary>
            <div className="bar"><i style={{ width: `${c.score}%` }} /></div>
            <p>{c.note} Weight {Math.round(c.weight * 100)}% · contributes ≈ ฿{c.share.toLocaleString("en-US")}</p></details>))}
        <details><summary><span>HOW WAS THIS CALCULATED?</span></summary>
          <p className="mono">Each signal is squashed with diminishing returns, 1 − e^(−x/k), so 100 low-impact repositories cannot outweigh a few that matter. Signals are weighted per category and summed into a 0–100 score; bounty = 1,000,000 × 10^(0.035 × score). Tiers are a gamified label, not a measure of programming ability. <a href="/how-it-works">Full methodology →</a></p></details>
      </div>
    </section>
  );
}
