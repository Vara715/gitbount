import Link from "next/link";
import type { BoardEntry } from "@/lib/types";
export function Board({ items }: { items: BoardEntry[] }) {
  if (!items.length) return <p className="hint center">No bounties posted yet. Be the first outlaw on the board.</p>;
  return (
    <ul className="board">{items.map((e) => (
      <li key={e.handle}><Link href={`/bounty/${e.handle}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://github.com/${e.handle.split("/")[0]}.png?size=120`} alt="" width={64} height={64} loading="lazy" />
        <div><strong className="serif">{e.handle}</strong><span className="mono">฿ {e.bounty.toLocaleString("en-US")}</span>
          <em style={{ color: e.tierColor }}>{e.mode === "repo" ? "PROJECT · " : ""}{e.tier}</em></div>
      </Link></li>))}</ul>
  );
}
