import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GitHub Bounty — Discover Your GitHub Bounty",
  description: "Every coder has a bounty. Turn your GitHub profile or repository into a wanted poster.",
  openGraph: { title: "GitHub Bounty", description: "How dangerous is your GitHub profile?", type: "website" },
  twitter: { card: "summary_large_image", title: "GitHub Bounty" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=Special+Elite&family=Inter:wght@400;600&display=swap" rel="stylesheet"/>
  </head><body>{children}</body></html>);
}
