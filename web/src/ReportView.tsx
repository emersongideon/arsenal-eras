import type { Dataset } from "./types";
import { GitHubLink } from "./components/ui";
import { Hero } from "./sections/Hero";
import { DataSources } from "./sections/DataSources";
import { SectionA } from "./sections/SectionA";
import { SectionB } from "./sections/SectionB";
import { SectionC } from "./sections/SectionC";
import { SectionD } from "./sections/SectionD";
import { Conclusion } from "./sections/Conclusion";

/** The story-driven read: a factual, journalistic walk through the two title runs.
 *  Section navigation lives in the persistent TopBar (rendered by App). */
export function ReportView({ data }: { data: Dataset }) {
  return (
    <>
      <Hero />
      <DataSources />
      <SectionA seasons={data.seasons} matches={data.matches} />
      <SectionB c={data.circumstances} />
      <SectionC p={data.physical} congestion={data.congestion} />
      <SectionD synthesisD={data.synthesisD} />
      <Conclusion />
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
