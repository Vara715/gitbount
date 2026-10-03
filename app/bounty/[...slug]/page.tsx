import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav } from "@/components/Chrome";
import { Result } from "@/components/Result";
import { BountyError } from "@/lib/github";
import { getBounty } from "@/lib/service";
export const dynamic = "force-dynamic";
type P = { params: { slug: string[] } };
const q = (p: P) => p.params.slug.map(decodeURIComponent).slice(0, 2).join("/");

export async function generateMetadata(p: P): Promise<Metadata> {
  const handle = q(p);
  return { title: `${handle} is WANTED — GitHub Bounty`, description: `See the GitHub bounty of ${handle}.`,
    openGraph: { title: `WANTED: ${handle}`, images: [`/api/og?q=${encodeURIComponent(handle)}`] },
    twitter: { card: "summary_large_image", images: [`/api/og?q=${encodeURIComponent(handle)}`] } };
}
export default async function Page(p: P) {
  let r = null, error = "";
  try { r = await getBounty(q(p)); } catch (e) { error = e instanceof BountyError ? e.message : "Something unexpected happened."; }
  return (<><Nav /><main>
    {r ? <Result r={r} /> : <section className="hero"><div className="err" role="alert"><h2 className="serif">THE TRAIL HAS GONE COLD</h2><p>{error}</p><p><Link href="/" className="ulink">Hunt another target →</Link></p></div></section>}
  </main><Footer /></>);
}
