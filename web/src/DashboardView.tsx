import type { Dataset } from "./types";
import {
  CumulativePointsChart,
  ExpectedPointsChart,
  FieldPressureChart,
  FixtureCongestionChart,
  MatchXgScatter,
  OutputBars,
  SquadAgeChart,
  SquadContinuityChart,
} from "./components/charts";
type Row = { label: string; a: string | number; b: string | number; hi?: boolean };

function Panel({
  title,
  sub,
  wide,
  children,
}: {
  title: string;
  sub?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`dash-panel ${wide ? "wide" : ""}`}>
      <p className="chart-title">{title}</p>
      {sub && <p className="chart-sub">{sub}</p>}
      {children}
    </section>
  );
}

function CmpTable({ rows }: { rows: Row[] }) {
  return (
    <div className="tbl-wrap">
      <table className="cmp-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th className="s0304">2003/04</th>
            <th className="s2526">2025/26</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={r.hi ? "hi" : ""}>
              <td>{r.label}</td>
              <td className="ta-c">{r.a}</td>
              <td className="ta-c">{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardView({ data }: { data: Dataset }) {
  const { seasons, matches, model, circumstances, physical, synthesis } = data;
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  const m0 = model["2003/04"];
  const m1 = model["2025/26"];
  const f = circumstances.field_strength.by_season;
  const ct = circumstances.squad_continuity.by_season;
  const age = physical.squad_age.by_season;
  const fc = physical.fixture_congestion.by_season;
  const pct = (x: number) => `${Math.round(x * 100)}%`;

  const table: Row[] = [
    { label: "League points", a: s0.points, b: s1.points, hi: true },
    {
      label: "Record (W-D-L)",
      a: `${s0.wins}-${s0.draws}-${s0.losses}`,
      b: `${s1.wins}-${s1.draws}-${s1.losses}`,
    },
    { label: "Points per game", a: s0.ppg.toFixed(2), b: s1.ppg.toFixed(2) },
    { label: "Unbeaten", a: s0.unbeaten ? "yes" : "no", b: s1.unbeaten ? "yes" : "no" },
    { label: "Goals for", a: s0.goals_for, b: s1.goals_for },
    { label: "Goals against", a: s0.goals_against, b: s1.goals_against },
    {
      label: "Goal difference",
      a: `+${s0.goal_difference}`,
      b: `+${s1.goal_difference}`,
    },
    { label: "xG for", a: s0.xg_for, b: s1.xg_for },
    { label: "xG against", a: s0.xg_against, b: s1.xg_against },
    {
      label: "Finishing (goals - xG)",
      a: `+${s0.goals_minus_xg_for}`,
      b: s1.goals_minus_xg_for,
    },
    {
      label: "Expected points (model)",
      a: m0.expected_points,
      b: m1.expected_points,
      hi: true,
    },
    {
      label: "Points over expected",
      a: `+${m0.points_over_expected}`,
      b: `+${m1.points_over_expected}`,
    },
    {
      label: "Runner-up points",
      a: f["2003/04"].runner_up_points,
      b: f["2025/26"].runner_up_points,
    },
    {
      label: "Margin to 2nd",
      a: `${f["2003/04"].margin} pts`,
      b: `${f["2025/26"].margin} pts`,
    },
    {
      label: "Title-race pressure index",
      a: f["2003/04"].pressure_index,
      b: f["2025/26"].pressure_index,
      hi: true,
    },
    {
      label: "Teams within 10 pts",
      a: f["2003/04"].teams_within_10,
      b: f["2025/26"].teams_within_10,
    },
    {
      label: "Squad size (PL)",
      a: ct["2003/04"].squad_size,
      b: ct["2025/26"].squad_size,
    },
    {
      label: "Retained from prior season",
      a: ct["2003/04"].retained,
      b: ct["2025/26"].retained,
    },
    { label: "New in", a: ct["2003/04"].incoming, b: ct["2025/26"].incoming },
    {
      label: "Squad retention",
      a: `${ct["2003/04"].retention_pct}%`,
      b: `${ct["2025/26"].retention_pct}%`,
      hi: true,
    },
    {
      label: "Minutes-weighted age",
      a: age["2003/04"].minutes_weighted_age,
      b: age["2025/26"].minutes_weighted_age,
    },
    {
      label: "Minutes to over-30s",
      a: pct(age["2003/04"].over30_minutes_share),
      b: pct(age["2025/26"].over30_minutes_share),
    },
    {
      label: "Competitive games",
      a: fc["2003/04"].total_games,
      b: fc["2025/26"].total_games,
    },
    {
      label: "Short-rest games (<=3d)",
      a: fc["2003/04"].short_rest_count,
      b: fc["2025/26"].short_rest_count,
      hi: true,
    },
    {
      label: "Shortest rest (days)",
      a: fc["2003/04"].min_rest_days,
      b: fc["2025/26"].min_rest_days,
    },
  ];

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <h1>Arsenal 2003/04 vs 2025/26 - metrics dashboard</h1>
          <p className="dim">
            Every measured metric, side by side. 2003/04 from StatsBomb, 2025/26 from
            Understat; tables and squads from public records.
          </p>
        </div>
      </header>

      <Panel
        title="Head-to-head"
        sub="Highlighted rows are the headline comparisons."
        wide
      >
        <CmpTable rows={table} />
      </Panel>

      <div className="dash-grid">
        <Panel title="Title race" sub="Cumulative league points across 38 matches.">
          <CumulativePointsChart matches={matches} />
        </Panel>
        <Panel title="Goals vs expected goals" sub="Season totals, both ends.">
          <OutputBars seasons={seasons} />
        </Panel>
        <Panel
          title="Actual vs model-expected points"
          sub="Grey = deserved; colour = won."
        >
          <ExpectedPointsChart model={model} />
        </Panel>
        <Panel
          title="Title-race pressure by rival"
          sub="exp(-gap/10) per finishing position; higher = harder field."
        >
          <FieldPressureChart bySeason={f} />
        </Panel>
        <Panel title="Squad continuity" sub="Retained vs newly-arrived PL players.">
          <SquadContinuityChart bySeason={ct} />
        </Panel>
        <Panel
          title="Minutes-weighted squad age"
          sub="Weighted by league minutes played."
        >
          <SquadAgeChart bySeason={age} />
        </Panel>
        <Panel title="Fixture congestion" sub="Games per month, all competitions.">
          <FixtureCongestionChart bySeason={fc} />
        </Panel>
        <Panel
          title="Per-match xG - 2003/04"
          sub="xG created vs conceded, coloured by result."
        >
          <MatchXgScatter res={m0} />
        </Panel>
        <Panel
          title="Per-match xG - 2025/26"
          sub="xG created vs conceded, coloured by result."
        >
          <MatchXgScatter res={m1} />
        </Panel>
      </div>

      <Panel
        title="Synthesis"
        sub="The model output re-read against the field and squad."
        wide
      >
        <CmpTable
          rows={[
            {
              label: "Points over expectation",
              a: `+${synthesis.by_season["2003/04"].points_over_expected}`,
              b: `+${synthesis.by_season["2025/26"].points_over_expected}`,
            },
            {
              label: "Winning margin",
              a: `${synthesis.by_season["2003/04"].margin_to_second} pts`,
              b: `${synthesis.by_season["2025/26"].margin_to_second} pts`,
            },
            {
              label: "Pressure index",
              a: synthesis.by_season["2003/04"].pressure_index,
              b: synthesis.by_season["2025/26"].pressure_index,
            },
            {
              label: "Squad retention",
              a: `${synthesis.by_season["2003/04"].retention_pct}%`,
              b: `${synthesis.by_season["2025/26"].retention_pct}%`,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
