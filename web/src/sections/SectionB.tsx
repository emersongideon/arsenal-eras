import { PressureRobustnessChart, SquadStabilityChart } from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Section } from "../components/ui";
import type { Circumstances } from "../types";

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

export function SectionB({ c }: { c: Circumstances }) {
  const f = c.field_strength.by_season;
  const ct = c.squad_stability.by_season;
  const morePressure = Math.round(
    (f["2025/26"].pressure_index / f["2003/04"].pressure_index - 1) * 100
  );

  return (
    <Section id="circumstances" eyebrow="Section B · The field">
      <Reveal>
        <h2>How much resistance each title was won against</h2>
        <p className="lead narrow">
          A points total is only as strong as the league it was won in. This section
          measures the league behind each title two ways: the resistance the rest of the
          table applied, and how settled the squad was that delivered it. Both are
          available for each era.
        </p>
      </Reveal>

      {/* B1 - title-race pressure index */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>1. Title-race pressure index</h3>
            <CategoryBadge category="model" />
          </div>
          <p>
            The title is won by taking more points than your rivals, but how close those
            rivals finish changes how hard that is. A team breathing down your neck all
            season is a different task from one that fell away early. Hence we use a
            title-race pressure index, which measures the total pressure the chasing pack
            applied: the closer a rival finishes on points, the more it contributes, and
            the further back it finishes, the less. We define each rival's weight using the
            formula <code>exp(-gap / τ)</code>, where <code>gap</code> is the number of
            points it finished behind Arsenal and <code>τ</code> sets how fast that weight
            fades. We use exponential decay because it lets a rival's weight fade smoothly
            as the gap grows, rather than cutting off sharply at some arbitrary point.
            Summed across the table, the index reads as the effective number of genuine
            title threats Arsenal faced.
          </p>
          <p>
            <code>τ</code> is a choice, not a fixed rule: a low <code>τ</code> means
            pressure fades fast, so only very close rivals count; a high <code>τ</code>{" "}
            means it fades slowly, so even distant sides add a little. Rather than defend
            one value, the chart sweeps <code>τ</code> across its usable range. At every
            setting, 2025/26 sits above 2003/04, so the ranking does not depend on the
            choice of <code>τ</code>. The size of the gap does depend on it: 2025/26 runs
            from about 2.1× higher at low <code>τ</code> down to 1.3× at high{" "}
            <code>τ</code>. The ranking is the robust finding; the exact multiplier is not.
          </p>
          <p>
            The chart stops at <code>τ = 20</code> on purpose: beyond it the two indices
            keep converging, but the measure stops meaning "genuine title threats" because
            it starts counting mid-table and relegation sides, so that range is not
            informative here.
          </p>
          <PressureRobustnessChart sweep={c.field_strength.sweep} />
          <Reading>
            At <code>τ = {c.field_strength.tau}</code>, the value used in the report,
            2025/26 shows about {morePressure}% more title-race pressure than 2003/04. Read
            plainly: 2003/04 was the more dominant season, but its nearest rival still
            finished {f["2003/04"].margin} points back. In 2025/26 the closest rival
            finished only {f["2025/26"].margin} points back and stayed in the race far
            longer, so the title was contested for more of the season.
          </Reading>
        </div>
      </Reveal>

      {/* B2 - squad stability */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. Squad stability</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            A settled team and a rebuilt one are not facing the same job. When most of a
            squad has played together for a season or more, they already know each
            other&rsquo;s movement and the manager&rsquo;s system; a team with many new
            signings has to build that from scratch, which usually takes time. We measure
            the upheaval each squad absorbed three ways: how many players were retained
            from the previous season, how many joined, and how many departed, weighting
            departures by the minutes those players had played the season before so that
            losing a key player counts for more than losing a squad filler.
          </p>
          <p>
            Of the squad that won the title in 2003/04,{" "}
            <b>{ct["2003/04"].retention_pct.toFixed(1)}%</b> had been at the club the
            previous season and only {ct["2003/04"].incoming} players were new. The 2025/26
            title squad was far less settled:{" "}
            <b>{ct["2025/26"].retention_pct.toFixed(1)}%</b> carried over and{" "}
            {ct["2025/26"].incoming} were new. The departures were comparable in weight,
            though: the players who left before 2003/04 had accounted for{" "}
            <b>{ct["2003/04"].departed_minutes_pct}%</b> of the prior season&rsquo;s league
            minutes, against <b>{ct["2025/26"].departed_minutes_pct}%</b> before 2025/26.
          </p>
          <SquadStabilityChart bySeason={ct} />
          <LimitationNote>
            Squad depth and positional cover matter too, and a fuller version of this
            would include them. We leave them out because reliable position-by-position
            data does not exist for the 2003/04 squad, and a measure available for only
            one era would not make a fair comparison.
          </LimitationNote>
          <Reading>
            The 2025/26 title was won amid real turnover on the incoming side: more than
            twice as many new signings, and only two-thirds of the title squad carried
            over from the year before. The weight of what left was similar to
            2003/04&rsquo;s, so the difference is how much was new, not what departed. The
            Invincibles, by contrast, were an already-settled group. A team integrating
            that many new players usually needs time to gel, so in that respect the later
            title asked more of its squad.
          </Reading>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          The field is one half of the task. The calendar is the other. ↓
        </p>
      </Reveal>
    </Section>
  );
}
