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
    <Section id="section-e" eyebrow="Section E · What this surfaces">
      <Reveal>
        <h2>The finding, and where it goes next</h2>
        <p className="lead narrow">
          The two titles were won in opposite ways, against different challenges. That is
          the finding, and it comes from the measurements above, not from opinion.
        </p>
        <p className="narrow">
          2003/04 was the more dominant season on every raw and model measure: the bigger
          winning margin, the larger over-performance, and unbeaten across all{" "}
          {s0.played} games. 2025/26 was won against a closer rival and with a less settled
          squad. The data does not crown one task as harder than the other, and no single
          number should. What it does is break &lsquo;difficulty&rsquo; into parts that can
          each be measured and checked, so the judgement rests on evidence rather than
          memory.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="verdict" style={{ marginTop: 26 }}>
          <div className="col s0304">
            <h3 style={{ color: "#8a6610" }}>
              The case that 2003/04 faced the harder task
            </h3>
            <ul>
              <li>
                Went unbeaten across all {s0.played} games, which no side has managed
                since.
              </li>
              <li>
                Won by the bigger margin, {s["2003/04"].margin_to_second} points clear, and
                beat the model by more, at +{s["2003/04"].points_over_expected}.
              </li>
              <li>
                Did it with a settled squad, {s["2003/04"].retention_pct}% retained, and
                never lost a match all season.
              </li>
              <li>
                Scored more than its expected goals ({s0.goals_for} from{" "}
                {s0.xg_for.toFixed(1)}), so the finishing backed up the chances.
              </li>
            </ul>
          </div>
          <div className="col s2526">
            <h3 style={{ color: "#d90007" }}>
              The case that 2025/26 faced the harder task
            </h3>
            <ul>
              <li>
                Faced a closer field: {s["2025/26"].margin_to_second} points clear of a
                Manchester City side on {s["2025/26"].runner_up_points}, a pressure index
                of {s["2025/26"].pressure_index} against {s["2003/04"].pressure_index}.
              </li>
              <li>
                Won while rebuilding, with only {s["2025/26"].retention_pct}% of the squad
                retained and {s["2025/26"].incoming} new players to settle in.
              </li>
              <li>
                Carried a heavier, more compressed calendar ({fc["2025/26"].total_games}{" "}
                games, {fc["2025/26"].short_rest_count} short-rest turnarounds against{" "}
                {fc["2003/04"].total_games} and {fc["2003/04"].short_rest_count}) and,
                notably, absorbed it: its points-per-game did not drop in short-rest games,
                so the load was a condition it met rather than a cost it paid.
              </li>
              <li>
                Beat the model by +{s["2025/26"].points_over_expected} while under-shooting
                its xG, a title leaning more on defence.
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <p className="narrow" style={{ marginTop: 26 }}>
          <strong>What the whole picture surfaces.</strong> Difficulty is not one thing, so
          it does not reduce to one number. 2003/04 was the more dominant campaign; 2025/26
          was won in tighter, more crowded conditions and still held its level under a
          schedule that should have punished it. Which of those is the &lsquo;harder&rsquo;
          task depends on what you weigh, and the honest answer is that the data lays out
          the trade-off rather than settling it.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="method narrow" style={{ marginTop: 26 }}>
          <strong>Where this could go next.</strong> None of these measures are specific to
          Arsenal or to these two seasons. Applied across every past title race, the
          pressure index and the squad-stability measure would give a baseline for how hard
          any season was to win, which any team's campaign could be judged against. The same
          stability measure, pointed at a squad going into a new season, could help estimate
          how much a summer of heavy signings might cost in points before a new group
          settles. That is the natural next step: turning a look back at two seasons into a
          repeatable way to read the season ahead.
        </div>
      </Reveal>
    </Section>
  );
}
