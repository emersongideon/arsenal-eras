import {
  CongestionPpgChart,
  CongestionTimeline,
  RestGapChart,
  SquadAgeScatter,
} from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Section } from "../components/ui";
import type { Congestion, Physical } from "../types";

/** Interpretation block, marked with the interpretation pill and kept apart from
 *  the measured statement it reads. */
function Reading({ children }: { children: React.ReactNode }) {
  return (
    <div className="reading">
      <CategoryBadge category="interpretation" />
      <p style={{ margin: "8px 0 0" }}>{children}</p>
    </div>
  );
}

export function SectionC({ p, congestion }: { p: Physical; congestion: Congestion }) {
  const age = p.squad_age.by_season;
  const fc = p.fixture_congestion.by_season;
  const cg = congestion.by_season;
  const over30 = (s: "2003/04" | "2025/26") =>
    Math.round(age[s].over30_minutes_share * 100);
  return (
    <Section
      id="section-c"
      eyebrow="Section C · The physical picture"
      style={{
        background: "#eef1f6",
        borderTop: "1px solid #dfe3ea",
        borderBottom: "1px solid #dfe3ea",
      }}
    >
      <Reveal>
        <h2>When the body breaks, a title race slips away</h2>
        <p className="lead narrow">
          The second force is internal: the physical demand the season placed on the squad,
          and whether the squad could carry it. A title is a nine-month test of endurance as
          much as quality, and when legs go, leads slip. We measure this two ways that exist
          cleanly for both eras: how old the side that actually played was, and how heavy and
          compressed its fixture schedule was. Then we test the thing that actually matters:
          did the physical load show up in dropped points?
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
            Age matters physically, but a simple squad average is misleading, because a
            34-year-old who barely featured would count the same as a 24-year-old who
            played every week. So we weight each player's age by the minutes they actually
            played. This answers the more useful question: how old was the team that was
            really on the pitch, not how old is everyone on the books.
          </p>
          <p>
            By this measure, the Invincibles were a{" "}
            <b>{age["2003/04"].minutes_weighted_age}</b>-year-old side, and{" "}
            {over30("2003/04")}% of their playing minutes went to players aged 30 or over.
            The 2025/26 side was younger, at{" "}
            <b>{age["2025/26"].minutes_weighted_age}</b>, with only {over30("2025/26")}% of
            minutes going to over-30s.
          </p>
          <SquadAgeScatter bySeason={age} />
          <Reading>
            An older side carries more experience but usually less physical margin over a
            long, congested season. The Invincibles were the older team; 2025/26 was
            younger. On its own this settles nothing, but it sets up the real test: how
            heavy was the schedule each side had to survive, and did it cost them? That is
            what the fixture load, and then the points, will show.
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
            Games are only half the load; how tightly they are packed is the other half.
            Playing 60 matches with a clear week between each is very different from
            playing them in bunches with two or three days' rest, when players cannot fully
            recover before the next one. So we measure two things from the actual match
            dates across every competition: how many games each side played, and how often
            those games came after only a short rest.
          </p>
          <p>
            The 2025/26 side played <b>{fc["2025/26"].total_games} games</b> to the
            Invincibles' <b>{fc["2003/04"].total_games}</b>, and{" "}
            <b>{fc["2025/26"].short_rest_count}</b> of those came after three days' rest or
            fewer, against <b>{fc["2003/04"].short_rest_count}</b> for the Invincibles. The
            gap is driven mainly by the modern Champions League, which is larger and runs
            deeper into the calendar than the 2003/04 version.
          </p>

          <p className="chart-title" style={{ marginTop: 6 }}>
            How much rest before each game
          </p>
          <p className="chart-sub">
            Every game bucketed by the days since the previous match. The 2025/26 side sits
            far more heavily in the short-rest buckets.
          </p>
          <RestGapChart bySeason={fc} />

          <div className="callout">
            <p className="callout-eyebrow">The significant difference</p>
            <p className="callout-body">
              The shift is in how often games came thick and fast. 2025/26 played{" "}
              <b>{fc["2025/26"].short_rest_count} of its {fc["2025/26"].total_games} games</b>{" "}
              on three days&rsquo; rest or fewer, close to half; the Invincibles played{" "}
              <b>{fc["2003/04"].short_rest_count} of {fc["2003/04"].total_games}</b>, closer
              to a third. The single busiest month was heavier too:{" "}
              <b>{fc["2025/26"].busiest_month_games} games in {fc["2025/26"].busiest_month}</b>{" "}
              against {fc["2003/04"].busiest_month_games} in {fc["2003/04"].busiest_month}.
              The timeline below shows where those short-rest games bunched into congested
              stretches.
            </p>
          </div>

          <p className="chart-title" style={{ marginTop: 20 }}>
            The season, match by match
          </p>
          <p className="chart-sub">
            Each tick is one competitive game, placed by date from August to May. Short-rest
            games are highlighted, and shaded bands mark congested stretches where three or
            more games came in quick succession, so it is visible where the calendar bunched
            up (December, and the modern January and February European weeks).
          </p>
          <CongestionTimeline bySeason={fc} />

          {/* closing beat of part 2: did the compressed schedule cost points? */}
          <p className="chart-title" style={{ marginTop: 22 }}>
            Did the compressed schedule cost points?
          </p>
          <p className="chart-sub">
            The real test: did either side actually drop more points when it played on short
            rest? We line the same rest-gaps up against the points won in each league game.
          </p>
          <div className="chart-card" style={{ margin: "8px 0 6px" }}>
            <p className="chart-title" style={{ margin: "0 6px 2px" }}>
              League points per game, by rest before the match
            </p>
            <p className="chart-sub">
              Points per game over the 38 league matches each season, split by the rest
              before each game (measured across all competitions). Dashed lines mark each
              season&rsquo;s overall PPG. Sample sizes are shown on the bars.
            </p>
            <CongestionPpgChart bySeason={cg} />
            <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
              Short-rest games: 2003/04 n={cg["2003/04"].buckets.short.games}, 2025/26 n=
              {cg["2025/26"].buckets.short.games}. Normal-rest: n=
              {cg["2003/04"].buckets.normal.games} and n=
              {cg["2025/26"].buckets.normal.games}. The short-rest buckets are small, so
              treat the per-bucket figures as indicative rather than decisive.
            </p>
          </div>
          <Reading>
            So the compressed calendar did not, in the end, cost points: 2025/26&rsquo;s
            points per game held up in short-rest games rather than dropping. That matters
            for how we read the physical picture. The schedule was heavier, but the side
            absorbed it, so the more telling physical difference between the two eras is not
            the calendar but the age of the team carrying it, which is where we started this
            section.
          </Reading>
        </div>
      </Reveal>

      {/* Methodological note - the gap stated, not filled */}
      <Reveal delay={60}>
        <LimitationNote>
          Distance covered, high-intensity sprints, GPS load and recovery data have no
          2003/04 equivalent, so none of it is compared here. Any cross-era comparison of
          those would be invented. Flagging the gap is the more useful call than filling it
          with a number that cannot be sourced.
        </LimitationNote>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          Both forces are now measured, the field outside and the strain inside. Section D
          combines them. ↓
        </p>
      </Reveal>
    </Section>
  );
}
