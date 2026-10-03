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
  </head><body>{children}</body></html>);
}
