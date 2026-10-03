"use client";
import { useEffect, useState } from "react";
export function Counter({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    const t0 = performance.now(), D = 2600; let raf = 0;
    // log-scale ramp: 1, 10, 100, 1,000 ... FINAL, as in the brief
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / D); setV(p >= 1 ? to : Math.round(Math.pow(to, 1 - Math.pow(1 - p, 3)) * (1 - 0) )); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>฿ {v.toLocaleString("en-US")}</>;
}
