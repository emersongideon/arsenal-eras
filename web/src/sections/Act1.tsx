import { CumulativePointsChart, OutputBars } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { MatchRow, SeasonSummary } from "../types";

export function Act1({
  matches,
  seasons,
}: {
  matches: MatchRow[];
  seasons: SeasonSummary[];
}) {
  return (
    <Section id="act1" eyebrow="Act 1 · The surface story">
      <Reveal>
        <h2>What each team did on paper</h2>
        <p className="lead narrow">
          Start with the uncontested facts: goals, expected goals, and how the points
          piled up week by week. Both teams scored freely and defended well. The
          Invincibles' line never dips - that flat, unbroken climb is the whole legend in
          one chart.
        </p>
        <div style={{ margin: "14px 0 26px" }}>
          <CategoryBadge category="fact" />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ marginBottom: 22 }}>
          <p className="chart-title">The title race, week by week</p>
          <p className="chart-sub">Cumulative league points across all 38 matches.</p>
          <CumulativePointsChart matches={matches} />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="chart-card">
          <p className="chart-title">Attack and defence: goals vs expected goals</p>
          <p className="chart-sub">
            Season totals. Note the tell: 2003/04 <em>out-scored</em> its xG (clinical
            finishing), while 2025/26 actually <em>under-scored</em> its xG yet conceded
            fewer than expected - a defence-and-margins title.
          </p>
          <OutputBars seasons={seasons} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <p className="narrow dim" style={{ marginTop: 26, fontStyle: "italic" }}>
          So far, only description. The interesting question isn't what they scored - it's
          how many points their underlying performances actually deserved. That needs a
          model. ↓
        </p>
      </Reveal>
    </Section>
  );
}
