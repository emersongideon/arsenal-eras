import { PressureRobustnessChart, SquadContinuityChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
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
  const ct = c.squad_continuity.by_season;
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
            Quoting the runner-up's points is shallow: a team 30 points back was never a
            threat. Instead, every rival is weighted by how close it finished. Each
            contributes <code>exp(-gap / τ)</code>, where <code>gap</code> is its points
            behind Arsenal and <code>τ</code> sets how fast a rival's weight fades as it
            finishes further back. Summed across the table, the index reads as the
            effective number of genuine title threats.
          </p>
          <p>
            One knob to choose: <code>τ</code>. A low <code>τ</code> means pressure fades
            fast, so only very close rivals count; a high <code>τ</code> means it fades
            slowly, so even distant sides add a little. Rather than defend a single value,
            the chart sweeps <code>τ</code> across its usable range. Drag the marker: at
            every setting the 2025/26 line sits above 2003/04. Only the absolute numbers
            move, never the ranking.
          </p>
          <PressureRobustnessChart sweep={c.field_strength.sweep} />
          <p style={{ marginTop: 12 }}>
            At the reported <code>τ = {c.field_strength.tau}</code> the index is{" "}
            <b>{f["2003/04"].pressure_index}</b> for 2003/04 and{" "}
            <b>{f["2025/26"].pressure_index}</b> for 2025/26, roughly {morePressure}% more
            title-race pressure on the later side. The gap narrows as <code>τ</code> grows
            (past the plotted range both curves climb toward the full 19 rivals), and it
            widens as <code>τ</code> shrinks, but 2025/26 stays on top throughout. The
            ranking is a property of the field, not of the parameter.
          </p>
          <Reading>
            2003/04 was more dominant, but it pulled clear of a field that never came
            within 10 points. 2025/26 won with a rival that stayed within{" "}
            {f["2025/26"].margin}.
          </Reading>
        </div>
      </Reveal>

      {/* B2 - squad continuity */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. Squad continuity</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Winning with a settled side is a different task from winning mid-rebuild. The
            Invincibles retained <b>{ct["2003/04"].retention_pct}%</b> of their
            league-playing squad from the season before, {ct["2003/04"].incoming} new
            faces. The 2025/26 side retained <b>{ct["2025/26"].retention_pct}%</b>,{" "}
            {ct["2025/26"].incoming} new players to integrate, including a first-choice
            striker and midfield.
          </p>
          <SquadContinuityChart bySeason={ct} />
          <Reading>
            The later title was won while rebuilding; the earlier one was won with
            continuity.
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
