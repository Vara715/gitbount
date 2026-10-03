"use client";
import { useEffect, useState } from "react";
import type { BountyResult } from "@/lib/types";
import { Result } from "./Result";

const STAGES = ["FETCHING GITHUB DATA", "SCANNING REPOSITORIES", "MEASURING ACTIVITY", "ANALYZING IMPACT", "CALCULATING BOUNTY", "BOUNTY IDENTIFIED"];
const ERRORS: Record<string, string> = {
  NOT_FOUND: "THE TRAIL HAS GONE COLD", RATE_LIMIT: "THE MARINES HAVE BLOCKED THE ROUTE", INVALID: "THAT NAME WON'T HOLD UP",
  TIMEOUT: "THE SEAS ARE TOO CALM", UPSTREAM: "SOMETHING WENT OVERBOARD",
};

export function Hunt({ children }: { children?: React.ReactNode }) {
  const [q, setQ] = useState(""); const [kind, setKind] = useState<"profile" | "repo">("profile");
  const [stage, setStage] = useState(-1); const [res, setRes] = useState<BountyResult | null>(null);
  const [err, setErr] = useState<{ code: string; error: string } | null>(null); const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("gb_recent") || "[]")); } catch {} }, []);
  useEffect(() => { // deep links like /?q=owner/repo
    const p = new URLSearchParams(location.search).get("q"); if (p) setQ(p);
  }, []);

  async function run(e: React.FormEvent) {
    e.preventDefault(); const query = q.trim(); if (!query) return;
    setRes(null); setErr(null); setStage(0);
    const seq = (async () => { for (let i = 0; i < STAGES.length; i++) { setStage(i); await new Promise((r) => setTimeout(r, 800)); } })();
    const call = fetch(`/api/bounty?q=${encodeURIComponent(query)}`).then(async (r) => ({ ok: r.ok, body: await r.json() }))
      .catch(() => ({ ok: false, body: { code: "UPSTREAM", error: "Network failure. Check your connection." } }));
    const [, out] = await Promise.all([seq, call]); setStage(-1);
    if (out.ok) {
      const r = out.body as BountyResult; setRes(r); history.replaceState(null, "", `/bounty/${r.handle}`);
      const next = [query, ...recent.filter((x) => x !== query)].slice(0, 5); setRecent(next); localStorage.setItem("gb_recent", JSON.stringify(next));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setErr(out.body);
  }
  const reset = () => { setRes(null); setQ(""); history.replaceState(null, "", "/"); };
  const busy = stage >= 0;

  if (res) return <Result r={res} onReset={reset} />;
  return (<>
    <section className="hero" id="hunt">
      <div className="wanted serif">— WANTED —</div>
      <h1 className="serif">EVERY CODER<br />HAS A BOUNTY.</h1>
      <div className="tabs" role="tablist" aria-label="Bounty type">
        <button role="tab" aria-selected={kind === "profile"} onClick={() => setKind("profile")}>PROFILE BOUNTY</button>
        <button role="tab" aria-selected={kind === "repo"} onClick={() => setKind("repo")}>REPOSITORY BOUNTY</button>
      </div>
      <form className="search" onSubmit={run}>
        <input aria-label="GitHub username or owner/repository" className="mono" list="recent" autoComplete="off" spellCheck={false}
          placeholder={kind === "repo" ? "owner/repository" : "@username"} value={q} onChange={(e) => setQ(e.target.value)} disabled={busy} />
        <datalist id="recent">{recent.map((x) => <option key={x} value={x} />)}</datalist>
        <button className="cta" disabled={busy}>CALCULATE BOUNTY</button>
      </form>
      <p className="hint">Analyze activity. Measure impact. Claim your bounty.</p>
      {busy && <ol className="seq" aria-live="polite">{STAGES.map((s, i) => <li key={s} className={i < stage ? "done" : i === stage ? "on" : ""}>{s}</li>)}</ol>}
      {err && <div className="err" role="alert"><h2 className="serif">{ERRORS[err.code] || ERRORS.UPSTREAM}</h2><p>{err.error}</p></div>}
    </section>
    {!busy && children}
  </>);
}
