import type { BountyResult } from "@/lib/types";
import { emWidth } from "@/lib/metrics";
export const POSTER_W = 800, POSTER_H = 1120;
const INK = "#4a2a12";
const SERIF = "'Playfair Display','Bodoni 72',Georgia,serif";

/** Shared aged-paper background used by both faces. */
function Paper() {
  return (<>
    <defs>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .2 0"/></filter>
      <filter id="blot"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .27 0 0 0 0 .1 0 0 0 .9 -.28"/></filter>
      <filter id="crumple" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="4" seed="3"/>
        <feDiffuseLighting lightingColor="#fff1d0" surfaceScale="3.2" diffuseConstant="1"><feDistantLight azimuth="225" elevation="52"/></feDiffuseLighting></filter>
      <filter id="ink"><feTurbulence baseFrequency="0.05" numOctaves="2" seed="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.2"/></filter>
      <radialGradient id="vig" cx=".5" cy=".5" r=".78"><stop offset=".62" stopColor="#5a3515" stopOpacity="0"/><stop offset="1" stopColor="#4a2a0e" stopOpacity=".5"/></radialGradient>
      <linearGradient id="grade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b4a22" stopOpacity=".05"/><stop offset="1" stopColor="#3b2208" stopOpacity=".28"/></linearGradient>
      <clipPath id="pic"><rect x="68" y="262" width="664" height="488" rx="2"/></clipPath>
    </defs>
    <rect width={POSTER_W} height={POSTER_H} fill="#cfb68c"/>
    <rect width={POSTER_W} height={POSTER_H} filter="url(#blot)"/>
    <rect width={POSTER_W} height={POSTER_H} filter="url(#crumple)" style={{ mixBlendMode: "multiply" }} opacity=".42"/>
    <rect width={POSTER_W} height={POSTER_H} filter="url(#grain)"/>
    <rect width={POSTER_W} height={POSTER_H} fill="url(#vig)"/>
    {/* edge tick marks, like the printed margins of a real bounty sheet */}
    <g stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".6">
      {[[130, 18], [150, 10], [338, 14], [356, 9], [520, 12], [790, 18], [808, 9], [962, 14], [1040, 10]].map(([y, l], i) => (
        <g key={i}><line x1="3" x2={3 + l} y1={y} y2={y}/><line x1={797 - l} x2="797" y1={y + 22} y2={y + 22}/></g>))}
      <path d="M400 4v16M392 12h16M400 1100v16M392 1108h16" strokeWidth="2.5"/>
    </g>
  </>);
}

function Scroll({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? "translate(800 0) scale(-1 1)" : undefined} fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" filter="url(#ink)">
      <path d="M62 800C26 800 24 852 58 852C86 852 84 818 62 820"/>
      <path d="M58 852C76 892 70 940 52 972C38 996 40 1034 64 1032C82 1030 80 1008 66 1010"/>
    </g>
  );
}

export function Poster({ r, svgRef }: { r: BountyResult; svgRef?: React.Ref<SVGSVGElement> }) {
  // Exact text fitting from real glyph metrics, so layout is identical in every renderer.
  const words = r.name.toUpperCase().replace(/[^\p{L}\p{N}\s._-]/gu, "").trim().split(/\s+/).join("·").slice(0, 20) || r.handle.toUpperCase().slice(0, 20);
  const wantedSx = 728 / (emWidth("serif9", "WANTED") * 214);
  const dead = "DEAD OR ALIVE", deadSize = 58, deadLs = (540 - emWidth("serif7", dead) * deadSize) / (dead.length - 1);
  const nameSize = 106, nameSx = Math.max(0.4, Math.min(1, 570 / (emWidth("serif9", words) * nameSize)));
  const amount = r.bounty.toLocaleString("en-US") + "-", LS = 0.16;
  const digSize = Math.min(84, 505 / (emWidth("num", amount) + amount.length * LS));
  const tierText = r.mode === "repo" ? "PROJECT" : r.tier.name, tierSize = Math.min(56, 300 / emWidth("serif9", tierText));
  const line = (a: number, b: number) => r.stats.slice(a, b).map((x) => `${x.label} ${x.value}`).join(" · ");
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} width="100%" role="img"
      aria-label={`Wanted poster for ${r.handle}. Bounty ${r.bounty.toLocaleString("en-US")}. Class ${r.tier.name}.`}>
      <Paper />
      <g fill={INK} fontFamily={SERIF}>
        <text transform={`translate(400 212) scale(${wantedSx} 1)`} textAnchor="middle" fontSize="214" fontWeight="900" filter="url(#ink)">WANTED</text>
        <rect x="58" y="252" width="684" height="508" rx="5" fill={INK}/>
        <g clipPath="url(#pic)">
          <rect x="68" y="262" width="664" height="488" fill="#a89570"/>
          {r.avatar
            ? <image href={r.avatar} x="68" y="262" width="664" height="488" preserveAspectRatio="xMidYMid slice"/>
            : <g fill="#5b4630"><ellipse cx="400" cy="720" rx="190" ry="150"/><circle cx="400" cy="470" r="92"/><path d="M290 440 Q400 300 510 440 Q400 410 290 440Z"/></g>}
          <rect x="68" y="262" width="664" height="488" fill="#c79a52" opacity=".16" style={{ mixBlendMode: "multiply" }}/>
          <rect x="68" y="262" width="664" height="488" fill="url(#grade)"/>
          <rect x="68" y="262" width="664" height="488" filter="url(#grain)" opacity=".8"/>
        </g>
        <text x={400 + deadLs / 2} y="832" textAnchor="middle" fontSize={deadSize} fontWeight="700" letterSpacing={deadLs} filter="url(#ink)">{dead}</text>
        <Scroll /><Scroll flip />
        <text transform={`translate(400 940) scale(${nameSx} 1)`} textAnchor="middle" fontSize={nameSize} fontWeight="900" filter="url(#ink)">{words}</text>
        <g filter="url(#ink)">
          <text x="94" y="1020" fontSize="82" fontWeight="900">B</text>
          <rect x="116" y="940" width="7" height="22"/><rect x="116" y="1010" width="7" height="22"/>
        </g>
        <text x="178" y="1018" fontSize={digSize} fontWeight="500" fontFamily="'Quicksand','Nunito',sans-serif" letterSpacing={LS * digSize}>{amount}</text>
        <g fontFamily="'Special Elite','Courier New',monospace" fontSize="11">
          <text x="110" y="1046">{line(0, 2)}</text><text x="110" y="1059">{line(2, 4)}</text><text x="110" y="1072">{line(4, 6)}</text>
          <text x="110" y="1085">github.com/{r.handle.slice(0, 34)}</text>
          <text x="110" y="1098">{r.id} · {r.generatedAt.slice(0, 10)}</text>
          <text x="110" y="1111" opacity=".75">GAMIFIED SCORE {r.score} · NOT A SKILL RATING</text>
        </g>
        <text x="738" y="1094" textAnchor="end" fontSize={tierSize} fontWeight="900" filter="url(#ink)">{tierText}</text>
        {r.mode === "repo" && <text x="738" y="1110" textAnchor="end" fontSize="12" fontFamily="'Special Elite',monospace">CLASS · {r.tier.name}</text>}
      </g>
    </svg>
  );
}

export function PosterBack({ r, svgRef }: { r: BountyResult; svgRef?: React.Ref<SVGSVGElement> }) {
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} width="100%" role="img" aria-label="Bounty intelligence report">
      <Paper />
      <g fill={INK} fontFamily={SERIF}>
        <text x="400" y="150" textAnchor="middle" fontSize="74" fontWeight="900" textLength="680" lengthAdjust="spacingAndGlyphs" filter="url(#ink)">BOUNTY INTELLIGENCE</text>
        <line x1="70" x2="730" y1="180" y2="180" stroke={INK} strokeWidth="4"/><line x1="70" x2="730" y1="190" y2="190" stroke={INK} strokeWidth="1.5"/>
        <g fontFamily="'Special Elite',monospace" fontSize="15">
          <text x="70" y="230">SUBJECT: {r.handle}</text><text x="730" y="230" textAnchor="end">FILE {r.id}</text>
        </g>
        {r.categories.map((c, i) => (
          <g key={c.key} transform={`translate(70 ${290 + i * 108})`}>
            <text y="0" fontSize="30" fontWeight="900">{c.label}</text><text x="660" textAnchor="end" fontSize="30" fontWeight="700">{c.score}</text>
            <rect y="14" width="660" height="20" fill="none" stroke={INK} strokeWidth="2.5"/><rect x="3" y="17" width={Math.max(2, 654 * c.score / 100)} height="14" fill="#8b1e22"/>
            <text y="62" fontSize="14" fontFamily="'Special Elite',monospace">{c.note.slice(0, 54)} · {Math.round(c.weight * 100)}% weight</text>
          </g>))}
        <g fontFamily="'Special Elite',monospace" fontSize="15">
          <text x="70" y="860">{r.stats.slice(0, 3).map((s) => `${s.label} ${s.value}`).join("  ·  ")}</text>
          <text x="70" y="884">{r.stats.slice(3, 6).map((s) => `${s.label} ${s.value}`).join("  ·  ")}</text>
          <text x="70" y="940" fontSize="13">METHOD: each signal is squashed with diminishing returns (1-e^-x/k),</text>
          <text x="70" y="958" fontSize="13">weighted per category, summed to a 0-100 score. Bounty = 1,000,000</text>
          <text x="70" y="976" fontSize="13">x 10^(0.035 x score). Gamified; not a measure of programming ability.</text>
        </g>
        <text x="70" y="1070" fontSize="46" fontWeight="900" fill={r.tier.color}>{r.tier.name} · {r.score}</text>
        <text x="730" y="1070" textAnchor="end" fontSize="16" fontFamily="'Special Elite',monospace">{r.generatedAt.slice(0, 10)}</text>
      </g>
    </svg>
  );
}
