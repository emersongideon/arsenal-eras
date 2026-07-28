import { Reveal, Section } from "../components/ui";
import type { Physical, SeasonSummary, Synthesis } from "../types";

export function Conclusion({
  synth,
  physical,
  seasons,
}: {
  synth: Synthesis;
  physical: Physical;
  seasons: SeasonSummary[];
}) {
  const s = synth.by_season;
  const fc = physical.fixture_congestion.by_season;
  const s0 = seasons.find((x) => x.season === "2003/04")!;

  return (
    <Section id="verdict" eyebrow="Section E · What this surfaces">
      <Reveal>
        <h2>The finding, and where it goes next</h2>
        <p className="lead narrow">
          The two titles were won by opposite methods against different obstacles. That is
          the finding, and it is a statement the data supports directly, not a matter of
          opinion.
        </p>
        <p className="narrow">
          2003/04 is the more dominant campaign on every raw and model measure: the larger
          margin, the bigger over-performance, unbeaten across 38 games. 2025/26 was won
          against a closer field, with a less settled squad, across a heavier calendar.
          The data does not rank one task above the other, and no single number should
          claim to. What it does is break "difficulty" into measurable parts, each sourced
          and checkable, so the judgement is made on evidence rather than memory.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="verdict" style={{ marginTop: 26 }}>
          <div className="col s0304">
            <h3 style={{ color: "#8a6610" }}>
              The case that 2003/04 faced the harder task
            </h3>
            <ul>
              <li>Unbeaten across 38 games, something no side has done since.</li>
              <li>
                The larger cushion: {s["2003/04"].margin_to_second} points clear, and the
                bigger over-performance at +{s["2003/04"].points_over_expected}.
              </li>
              <li>
                Won with a settled squad, {s["2003/04"].retention_pct}% retained, and
                stayed unbeaten the whole way.
              </li>
              <li>
                Out-scored its xG ({s0.goals_for} goals from {s0.xg_for.toFixed(1)}), a
                finishing edge on top of volume.
              </li>
            </ul>
          </div>
          <div className="col s2526">
            <h3 style={{ color: "#d90007" }}>
              The case that 2025/26 faced the harder task
            </h3>
            <ul>
              <li>
                A closer field: won by {s["2025/26"].margin_to_second} points over a
                Manchester City side on {s["2025/26"].runner_up_points}, a pressure index
                of {s["2025/26"].pressure_index} against the Invincibles'{" "}
                {s["2003/04"].pressure_index}.
              </li>
              <li>
                Won while rebuilding: {s["2025/26"].retention_pct}% of the squad retained,{" "}
                {s["2025/26"].incoming} new league players to integrate.
              </li>
              <li>
                A heavier calendar: {fc["2025/26"].total_games} games and{" "}
                {fc["2025/26"].short_rest_count} short-rest turnarounds, against{" "}
                {fc["2003/04"].total_games} and {fc["2003/04"].short_rest_count}.
              </li>
              <li>
                Beat the model by +{s["2025/26"].points_over_expected} while
                under-shooting its xG, a title built more on defence.
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="method narrow" style={{ marginTop: 30 }}>
          <strong>Where this goes next, if it were live work.</strong> The pressure index
          and continuity measures are not Arsenal-specific. Run across every title race,
          they would give a season-difficulty baseline to judge any campaign against, ours
          or a rival's. The same squad-continuity read applied forward is an input into
          projecting how much a summer rebuild is likely to cost in points. That is the
          direction I would take it: from a retrospective on two seasons to a repeatable
          tool for characterising the season ahead.
        </div>
      </Reveal>
    </Section>
  );
}
