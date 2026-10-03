import type { BountyResult } from "@/lib/types";
const INK = "#3b2412";
export const POSTER_W = 800, POSTER_H = 1100;
export function Poster({ r, svgRef }: { r: BountyResult; svgRef?: React.Ref<SVGSVGElement> }) {
  const name = r.name.toUpperCase().replace(/\s+/g, "·").slice(0, 22);
  const nameSize = Math.min(86, 1000 / Math.max(name.length, 8) * 1.55);
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} width="100%" role="img" aria-label={`Wanted poster for ${r.handle}, bounty ${r.bounty.toLocaleString("en-US")}`}>
      <defs>
        <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" values="0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .15 0 0 0 .22 0"/></filter>
        <filter id="blot"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .4 0 0 0 0 .22 0 0 0 0 .08 0 0 0 .5 -.12"/></filter>
        <filter id="ink"><feTurbulence baseFrequency="0.04" numOctaves="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="1.6"/></filter>
        <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#5a3515" stopOpacity=".55"/></radialGradient>
        <clipPath id="pic"><rect x="70" y="270" width="660" height="460"/></clipPath>
      </defs>
      <rect width={POSTER_W} height={POSTER_H} fill="#d8bf93"/>
      <rect width={POSTER_W} height={POSTER_H} filter="url(#blot)"/>
      <rect width={POSTER_W} height={POSTER_H} filter="url(#paper)"/>
      <rect width={POSTER_W} height={POSTER_H} fill="url(#vig)"/>
      <g fill={INK} filter="url(#ink)" fontFamily="'Playfair Display','Bodoni 72',Georgia,serif">
        <rect x="26" y="26" width="748" height="1048" fill="none" stroke={INK} strokeWidth="3"/>
        <rect x="36" y="36" width="728" height="1028" fill="none" stroke={INK} strokeWidth="1"/>
        <text x="400" y="215" textAnchor="middle" fontSize="196" fontWeight="900" textLength="680" lengthAdjust="spacingAndGlyphs">WANTED</text>
        <rect x="64" y="264" width="672" height="472" fill={INK}/>
        <g clipPath="url(#pic)">
          <rect x="70" y="270" width="660" height="460" fill="#a9906a"/>
          {r.avatar
            ? <image href={r.avatar} x="170" y="270" width="460" height="460" preserveAspectRatio="xMidYMid slice"/>
            : <g fill="#5a4630"><circle cx="400" cy="450" r="90"/><ellipse cx="400" cy="720" rx="200" ry="170"/></g>}
          <rect x="70" y="270" width="660" height="460" fill="#a9906a" opacity=".12"/>
        </g>
        <text x="400" y="800" textAnchor="middle" fontSize="48" fontWeight="700" letterSpacing="22">DEAD OR ALIVE?</text>
        <text x="400" y="885" textAnchor="middle" fontSize={nameSize} fontWeight="900" textLength={Math.min(700, name.length * nameSize * 0.62)} lengthAdjust="spacingAndGlyphs">{name}</text>
        <text x="70" y="975" fontSize="60" fontWeight="700">฿</text>
        <text x="130" y="975" fontSize="76" fontWeight="500" letterSpacing="6" fontFamily="'Special Elite','Courier New',monospace">{r.bounty.toLocaleString("en-US")}-</text>
        <text x="730" y="1038" textAnchor="end" fontSize="46" fontWeight="900" fill={r.tier.color}>{r.tier.name}</text>
        <g fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700">
          <text x="70" y="1012">{r.stats.slice(0, 3).map((s) => `${s.label} ${s.value}`).join("  ·  ")}</text>
          <text x="70" y="1032">{r.stats.slice(3, 6).map((s) => `${s.label} ${s.value}`).join("  ·  ")}</text>
          <text x="70" y="1052" opacity=".7">github.com/{r.handle} · {r.id} · {r.generatedAt.slice(0, 10)}</text>
        </g>
      </g>
      <g stroke={INK} strokeWidth="2" opacity=".5">{[120, 330, 560, 800, 980].map((y) => <g key={y}><line x1="0" x2="16" y1={y} y2={y}/><line x1="784" x2="800" y1={y} y2={y}/></g>)}</g>
      {r.mode === "repo" && <text x="740" y="258" textAnchor="end" fontSize="16" fontFamily="'Courier New',monospace" fill={INK} fontWeight="700">THE PROJECT</text>}
    </svg>
  );
}
