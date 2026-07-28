import { useEffect, useState } from "react";
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
  ["congestion", "Congestion"],
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

/** The story-driven read: a factual, journalistic walk through the two title runs. */
export function ReportView({ data }: { data: Dataset }) {
  return (
    <>
      <NavDots />
      <Hero meta={data.meta} />
      <DataSources />
      <SectionA seasons={data.seasons} matches={data.matches} />
      <SectionB c={data.circumstances} />
      <SectionC p={data.physical} />
      <SectionD congestion={data.congestion} />
      <Conclusion
        synth={data.synthesis}
        physical={data.physical}
        seasons={data.seasons}
      />
      <footer>
        <div className="wrap">
          <div>
            <b>Data.</b> 2003/04: {data.meta.sources["2003/04"]} 2025/26:{" "}
            {data.meta.sources["2025/26"]}
          </div>
          <div>
            <b>Model.</b> {data.meta.model}
          </div>
          <div className="dim">{data.meta.honesty_note}</div>
          <div style={{ marginTop: 14 }}>
            <GitHubLink variant="footer" />
          </div>
        </div>
      </footer>
    </>
  );
}
