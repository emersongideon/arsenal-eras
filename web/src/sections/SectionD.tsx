import { ExpectedPointsChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { ModelResult, Physical, Season, Synthesis } from "../types";

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

  const rows: { label: string; a: string; b: string }[] = [
    {
      label: "Points over the model's expectation",
      a: `+${s["2003/04"].points_over_expected}`,
      b: `+${s["2025/26"].points_over_expected}`,
    },
    {
      label: "Winning margin over 2nd",
      a: `${s["2003/04"].margin_to_second} pts`,
      b: `${s["2025/26"].margin_to_second} pts`,
    },
    {
      label: "Title-race pressure index",
      a: `${s["2003/04"].pressure_index}`,
      b: `${s["2025/26"].pressure_index}`,
    },
    {
      label: "Squad retained from prior year",
      a: `${s["2003/04"].retention_pct}%`,
      b: `${s["2025/26"].retention_pct}%`,
    },
    {
      label: "Games played (all competitions)",
      a: `${fc["2003/04"].total_games}`,
      b: `${fc["2025/26"].total_games}`,
    },
    {
      label: "Short-rest games (three days or fewer)",
      a: `${fc["2003/04"].short_rest_count}`,
      b: `${fc["2025/26"].short_rest_count}`,
    },
  ];

  return (
    <Section id="synthesis" eyebrow="Section D · Performance against task">
      <Reveal>
        <h2>Reading the model output against the field</h2>
        <p className="lead narrow">
          The Poisson expected-points model, fit on each season's shots, says how many
          points the underlying performances deserved. Both sides beat it, the signature
          of a champion who wins tight games. But over-performance means more against a
          harder field, so the two are read together, not in isolation.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ margin: "22px 0" }}>
          <div className="sublayer-head">
            <p className="chart-title" style={{ margin: 0 }}>
              Actual points vs model-expected points
            </p>
            <CategoryBadge category="model" />
          </div>
          <p className="chart-sub">Grey = points deserved; colour = points won.</p>
          <ExpectedPointsChart model={model} />
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow">
          2003/04 beat its expected points by <b>+{s["2003/04"].points_over_expected}</b>;
          2025/26 by <b>+{s["2025/26"].points_over_expected}</b>. Set against the two
          sections above: the Invincibles over-performed by more, from a settled, older
          squad, against a field that never closed in, across a lighter calendar. The
          2025/26 side over-performed by less, but against a closer rival, with a smaller
          margin, a heavily rebuilt squad, and a more congested season. Same headline,
          champions who beat their xG, different tasks underneath.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="tbl-wrap" style={{ marginTop: 10 }}>
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
          <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
            All figures from the sections above.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">What the whole picture surfaces. ↓</p>
      </Reveal>
    </Section>
  );
}
