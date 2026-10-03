// Exports the exact on-screen SVG. Fonts are inlined as data URIs so the PNG matches the display.
const FONTS: [string, number, string][] = [
  ["Playfair Display", 700, "playfair-display-latin-700-normal"], ["Playfair Display", 900, "playfair-display-latin-900-normal"],
  ["Quicksand", 500, "quicksand-latin-500-normal"], ["Special Elite", 400, "special-elite-latin-400-normal"], ["Inter", 600, "inter-latin-600-normal"],
];
let cssP: Promise<string> | null = null;
const fontCss = () => (cssP ??= Promise.all(FONTS.map(async ([fam, w, file]) => {
  const buf = new Uint8Array(await (await fetch(`/fonts/${file}.woff2`)).arrayBuffer()); let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2')}`;
})).then((a) => a.join("")));
export const POSTER_PX = { w: 1600, h: 2240 };
export async function posterSvg(svg: SVGSVGElement) {
  const c = svg.cloneNode(true) as SVGSVGElement;
  const st = document.createElementNS("http://www.w3.org/2000/svg", "style"); st.textContent = await fontCss();
  c.insertBefore(st, c.firstChild); c.setAttribute("width", String(POSTER_PX.w)); c.setAttribute("height", String(POSTER_PX.h));
  return new XMLSerializer().serializeToString(c);
}
export async function posterPng(svg: SVGSVGElement) {
  const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(await posterSvg(svg)); await img.decode();
  const cv = document.createElement("canvas"); cv.width = POSTER_PX.w; cv.height = POSTER_PX.h;
  cv.getContext("2d")!.drawImage(img, 0, 0); return cv.toDataURL("image/png");
}
