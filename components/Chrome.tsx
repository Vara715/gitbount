import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
export function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="logo serif">GITHUB BOUNTY</Link>
      <nav aria-label="Main"><Link href="/">Bounty</Link><Link href="/?q=facebook/react#hunt">Repository</Link><Link href="/leaderboard">Leaderboard</Link><Link href="/how-it-works">How It Works</Link></nav>
      <SearchBar />
      <Link href="/#hunt" className="cta navcta">CALCULATE BOUNTY</Link>
      <ThemeToggle />
    </header>
  );
}
export function Footer() {
  return <footer className="foot"><strong className="serif">GITHUB BOUNTY</strong><span>Built for developers who leave a trail. Bounties are a gamified score, not a measure of programming ability.</span></footer>;
}
