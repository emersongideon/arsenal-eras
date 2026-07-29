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
            A settled team and a rebuilt one are not facing the same job. A squad that has
            played together knows its movement and the manager&rsquo;s system; one with many
            new signings has to build that from scratch, which takes time. So we measure the
            upheaval each squad absorbed three ways: players retained, players joined, and
            players departed, weighting departures by the minutes those players had played
            the season before, so losing a key player counts for more than losing a squad
            filler.
          </p>
          <p>
            The 2003/04 title squad was highly settled:{" "}
            <b>{ct["2003/04"].retention_pct.toFixed(1)}%</b> carried over from the previous
            season, with only {ct["2003/04"].incoming} new faces. The 2025/26 squad was far
            less so: <b>{ct["2025/26"].retention_pct.toFixed(1)}%</b> carried over, with{" "}
            {ct["2025/26"].incoming} new players. But the two lost a similar share of their
            proven playing time. Imagine last season as 100 minutes on the pitch: the players
            who left before 2003/04 accounted for about{" "}
            {Math.round(ct["2003/04"].departed_minutes_pct)} of them, before 2025/26 about{" "}
            {Math.round(ct["2025/26"].departed_minutes_pct)}.
          </p>
          <SquadStabilityChart bySeason={ct} />
          <LimitationNote>
            Squad depth and positional cover matter too, and a fuller version of this
            would include them. We leave them out because reliable position-by-position
            data does not exist for the 2003/04 squad, and a measure available for only
            one era would not make a fair comparison.
          </LimitationNote>
          <Reading>
            So the eras differ less than the raw squad turnover suggests. Both lost a similar
            share of their established core; what set 2025/26 apart was the number of new
            players it had to integrate, not a bigger loss of proven quality. It was a harder
            integration job, not a deeper rebuild.
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
