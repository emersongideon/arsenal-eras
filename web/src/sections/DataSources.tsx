import { content } from "../content";
import { Reveal, Section } from "../components/ui";

const t = content.data;

const ERAS = [
  ["2003/04", "s0304"],
  ["2025/26", "s2526"],
] as const;

/** Provenance up front, not buried in a footer: a scannable "what data, from
 *  where" list per era, and the two caveats that shape the comparison. */
export function DataSources() {
  return (
    <Section id="section-data" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid2" style={{ marginTop: 22 }}>
          {ERAS.map(([era, cls]) => (
            <div className={`card team-card ${cls}`} key={era}>
              <span className="season-tag">{era}</span>
              <div className="src-list">
                {t.sources[era].map(([what, from]) => (
                  <div className="src-row" key={what}>
                    <span className="src-what">{what}</span>
                    <span className="src-from">{from}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="caveats">
          {t.caveats.map((c, i) => (
            <div className="caveat" key={i}>
              <p className="caveat-title">
                <span className="caveat-num">{i + 1}</span>
                {c.title}
              </p>
              <p className="caveat-body">{c.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
