import { CumulativePointsChart, OutputBars } from "../components/charts";
import { CategoryBadge, Reveal, Section, seasonClass } from "../components/ui";
import type { MatchRow, SeasonSummary } from "../types";

function TeamCard({ s }: { s: SeasonSummary }) {
  const cls = seasonClass(s.season);
  const rows: [string, string | number][] = [
    ["Record (W-D-L)", `${s.wins}-${s.draws}-${s.losses}`],
    ["Goals for / against", `${s.goals_for} / ${s.goals_against}`],
    ["Goal difference", (s.goal_difference > 0 ? "+" : "") + s.goal_difference],
    ["xG for / against", `${s.xg_for} / ${s.xg_against}`],
    ["Points per game", s.ppg.toFixed(2)],
  ];
  return (
    <div className={`card team-card ${cls}`}>
      <span className="rail" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="season-tag">{s.season}</span>
        {s.unbeaten && <span className="season-tag">UNBEATEN</span>}
      </div>
      <div className="big-num" style={{ margin: "6px 0 2px" }}>
        {s.points}
      </div>
      <div className="dim" style={{ marginBottom: 14, fontSize: 14 }}>
        league points
      </div>
      {rows.map(([k, v]) => (
        <div className="statline" key={k}>
          <span className="k">{k}</span>
          <span className="v">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionA({
  seasons,
  matches,
}: {
  seasons: SeasonSummary[];
  matches: MatchRow[];
}) {
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  return (
    <Section id="surface" eyebrow="Section A · The surface">
      <Reveal>
        <h2>What each side did on paper</h2>
        <div style={{ margin: "8px 0 16px" }}>
          <CategoryBadge category="fact" />
        </div>
        <p className="lead narrow">
          On the raw record the Invincibles were the more dominant campaign:{" "}
          <b>{s0.points} points and no defeats</b>, a +{s0.goal_difference} goal
          difference, {s0.ppg.toFixed(2)} points a game. The 2025/26 side won with{" "}
          <b>
            {s1.points} points and {s1.losses} losses
          </b>
          . That gap is the starting point, not the conclusion - the rest of the story
          asks how hard each total was to earn.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="grid2" style={{ margin: "22px 0" }}>
          <TeamCard s={s0} />
          <TeamCard s={s1} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ marginBottom: 22 }}>
          <p className="chart-title">The title race, week by week</p>
          <p className="chart-sub">
            Cumulative league points across all 38 matches. The Invincibles' line never
            dips - that flat, unbroken climb is the legend in one chart.
          </p>
          <CumulativePointsChart matches={matches} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card">
          <p className="chart-title">Attack and defence: goals vs expected goals</p>
          <p className="chart-sub">
            Season totals. A tell for later: 2003/04 <em>out-scored</em> its xG (clinical
            finishing), while 2025/26 actually <em>under-scored</em> its xG yet conceded
            fewer than expected - a defence-and-margins title.
          </p>
          <OutputBars seasons={seasons} />
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          So the surface says: more dominant in 2003/04. But a table doesn't tell you how
          hard the league was to win. That is the real question - and it starts with who
          else was in the race. ↓
        </p>
      </Reveal>
    </Section>
  );
}
