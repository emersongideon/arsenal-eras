import { FixtureCongestionChart, SquadAgeChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { Physical } from "../types";

function Reading({ children }: { children: React.ReactNode }) {
  return (
    <div className="reading">
      <CategoryBadge category="interpretation" />
      <p style={{ margin: "8px 0 0" }}>{children}</p>
    </div>
  );
}

export function SectionC({ p }: { p: Physical }) {
  const age = p.squad_age.by_season;
  const fc = p.fixture_congestion.by_season;
  return (
    <Section
      id="physical"
      eyebrow="Section C · The physical toll"
      style={{
        background: "#eef1f6",
        borderTop: "1px solid #dfe3ea",
        borderBottom: "1px solid #dfe3ea",
      }}
    >
      <Reveal>
        <h2>Squad age and the calendar</h2>
        <p className="lead narrow">
          Two physical measures exist cleanly for both eras: the age of the team that
          played, and the fixture load it carried. That's all this section uses - see the
          note at the end for what it leaves out, and why.
        </p>
      </Reveal>

      {/* C1 - squad age */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>1. Squad age, weighted by minutes played</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Weighting by minutes answers "how old was the team that actually played", not
            the flat roster average. The Invincibles were a{" "}
            <b>{age["2003/04"].minutes_weighted_age}</b>-year-old side with{" "}
            {Math.round(age["2003/04"].over30_minutes_share * 100)}% of minutes given to
            players 30 or over. The 2025/26 side was younger at{" "}
            <b>{age["2025/26"].minutes_weighted_age}</b>, with only{" "}
            {Math.round(age["2025/26"].over30_minutes_share * 100)}% over-30 minutes.
          </p>
          <SquadAgeChart bySeason={age} />
          <Reading>
            The Invincibles were the older, more experienced side; 2025/26 was younger and
            gave far fewer minutes to over-30s. A different profile, not a harder one on
            its own.
          </Reading>
        </div>
      </Reveal>

      {/* C2 - fixture congestion */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. Fixture congestion, all competitions</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Computed from every competitive match date. The 2025/26 side played{" "}
            <b>{fc["2025/26"].total_games} games</b> to the Invincibles'{" "}
            <b>{fc["2003/04"].total_games}</b>, and hit{" "}
            <b>{fc["2025/26"].short_rest_count}</b> quick turnarounds (three days' rest or
            fewer) versus <b>{fc["2003/04"].short_rest_count}</b> - a far more compressed
            calendar, driven by the expanded Champions League.
          </p>
          <FixtureCongestionChart bySeason={fc} />
          <div className="stat-row">
            <div className="mini-stat s0304">
              <span className="mini-tag">2003/04</span>
              {fc["2003/04"].total_games} games · {fc["2003/04"].short_rest_count} short
              rests · busiest {fc["2003/04"].busiest_month} (
              {fc["2003/04"].busiest_month_games})
            </div>
            <div className="mini-stat s2526">
              <span className="mini-tag">2025/26</span>
              {fc["2025/26"].total_games} games · {fc["2025/26"].short_rest_count} short
              rests · busiest {fc["2025/26"].busiest_month} (
              {fc["2025/26"].busiest_month_games})
            </div>
          </div>
          <Reading>
            More matches and roughly{" "}
            {Math.round(
              fc["2025/26"].short_rest_count / Math.max(1, fc["2003/04"].short_rest_count)
            )}
            × the number of short-rest games means the 2025/26 title was won under heavier
            physical load across the season.
          </Reading>
        </div>
      </Reveal>

      {/* Honesty note - the gap as a credibility point */}
      <Reveal delay={60}>
        <div className="card spec honesty">
          <div className="sublayer-head">
            <h3>What this section deliberately won't compare</h3>
            <CategoryBadge category="interpretation" />
          </div>
          <p style={{ marginBottom: 0 }}>
            {p.tracking_note} It's tempting to reach for distance covered, sprint counts,
            or GPS load - but there's no 2003/04 equivalent, so any "comparison" would be
            invented. Leaving it out is the honest call, and a more credible one than a
            fabricated number.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          Now the pieces are on the table - the field, and the physical state each side
          met it in. Time to put them back together with the model. ↓
        </p>
      </Reveal>
    </Section>
  );
}
