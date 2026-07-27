import { FieldPressureChart, SquadContinuityChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { Circumstances } from "../types";

/** Our reading of a sub-layer, marked interpretation and kept apart from the fact. */
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
    <Section id="circumstances" eyebrow="Section B · How hard was the task?">
      <Reveal>
        <h2>The field each title was won against</h2>
        <p className="lead narrow">
          A points total is only as impressive as the league it was won in. We measure
          that two ways: how much title-race pressure the rest of the table applied, and
          how settled a squad each side did it with. Each comes with our reading, labelled
          interpretation and kept strictly apart from the measurement.
        </p>
      </Reveal>

      {/* B1 - field strength via the pressure index */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>1. The strength of the field - a title-race pressure index</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            "Chelsea got 79, City got 78" is shallow - a team 30 points back was never a
            threat. So instead of quoting the pack's points, we score the pressure the{" "}
            <em>whole</em> table applied. Each of the 19 rivals contributes{" "}
            <code>exp(-gap / {c.field_strength.tau})</code>, where <code>gap</code> is its
            points behind Arsenal: a rival level on points counts 1, one that finishes ~10
            back counts about a third, a distant one counts nothing. Summed, it reads as
            the effective number of genuine title threats.
          </p>
          <FieldPressureChart bySeason={f} />
          <p className="dim" style={{ fontSize: 14, marginTop: 12 }}>
            Pressure index (higher = harder):{" "}
            <b style={{ color: "#8a6610" }}>{f["2003/04"].pressure_index}</b> in 2003/04
            vs <b style={{ color: "#d90007" }}>{f["2025/26"].pressure_index}</b> in
            2025/26. The 2nd-placed side finished {f["2003/04"].margin} points back in
            2003/04 but only {f["2025/26"].margin} back in 2025/26; nobody came within 10
            points of the Invincibles, whereas Manchester City closed to within{" "}
            {f["2025/26"].margin} of the 2025/26 side. The ranking holds at every decay
            scale we tried (
            {Object.entries(f["2003/04"].pressure_by_tau)
              .map(([t]) => `τ=${t}`)
              .join(", ")}
            ), so it isn't an artefact of that one parameter.
          </p>
          <Reading>
            By this measure the 2025/26 champions faced roughly{" "}
            <b>{morePressure}% more title-race pressure</b> than the Invincibles. The
            Invincibles were more dominant on the raw table, but they pulled clear of a
            field that never truly closed in; the 2025/26 side had to win the title with a
            genuine rival breathing down its neck to the final weeks.
          </Reading>
        </div>
      </Reveal>

      {/* B2 - squad continuity */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. How settled was the squad?</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Winning with a settled side is a different job from winning while rebuilding.
            The Invincibles kept <b>{ct["2003/04"].retention_pct}%</b> of their
            league-playing squad from the season before ({ct["2003/04"].incoming} new
            faces). The 2025/26 side kept just <b>{ct["2025/26"].retention_pct}%</b> -{" "}
            <b>{ct["2025/26"].incoming}</b> new players in the rotation, including a new
            first-choice striker and midfield.
          </p>
          <SquadContinuityChart bySeason={ct} />
          <Reading>
            The 2025/26 title was won with a materially less settled squad - a rebuild
            bedding in on the fly, versus a machine in its third season together. That
            makes producing results harder, not easier.
          </Reading>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          So the field: a comparably strong rival that pressed far harder, integrated by a
          far more rebuilt squad. But there's one more strain a table can't show - the
          toll of the calendar itself. ↓
        </p>
      </Reveal>
    </Section>
  );
}
