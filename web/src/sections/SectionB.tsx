import {
  PressureRobustnessChart,
  SquadStabilityChart,
  TauExplainer,
} from "../components/charts";
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
  const ratio10 = (
    f["2025/26"].pressure_index / f["2003/04"].pressure_index
  ).toFixed(2);

  return (
    <Section id="section-b" eyebrow="Section B · The field">
      <Reveal>
        <h2>Resistance map</h2>
        <p className="lead narrow">
          This is the first of the two forces from the framework: the resistance from
          outside, meaning how strong the rest of the league was. The same points total is
          harder to reach in a strong league than a weak one, so a title is only as
          impressive as the field it was won against. We measure that field two ways: how
          much title-race pressure the chasing pack applied, and how settled the squad was
          that delivered the title. Both can be measured for each era.
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
            The resistance the rest of the table applied can be captured in a single
            measure. The idea: a rival breathing down your neck all season is a far harder
            test than one that fell away early, so the closer a rival finishes, the more
            pressure it represents. We add up that pressure across every rival to get a
            title-race pressure index. The higher the index, the more genuine title threats
            the team had to hold off, and so the harder the title was to win.
          </p>

          <aside className="maths-aside">
            <p className="maths-label">The maths, if you want it</p>
            <p className="maths-body">
              Each rival's weight is <code>exp(-gap / τ)</code>, where <code>gap</code> is
              the points it finished behind Arsenal and <code>τ</code> sets how fast that
              weight fades as a rival finishes further back. We use exponential decay so the
              weight fades smoothly rather than cutting off sharply at an arbitrary points
              gap. The index is the sum of these weights across all rivals.
            </p>
          </aside>

          <p className="chart-title" style={{ marginTop: 20 }}>
            What τ does
          </p>
          <p className="chart-sub">
            The x-axis is how many points a rival finished behind Arsenal; the y-axis is the
            weight that rival gets. τ controls how fast the weight falls as a rival finishes
            further back. A <b>high</b> τ means the weight falls slowly, so even rivals who
            finished well behind still count for something (a far-back rival still matters).
            A <b>low</b> τ means the weight falls fast, so only rivals who finished very
            close count at all. In short: higher τ means distant rivals still matter; lower τ
            means only close rivals matter.
          </p>
          <TauExplainer />

          <p className="chart-title" style={{ marginTop: 22 }}>
            The index across every τ
          </p>
          <p className="chart-sub">
            Rather than defend a single value of τ, the chart sweeps it across its usable
            range. Drag the marker to read the index for each season at any τ.
          </p>
          <PressureRobustnessChart sweep={c.field_strength.sweep} />
          <p className="chart-sub" style={{ marginTop: 12 }}>
            The chart stops at τ = 20 on purpose: beyond it the two indices keep converging,
            but the measure stops meaning "genuine title threats" because it starts counting
            mid-table and relegation sides, so that range is not informative here.
          </p>
          <Reading>
            At the τ = 10 used in the report, 2025/26 shows {ratio10}× more title-race
            pressure than 2003/04. Here is what that means in plain terms: in 2003/04 the
            nearest rival finished {f["2003/04"].margin} points behind, already out of the
            race with games to spare. In 2025/26 the nearest rival finished just{" "}
            {f["2025/26"].margin} points behind and was still within reach late on. Arsenal
            could not ease off in 2025/26 the way the Invincibles could once they had pulled
            clear. That is what more title-race pressure means: the title stayed contested
            for longer.
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
            Weighting departures this way means the figure reflects not just how many
            players left, but how much of the team that actually played walked out the
            door.
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
          <p>
            Put plainly: imagine last season&rsquo;s team as 100 minutes of playing time.
            The players who left before 2003/04 accounted for about{" "}
            {Math.round(ct["2003/04"].departed_minutes_pct)} of those minutes, and before
            2025/26 about {Math.round(ct["2025/26"].departed_minutes_pct)}. So while 2025/26
            brought in far more new faces, the two sides lost a similar <b>share</b> of their
            proven playing time. The difference between the eras is how much was <b>new</b>,
            not how much departed.
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
