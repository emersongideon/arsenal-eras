import { CategoryBadge, Reveal, Section } from "../components/ui";

/** Provenance up front, not buried in a footer: which source covers which era,
 *  and the one or two places a number is derived rather than read directly. */
export function DataSources() {
  return (
    <Section id="sources" eyebrow="Before we start · the data">
      <Reveal>
        <h2>Where every number comes from</h2>
        <div style={{ margin: "8px 0 18px" }}>
          <CategoryBadge category="fact" />
        </div>
        <p className="lead narrow">
          Two eras, two shot-data providers, plus public records for the league tables,
          squads and fixtures. We name every source up front - you should be able to check
          anything we show you.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid2" style={{ marginTop: 22 }}>
          <div className="card team-card s0304">
            <span className="rail" />
            <span className="season-tag">2003/04</span>
            <ul className="src-list">
              <li>
                <b>Shots &amp; xG:</b> StatsBomb Open Data (Arsenal's event-level shot
                data).
              </li>
              <li>
                <b>Final table, squads, fixtures:</b> Wikipedia season &amp; competition
                articles.
              </li>
              <li>
                <b>Minutes:</b> derived from StatsBomb lineup stints (90-min baseline).
              </li>
            </ul>
          </div>
          <div className="card team-card s2526">
            <span className="rail" />
            <span className="season-tag">2025/26</span>
            <ul className="src-list">
              <li>
                <b>Shots &amp; xG:</b> Understat (per-match xG and per-player totals).
              </li>
              <li>
                <b>Final table, squads, fixtures:</b> Wikipedia season &amp; competition
                articles.
              </li>
              <li>
                <b>Player ages:</b> birthdates from Wikipedia, weighted by minutes played.
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="method narrow" style={{ marginTop: 22 }}>
          <strong>Two honest caveats.</strong> The two seasons use{" "}
          <em>different xG models</em> (StatsBomb vs Understat), so xG is calibrated per
          season rather than compared directly. And{" "}
          <em>rival-team xG does not exist for 2003/04</em> (Understat only goes back to
          2014/15), so the chasing pack is compared on actual points - the same measure
          for both eras.
        </div>
      </Reveal>

      <Reveal delay={80}>
        <p className="narrow dim handoff">
          With the sources on the table, start where the raw numbers do: the surface. ↓
        </p>
      </Reveal>
    </Section>
  );
}
