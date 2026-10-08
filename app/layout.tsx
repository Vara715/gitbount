import "./globals.css";
import type { Metadata } from "next";
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "GitHub Bounty — Discover Your GitHub Bounty",
  description: "Every coder has a bounty. Turn your GitHub profile or repository into a wanted poster.",
  openGraph: { title: "GitHub Bounty", description: "How dangerous is your GitHub profile?", type: "website", images: ["/api/og?q=torvalds"] },
  twitter: { card: "summary_large_image", title: "GitHub Bounty" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("gb_theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
  </head><body>
    <a className="skip" href="#main">Skip to content</a>
    <div className="map" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M60 700C240 560 300 640 460 520S720 300 860 380 1060 220 1140 120" strokeDasharray="4 12"/>
        <path d="M1110 100l30 30m0-30l-30 30" strokeWidth="5"/>
        <g className="compass"><circle cx="1010" cy="640" r="70"/><circle cx="1010" cy="640" r="52" strokeDasharray="2 6"/><path d="M1010 560v160M930 640h160"/><path d="M1010 568l10 72-10 72-10-72z" fill="currentColor" opacity=".5"/></g>
        <g strokeWidth="2.5"><path d="M130 140v110M130 190c70 0 70-40 140-40"/><circle cx="130" cy="140" r="9"/><circle cx="130" cy="250" r="9"/><circle cx="270" cy="150" r="9"/></g>
        <path d="M300 740c40-12 80 6 120-4M820 90c30 10 60-4 90 6" strokeWidth="3"/>
      </svg>
    </div>
    <div id="main">{children}</div>
  </body></html>);
}
