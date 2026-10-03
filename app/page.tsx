import Link from "next/link";
import { Footer, Nav } from "@/components/Chrome";
import { Hunt } from "@/components/Hunt";
import { Poster } from "@/components/Poster";
import { Board } from "@/components/Board";
import { EXAMPLE } from "@/lib/example";
import { listBounties } from "@/lib/store";
export const dynamic = "force-dynamic";

export default async function Home() {
  const top = await listBounties("highest", 4);
  return (<>
    <Nav />
    <main>
      <Hunt>
        <section className="steps">{[["01", "TRACK", "We inspect your public GitHub activity."], ["02", "CALCULATE", "Our scoring engine evaluates activity, impact and collaboration."], ["03", "REVEAL", "Your GitHub bounty is revealed."]].map(([n, t, d]) => (
          <div key={n}><span className="serif num">{n}</span><h3 className="serif">{t}</h3><p>{d}</p></div>))}</section>
        <section className="example"><div className="ex-poster"><Poster r={EXAMPLE} /></div>
          <div><p className="mono hint">EXAMPLE · FICTIONAL</p><h2 className="serif">A POSTER WORTH POSTING.</h2>
            <p>Rendered programmatically as crisp SVG: parchment, ink, your portrait and your numbers. Download it in 1600×2240 and pin it anywhere.</p>
            <Link className="cta link" href="/how-it-works">HOW IT WORKS</Link></div></section>
        <section className="boardsec"><h2 className="serif center">THE BOUNTY BOARD</h2><Board items={top} />
          <p className="center"><Link href="/leaderboard" className="ulink">See the full board →</Link></p></section>
        <section className="final"><h2 className="serif">HOW HIGH IS YOUR BOUNTY?</h2><a className="cta link" href="#hunt">FIND OUT</a></section>
      </Hunt>
    </main>
    <Footer />
  </>);
}
