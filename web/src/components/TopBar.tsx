import { useEffect, useState } from "react";
import { GitHubLink } from "./ui";

// Section anchors, in reading order. `short` labels the slim desktop bar; `long`
// labels the mobile dropdown (which has room). Section E's summary table links
// back to these same ids.
const NAV = [
  { id: "section-data", short: "Data", long: "The data" },
  { id: "section-a", short: "A · Surface", long: "A · The surface" },
  { id: "section-b", short: "B · Field", long: "B · The field" },
  { id: "section-c", short: "C · Squad", long: "C · The squad and body" },
  { id: "section-d", short: "D · Synthesis", long: "D · Combining the forces" },
  { id: "section-e", short: "E · Verdict", long: "E · What this surfaces" },
] as const;

/** The persistent top bar: section navigation with scroll-spy, and the GitHub
 *  link. On narrow screens the section nav collapses into a hamburger menu. */
export function TopBar() {
  const [active, setActive] = useState<string>(NAV[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-spy: the active section is the last one whose top has scrolled past a
  // line just below the bar. A scroll-position read (rather than IntersectionObserver)
  // stays correct at the bottom of the page, where the final section can be too short
  // to reach the viewport middle. Forces the last section once scrolled to the end.
  useEffect(() => {
    const OFFSET = 90; // bar height + a little breathing room
    const onScroll = () => {
      let current: string = NAV[0].id;
      for (const { id } of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= OFFSET) current = id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? NAV[NAV.length - 1].id : current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on resize back to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <nav className="topbar-nav" aria-label="Report sections">
          {NAV.map((s) => (
            <button
              key={s.id}
              type="button"
              className={active === s.id ? "active" : ""}
              aria-current={active === s.id ? "true" : undefined}
              onClick={() => go(s.id)}
            >
              {s.short}
            </button>
          ))}
        </nav>

        <div className="topbar-slot right">
          <button
            type="button"
            className={`topbar-burger ${menuOpen ? "open" : ""}`}
            aria-label="Section menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <GitHubLink variant="header" />
        </div>
      </div>

      {menuOpen && (
        <nav className="topbar-menu" aria-label="Report sections">
          {NAV.map((s) => (
            <button
              key={s.id}
              type="button"
              className={active === s.id ? "active" : ""}
              onClick={() => go(s.id)}
            >
              {s.long}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
