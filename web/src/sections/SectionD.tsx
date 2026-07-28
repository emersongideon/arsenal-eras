import { CongestionPpgChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { Congestion } from "../types";

export function SectionD({ congestion }: { congestion: Congestion }) {
  const c = congestion.by_season;
  const s0 = c["2003/04"];
  const s1 = c["2025/26"];

  return (
    <Section id="section-d" eyebrow="Section D · Performance under congestion">
      <Reveal>
        <h2>Did the compressed schedule cost points?</h2>
        <p className="lead narrow">
          Section C showed the 2025/26 side carried a more compressed schedule, with far
          more short-rest games. The obvious next question is whether that actually cost
          them: did either side drop more points when it played on short rest than when it
          was well rested? We take the same rest-gaps from the fixture data and line them
          up against the points won in each game.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ margin: "22px 0" }}>
          <div className="sublayer-head">
            <p className="chart-title" style={{ margin: 0 }}>
              League points per game, by rest before the match
            </p>
            <CategoryBadge category="measured" />
          </div>
          <p className="chart-sub">
            Points per game over the 38 league matches each season, split by the rest
            before each game (measured across all competitions). Dashed lines mark each
            season's overall PPG. Sample sizes are shown on the bars.
          </p>
          <CongestionPpgChart bySeason={c} />
          <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
            Short-rest games: 2003/04 n={s0.buckets.short.games}, 2025/26 n=
            {s1.buckets.short.games}. Normal-rest: n={s0.buckets.normal.games} and n=
            {s1.buckets.normal.games}. The short-rest buckets are small, so treat the
            per-bucket figures as indicative rather than decisive.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">What the whole picture surfaces. ↓</p>
      </Reveal>
    </Section>
  );
}
