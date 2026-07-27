import { useEffect, useState } from "react";
import { loadDataset } from "./data";
import type { Dataset } from "./types";
import { GitHubLink } from "./components/ui";
import { Hero } from "./sections/Hero";
import { DataSources } from "./sections/DataSources";
import { SectionA } from "./sections/SectionA";
import { SectionB } from "./sections/SectionB";
import { SectionC } from "./sections/SectionC";
import { SectionD } from "./sections/SectionD";
import { Conclusion } from "./sections/Conclusion";

const SECTIONS = [
  ["hook", "Hook"],
  ["sources", "Data"],
  ["surface", "Surface"],
  ["circumstances", "Circumstances"],
  ["physical", "Physical"],
  ["synthesis", "Synthesis"],
  ["verdict", "Verdict"],
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
          onClick={() =>
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
          }
        />
      ))}
    </nav>
  );
}

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error)
    return (
      <div className="section">
        <div className="wrap">Failed to load: {error}</div>
      </div>
    );
  if (!data)
    return (
      <div className="section">
        <div className="wrap dim">Loading the story...</div>
      </div>
    );

  return (
    <>
      <GitHubLink variant="header" />
      <NavDots />
      <Hero meta={data.meta} />
      <DataSources />
      <SectionA seasons={data.seasons} matches={data.matches} />
      <SectionB c={data.circumstances} />
      <SectionC p={data.physical} />
      <SectionD model={data.model} synth={data.synthesis} physical={data.physical} />
      <Conclusion synth={data.synthesis} physical={data.physical} />
      <footer>
        <div className="wrap">
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {data.meta.title}
          </div>
          <div>
            <b>Data.</b> 2003/04: {data.meta.sources["2003/04"]} &nbsp;·&nbsp; 2025/26:{" "}
            {data.meta.sources["2025/26"]}
          </div>
          <div>
            <b>Model.</b> {data.meta.model}
          </div>
          <div className="dim">{data.meta.honesty_note}</div>
          <div className="dim" style={{ marginTop: 8 }}>
            Every figure above is tagged <span style={{ color: "#7fd3c1" }}>fact</span> ·{" "}
            <span style={{ color: "#9ab4ff" }}>measured</span> ·{" "}
            <span style={{ color: "#e6a256" }}>interpretation</span> and never blended.
          </div>
          <div style={{ marginTop: 14 }}>
            <GitHubLink variant="footer" />
          </div>
        </div>
      </footer>
    </>
  );
}
