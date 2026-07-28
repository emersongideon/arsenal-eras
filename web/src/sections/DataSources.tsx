import { Reveal, Section } from "../components/ui";

/** Provenance up front, not buried in a footer: which source covers which era,
 *  and the two deliberate choices that shape the comparison. */
export function DataSources() {
  return (
    <Section id="sources" eyebrow="Before we start · the data">
      <Reveal>
        <h2>Where every number comes from</h2>
        <p className="lead narrow">
          This dashboard is built entirely from public records: shot-level event data,
          league tables, squads and fixtures. Every source is named here so any figure can
          be checked or rebuilt.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid2" style={{ marginTop: 22 }}>
          <div className="card team-card s0304">
            <span className="rail" />
            <span className="season-tag">2003/04</span>
            <p style={{ margin: "10px 0 0" }}>
              Shots and xG from StatsBomb Open Data (Arsenal event-level); tables, squads
              and fixtures from public season records; minutes derived from lineup stints
              on a 90-minute baseline. Prior-season (2002/03) minutes, used only for the
              squad-departure figure, come from FBref&rsquo;s Standard Stats read via an
              Internet Archive snapshot.
            </p>
          </div>
          <div className="card team-card s2526">
            <span className="rail" />
            <span className="season-tag">2025/26</span>
            <p style={{ margin: "10px 0 0" }}>
              Shots and xG from Understat (per-match and per-player); tables, squads and
              fixtures from public records; player ages from birthdates, weighted by
              minutes. Prior-season (2024/25) minutes for the squad-departure figure also
              from Understat.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="method narrow" style={{ marginTop: 22 }}>
          Two deliberate choices shape the comparison. The seasons use different xG
          models, so xG is read within each season rather than across them. And rival-team
          xG is not available for 2003/04, so the chasing pack is measured on actual
          points, the same basis in both eras.
        </div>
      </Reveal>

      <Reveal delay={80}>
        <p className="narrow dim handoff">With the sources named, the surface. ↓</p>
      </Reveal>
    </Section>
  );
}
