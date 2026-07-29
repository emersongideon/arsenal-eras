import { content } from "../content";
import { Reveal, Section } from "../components/ui";

const t = content.data;

/** Provenance up front, not buried in a footer: which source covers which era,
 *  and the two deliberate choices that shape the comparison. */
export function DataSources() {
  return (
    <Section id="section-data" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid2" style={{ marginTop: 22 }}>
          <div className="card team-card s0304">
            <span className="rail" />
            <span className="season-tag">2003/04</span>
            <p style={{ margin: "10px 0 0" }}>{t.src0304}</p>
          </div>
          <div className="card team-card s2526">
            <span className="rail" />
            <span className="season-tag">2025/26</span>
            <p style={{ margin: "10px 0 0" }}>{t.src2526}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="method narrow" style={{ marginTop: 22 }}>
          {t.choices}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <p className="narrow dim handoff">{t.handoff}</p>
      </Reveal>
    </Section>
  );
}
