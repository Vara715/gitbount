"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
/** Global search: "@user" or "owner/repo" (or a github.com URL) -> /bounty/... */
export function SearchBar() {
  const router = useRouter(); const [q, setQ] = useState(""); const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("gb_recent") || "[]")); } catch {} }, []);
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/^@/, "").replace(/\/+$/, "");
    if (!t) return; router.push("/bounty/" + t.split("/").slice(0, 2).map(encodeURIComponent).join("/")); setQ("");
  };
  return (
    <form className="navsearch" onSubmit={go} role="search">
      <input aria-label="Search a GitHub user or repository" className="mono" list="nav-recent" placeholder="@user or owner/repo" value={q} onChange={(e) => setQ(e.target.value)} />
      <datalist id="nav-recent">{recent.map((x) => <option key={x} value={x} />)}</datalist>
    </form>
  );
}
