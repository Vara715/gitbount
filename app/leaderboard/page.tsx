import Link from "next/link";
import { Footer, Nav } from "@/components/Chrome";
import { Board } from "@/components/Board";
import { listBounties, type Sort } from "@/lib/store";
export const dynamic = "force-dynamic";
export const metadata = { title: "The Bounty Board — GitHub Bounty" };
const TABS: [Sort, string][] = [["highest", "HIGHEST BOUNTY"], ["recent", "RECENTLY POSTED"], ["active", "MOST ACTIVE"], ["repo", "REPOSITORY BOUNTY"]];
export default async function Leaderboard({ searchParams }: { searchParams: { sort?: string } }) {
  const sort = (TABS.find(([k]) => k === searchParams.sort)?.[0] ?? "highest") as Sort;
  const items = await listBounties(sort, 48);
  return (<><Nav /><main className="page">
    <h1 className="serif center big2">THE BOUNTY BOARD</h1>
    <p className="center hint">A ranking of this app's own gamified score — not of programming ability.</p>
    <div className="tabs">{TABS.map(([k, l]) => <Link key={k} href={`/leaderboard?sort=${k}`} aria-current={k === sort}>{l}</Link>)}</div>
    <Board items={items} />
  </main><Footer /></>);
}
