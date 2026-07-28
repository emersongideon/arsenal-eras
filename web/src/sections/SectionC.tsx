import { CongestionTimeline, RestGapChart, SquadAgeScatter } from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Section } from "../components/ui";
import type { Physical } from "../types";

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

export function SectionC({ p }: { p: Physical }) {
  const age = p.squad_age.by_season;
  const fc = p.fixture_congestion.by_season;
  const over30 = (s: "2003/04" | "2025/26") =>
    Math.round(age[s].over30_minutes_share * 100);
  return (
    <Section
      id="physical"
      eyebrow="Section C · The physical picture"
      style={{
        background: "#eef1f6",
        borderTop: "1px solid #dfe3ea",
        borderBottom: "1px solid #dfe3ea",
      }}
    >
      <Reveal>
        <h2>Only what is measurable for both eras</h2>
        <p className="lead narrow">
          Two physical measures exist cleanly for 2003/04 and 2025/26: the age of the side
          that actually played, and the fixture load it carried. Everything else modern
          tracking would give us has no 2003/04 equivalent, so it is left out. See the
          note at the end of this section.
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
            The Invincibles were the older, more experienced team; the 2025/26 side was
            younger and leaned less on players past 30. This is a difference in profile,
            not evidence on its own that either season was physically harder. Age feeds
            into the fixture load that follows, which is where the physical demand actually
            shows up.
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

          <p className="chart-title" style={{ marginTop: 20 }}>
            The season, match by match
          </p>
          <p className="chart-sub">
            Each tick is one competitive game, placed by date from August to May.
            Short-rest games are highlighted, so the clusters (December, and the modern
            European weeks) stand out.
          </p>
          <CongestionTimeline bySeason={fc} />

          <Reading>
            The 2025/26 side carried a heavier and more compressed schedule, with more
            games and far more of them crammed into short-rest windows. This is the
            clearest physical difference between the two seasons, and unlike tracking data,
            it can be measured the same way for both.
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
          The schedule was heavier and more compressed. Did it cost points? ↓
        </p>
      </Reveal>
    </Section>
  );
}
