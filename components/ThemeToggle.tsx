"use client";
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem("gb_theme", root.dataset.theme); } catch {}
  };
  return <button className="theme" onClick={toggle} aria-label="Toggle light / night mode" title="Day / night">☾ / ☀</button>;
}
