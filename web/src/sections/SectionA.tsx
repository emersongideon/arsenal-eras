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
          The Invincibles finished on <b>{s0.points} points with no defeats</b>, a +
          {s0.goal_difference} goal difference and {s0.ppg.toFixed(2)} points per game.
          The 2025/26 side won the title on{" "}
          <b>
            {s1.points} points with {s1.losses} losses
          </b>
          . On the table, 2003/04 is the more dominant season. The report tests how hard
          each total was to earn.
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
            Cumulative league points across all 38 matches. The 2003/04 line never turns
            down - the Invincibles dropped points but never lost.
          </p>
          <CumulativePointsChart matches={matches} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card">
          <p className="chart-title">Attack and defence: goals vs expected goals</p>
          <p className="chart-sub">
            Season totals. 2003/04 out-scored its xG (73 goals from {s0.xg_for}); 2025/26
            under-scored its xG (71 from {s1.xg_for}) but conceded fewer than expected.
          </p>
          <OutputBars seasons={seasons} />
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          The table says 2003/04 was more dominant. It does not say how hard the league
          was to win. That starts with the rest of the field. ↓
        </p>
      </Reveal>
    </Section>
  );
}
