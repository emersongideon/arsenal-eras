import { ExpectedPointsChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { Physical, Season, Synthesis } from "../types";
import type { ModelResult } from "../types";

export function SectionD({
  model,
  synth,
  physical,
}: {
  model: Record<Season, ModelResult>;
  synth: Synthesis;
  physical: Physical;
}) {
  const s = synth.by_season;
  const fc = physical.fixture_congestion.by_season;

  const rows: { label: string; a: string; b: string; note: string }[] = [
    {
      label: "Points over the model's expectation",
      a: `+${s["2003/04"].points_over_expected}`,
      b: `+${s["2025/26"].points_over_expected}`,
      note: "measured",
    },
    {
      label: "Winning margin over 2nd",
      a: `${s["2003/04"].margin_to_second} pts`,
      b: `${s["2025/26"].margin_to_second} pts`,
      note: "fact",
    },
    {
      label: "Title-race pressure index",
      a: `${s["2003/04"].pressure_index}`,
      b: `${s["2025/26"].pressure_index}`,
      note: "measured",
    },
    {
      label: "Squad retained from prior year",
      a: `${s["2003/04"].retention_pct}%`,
      b: `${s["2025/26"].retention_pct}%`,
      note: "fact",
    },
    {
      label: "Games played (all comps)",
      a: `${fc["2003/04"].total_games}`,
      b: `${fc["2025/26"].total_games}`,
      note: "fact",
    },
    {
      label: "Short-rest games (≤3 days)",
      a: `${fc["2003/04"].short_rest_count}`,
      b: `${fc["2025/26"].short_rest_count}`,
      note: "fact",
    },
  ];

  return (
    <Section id="synthesis" eyebrow="Section D · So who met the harder task?">
      <Reveal>
        <h2>Beating the model, against different fields</h2>
        <div style={{ margin: "8px 0 16px" }}>
          <CategoryBadge category="measured" />
        </div>
        <p className="lead narrow">
          The expected-points model (a Poisson model fit on each season's shots) says how
          many points the underlying performances deserved. Both sides beat it - the mark
          of a champion who wins tight games. But "beating your xG" means more against a
          harder field, so we read the over-performance next to the circumstances.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ margin: "22px 0" }}>
          <p className="chart-title">Actual points vs model-expected points</p>
          <p className="chart-sub">
            Grey = what the chances deserved; colour = what they actually won. 2003/04
            beat its expectation by {s["2003/04"].points_over_expected}; 2025/26 by{" "}
            {s["2025/26"].points_over_expected}.
          </p>
          <ExpectedPointsChart model={model} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="tbl-wrap">
          <table className="synth-table">
            <thead>
              <tr>
                <th>The task, layer by layer</th>
                <th className="s0304">2003/04</th>
                <th className="s2526">2025/26</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="ta-c">{r.a}</td>
                  <td className="ta-c">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="reading narrow" style={{ marginTop: 22 }}>
          <CategoryBadge category="interpretation" />
          <p style={{ margin: "8px 0 0" }}>
            Both beat the model, by similar margins. The Invincibles over-performed by
            more, from a settled, experienced squad, against a field that never closed in.
            The 2025/26 side over-performed by less, but against a closer rival, with a
            smaller margin, a heavily rebuilt squad, and more games. Same headline -
            champions who beat their xG - different tasks underneath.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          Which of those is the "harder" task? That depends on what you weigh most - so
          here's the honest verdict, both ways. ↓
        </p>
      </Reveal>
    </Section>
  );
}
