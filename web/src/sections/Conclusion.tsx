import { Reveal, Section } from "../components/ui";
import type { Physical, Synthesis } from "../types";

export function Conclusion({
  synth,
  physical,
}: {
  synth: Synthesis;
  physical: Physical;
}) {
  const s = synth.by_season;
  const fc = physical.fixture_congestion.by_season;
  return (
    <Section id="verdict" eyebrow="Section E · So, which task was harder?">
      <Reveal>
        <h2>It depends on what you weigh - and now the evidence is on the table</h2>
        <p className="lead narrow">
          The data doesn't crown a winner, and it would be dishonest to pretend it does.
          Here's the fair version of each case, built from the sections above.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="verdict" style={{ marginTop: 26 }}>
          <div className="col s0304">
            <h3 style={{ color: "#8a6610" }}>The case for 2003/04</h3>
            <ul>
              <li>
                <b>Unbeaten.</b> The hardest thing in football is to never lose across 38
                games - nobody has done it since.
              </li>
              <li>
                <b>The bigger cushion:</b> {s["2003/04"].margin_to_second} points clear,
                and it beat the model by <b>+{s["2003/04"].points_over_expected}</b> - the
                larger over-performance of the two.
              </li>
              <li>
                <b>Settled squad:</b> {s["2003/04"].retention_pct}% retained from the year
                before, and it stayed unbeaten across all 38 games.
              </li>
              <li>
                Out-scored its xG (73 goals from 60.9) - finishing, not just volume.
              </li>
            </ul>
          </div>
          <div className="col s2526">
            <h3 style={{ color: "#d90007" }}>The case for 2025/26</h3>
            <ul>
              <li>
                <b>A closer field:</b> won by {s["2025/26"].margin_to_second} points over
                a Manchester City side on {s["2025/26"].runner_up_points} pts - a pressure
                index of {s["2025/26"].pressure_index} against the Invincibles'{" "}
                {s["2003/04"].pressure_index}.
              </li>
              <li>
                <b>Won while rebuilding:</b> {s["2025/26"].retention_pct}% of the squad
                retained, {s["2025/26"].incoming} new PL players to integrate.
              </li>
              <li>
                <b>A heavier calendar:</b> {fc["2025/26"].total_games} games and{" "}
                {fc["2025/26"].short_rest_count} short-rest turnarounds, against{" "}
                {fc["2003/04"].total_games} and {fc["2003/04"].short_rest_count} in
                2003/04.
              </li>
              <li>
                Beat the model by +{s["2025/26"].points_over_expected} while
                under-shooting its xG - a title built on defence.
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="narrow" style={{ marginTop: 30 }}>
          <p>
            <b>The bottom line.</b> If "harder" means sustained perfection, 2003/04 wins:
            no side has gone unbeaten since, and it was the more dominant season on the
            table. If "harder" means the conditions the 85 points were won in - a closer
            rival, a smaller margin, a rebuilt squad, a heavier calendar - then 2025/26
            met a task the 2003/04 side did not face.
          </p>
          <p className="dim">
            What the data settles: both beat their expected points, by similar margins, by
            opposite methods and against different obstacles. Which task was harder is a
            judgement call, and the numbers don't make it for you.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
