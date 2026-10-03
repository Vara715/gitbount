import { Footer, Nav } from "@/components/Chrome";
import { SCORING_CONFIG, TIERS, bountyFor } from "@/lib/scoring";
export const metadata = { title: "How It Works — GitHub Bounty" };
const SAMPLE = [0, 20, 40, 60, 80, 100];
export default function How() {
  return (<><Nav /><main className="page prose">
    <h1 className="serif big2">HOW THE BOUNTY IS SET</h1>
    <section><span className="serif num">01</span><h2 className="serif">DATA</h2>
      <p>Only public GitHub data. Profiles: account age, followers, original (non-fork) repositories, stars, forks, languages, README/license hygiene, recent pushes. With a server token we also read the last year of commits, pull requests, issues, reviews and weekly consistency. Repositories: stars, forks, watchers, contributors, releases, languages, age, license, last push.</p></section>
    <section><span className="serif num">02</span><h2 className="serif">SCORING</h2>
      <p>Each signal passes through diminishing returns, <code>1 − e^(−x/k)</code>, so quantity can't buy a bounty. Signals fold into five categories, then into one 0–100 score:</p>
      <ul className="weights">{Object.entries(SCORING_CONFIG.weights).map(([k, w]) => (<li key={k}><span className="mono">{k.toUpperCase()}</span><div className="bar"><i style={{ width: `${w * 100 * 3}%` }} /></div><b>{Math.round(w * 100)}%</b></li>))}</ul>
      <p>Anti-spam: hundreds of repositories with almost no stars get their activity discounted. Weights live in <code>lib/scoring.ts</code>.</p></section>
    <section><span className="serif num">03</span><h2 className="serif">BOUNTY</h2>
      <p><code>bounty = 1,000,000 × 10^(0.035 × score)</code>. Every score point multiplies the bounty by about 1.08, like real bounties escalate.</p>
      <table className="mono"><tbody>{SAMPLE.map((s) => <tr key={s}><td>score {s}</td><td>฿ {bountyFor(s).toLocaleString("en-US")}</td></tr>)}</tbody></table>
      <div className="tiers">{TIERS.map((t) => <div key={t.name}><b className="serif" style={{ color: t.color }}>{t.name}</b><span className="mono">≥ {t.min}</span><em>{t.description}</em></div>)}</div>
      <p>Classes are part of a game. They do not measure programming ability.</p></section>
    <section><span className="serif num">04</span><h2 className="serif">POSTER</h2>
      <p>The poster is drawn in code as SVG — never by an image model — so every letter stays sharp. Downloads are 1600×2240 PNG (or SVG) of exactly what you see, with fonts embedded.</p></section>
  </main><Footer /></>);
}
