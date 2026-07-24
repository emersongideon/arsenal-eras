import { useEffect, useState } from "react";
import { loadDataset } from "./data";
import type { Dataset } from "./types";
import { Hero } from "./sections/Hero";
import { MeetTeams } from "./sections/MeetTeams";
import { Act1 } from "./sections/Act1";
import { Act2 } from "./sections/Act2";
import { Act3 } from "./sections/Act3";
import { Act4 } from "./sections/Act4";
import { Conclusion } from "./sections/Conclusion";
import { GitHubLink } from "./components/ui";

const SECTIONS = [
  ["hook", "Hook"],
  ["meet", "Teams"],
  ["act1", "Surface"],
  ["act2", "Model"],
  ["act3", "Era gap"],
  ["act4", "What if"],
  ["conclusion", "Verdict"],
] as const;

function NavDots() {
  const [active, setActive] = useState("hook");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { threshold: 0.5 }
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="nav-dots" aria-label="Section navigation">
      {SECTIONS.map(([id, label]) => (
        <button
          key={id}
          className={active === id ? "active" : ""}
          title={label}
          aria-label={label}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        />
      ))}
    </nav>
  );
}

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="section"><div className="wrap">Failed to load: {error}</div></div>;
  if (!data) return <div className="section"><div className="wrap dim">Loading the story...</div></div>;

  return (
    <>
      <GitHubLink variant="header" />
      <NavDots />
      <Hero meta={data.meta} />
      <MeetTeams seasons={data.seasons} />
      <Act1 matches={data.matches} seasons={data.seasons} />
      <Act2 model={data.model} />
      <Act3 era={data.era} />
      <Act4 spec={data.te} />
      <Conclusion model={data.model} />
      <footer>
        <div className="wrap">
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>{data.meta.title}</div>
          <div>
            <b>Data.</b> 2003/04: {data.meta.sources["2003/04"]} · 2025/26:{" "}
            {data.meta.sources["2025/26"]}
          </div>
          <div><b>Model.</b> {data.meta.model}</div>
          <div className="dim">{data.meta.honesty_note}</div>
          <div className="dim" style={{ marginTop: 8 }}>
            Every figure above is tagged{" "}
            <span style={{ color: "#7fd3c1" }}>fact</span> ·{" "}
            <span style={{ color: "#9ab4ff" }}>measured</span> ·{" "}
            <span style={{ color: "#e6a256" }}>speculative</span> and never blended.
          </div>
          <div style={{ marginTop: 14 }}>
            <GitHubLink variant="footer" />
          </div>
        </div>
      </footer>
    </>
  );
}
