import { CumulativePointsChart, OutputBars } from "../components/charts";
import { InfoTip, Reveal, Section, seasonClass } from "../components/ui";
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
    <Section id="section-a" eyebrow="Section A · The surface">
      <Reveal>
        <h2>What the table already tells us</h2>
        <p className="lead narrow">
          The Invincibles finished on <b>{s0.points} points unbeaten</b>, plus{" "}
          {s0.goal_difference} goal difference, {s0.ppg.toFixed(2)} points per game. The
          2025/26 team won the title on <b>{s1.points} points</b>, {s1.wins} wins and{" "}
          {s1.losses} losses, plus {s1.goal_difference}, {s1.ppg.toFixed(2)} per game. By
          numbers alone, 2003/04 is the more dominant season.
        </p>
        <p className="narrow">What if we considered how hard each total was to earn?</p>
      </Reveal>

      <Reveal delay={100}>
        <div className="grid2" style={{ margin: "22px 0" }}>
          <TeamCard s={s0} />
          <TeamCard s={s1} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ marginBottom: 18 }}>
          <p className="chart-title">The title race, week by week</p>
          <p className="chart-sub">
            Cumulative league points earned by Arsenal across all 38 matches, 2003/04 vs
            2025/26. The 2003/04 line never flattens into a defeat: the Invincibles dropped
            points to draws but never lost. The 2025/26 side lost {s1.losses} times, the
            flat single-match steps in its line.
          </p>
          <CumulativePointsChart matches={matches} />
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow" style={{ marginBottom: 22 }}>
          Those {s1.losses} defeats are the first hint that 2025/26 was pushed harder week
          to week, which Section B examines directly by measuring how strong the chasing
          pack was.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card">
          <div className="chart-head-row">
            <p className="chart-title" style={{ margin: 0 }}>
              Attack and defence: goals vs expected goals
            </p>
            <InfoTip label="What these terms mean">
              <b>Goals for</b> = goals Arsenal actually scored. <b>Goals against</b> ={" "}
              goals Arsenal actually conceded. <b>xG for</b> = expected goals, the
              quality-weighted total of the chances Arsenal created (how many they should
              have scored). <b>xG against</b> = the same for chances they allowed (how many
              they should have conceded).
            </InfoTip>
          </div>
          <p className="chart-sub">
            Season totals for both ends of the pitch, grouped by season and labelled with
            their values.
          </p>
          <OutputBars seasons={seasons} />
          <p className="chart-note">
            2003/04 scored more than its xG (strong finishing), while 2025/26 scored fewer
            than its high xG but conceded fewer than expected (a defensively efficient
            title).
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="forces">
          <h3 className="forces-h">How hard was each title to win?</h3>
          <p className="forces-lead narrow">
            The table tells us how dominant each season was, not how hard it was to win.
            Those are different questions. How hard a title is to win comes down to two
            forces: the resistance from outside, meaning how strong the rest of the league
            was, and the strain from inside, meaning how settled the squad was and how much
            physical load it carried. The rest of this report measures each force in turn,
            then combines them.
          </p>

          <div className="forces-diagram">
            <div className="forces-inputs">
              <div className="force-box outside">
                <span className="force-tag">Outside</span>
                <p className="force-name">The field</p>
                <p className="force-desc">
                  How much resistance the rest of the league applied.
                </p>
              </div>
              <span className="forces-plus" aria-hidden="true">
                +
              </span>
              <div className="force-box inside">
                <span className="force-tag">Inside</span>
                <p className="force-name">The squad and body</p>
                <p className="force-desc">
                  How settled the squad was and how heavy the physical load it carried.
                </p>
              </div>
            </div>
            <div className="forces-down" aria-hidden="true">
              ↓
            </div>
            <div className="force-box outcome">
              <p className="force-name">How hard the title was to win</p>
            </div>
          </div>

          <p className="narrow dim handoff" style={{ marginTop: 24 }}>
            We start on the outside: how much resistance the league itself applied. ↓
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
