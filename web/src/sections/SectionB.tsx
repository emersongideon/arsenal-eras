import {
  ChasingPackChart,
  LeagueShapeChart,
  MarginChart,
  SquadContinuityChart,
} from "../components/charts";
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
  const m = c.margin_to_second.by_season;
  const sh = c.league_shape.by_season;
  const ct = c.squad_continuity.by_season;
  const cp = c.chasing_pack.by_season;

  return (
    <Section id="circumstances" eyebrow="Section B · How hard was the task?">
      <Reveal>
        <h2>The field each title was won against</h2>
        <p className="lead narrow">
          A points total is only as impressive as the league it was won in. We take four
          measured angles on how hard each field was to beat - the chasing pack, the
          winning margin, the shape of the whole table, and how settled the squad was.
          Under each, we give our reading of what it means, labelled interpretation and
          kept strictly apart from the measurement.
        </p>
      </Reveal>

      {/* B1 - chasing pack */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>1. Strength of the chasing pack</h3>
            <CategoryBadge category="fact" />
          </div>
          <p>
            How good were the teams Arsenal had to hold off? Both runners-up were strong:
            Chelsea reached <b>{m["2003/04"].runner_up_points}</b> points in 2003/04,
            Manchester City <b>{m["2025/26"].runner_up_points}</b> in 2025/26 - almost
            identical. {c.chasing_pack.xg_note}
          </p>
          <ChasingPackChart bySeason={cp} />
          <Reading>
            The pack Arsenal beat was about as strong in both eras - a top rival on ~78-79
            points either way. On this measure the task looks comparable, not easier in
            one era.
          </Reading>
        </div>
      </Reveal>

      {/* B2 - margin */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. The winning margin</h3>
            <CategoryBadge category="fact" />
          </div>
          <p>
            How much daylight was there at the top? The Invincibles finished{" "}
            <b>{m["2003/04"].margin} points</b> clear of Chelsea; the 2025/26 side won by{" "}
            <b>{m["2025/26"].margin}</b> over City.
          </p>
          <MarginChart bySeason={m} />
          <Reading>
            Same-sized rival, smaller cushion. Against a comparably strong runner-up the
            2025/26 title was the tighter race - fewer points in hand meant less room for
            a slip.
          </Reading>
        </div>
      </Reveal>

      {/* B3 - league shape */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>3. The shape of the league</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Was the division top-heavy or deep? Points spread from 1st to 20th was{" "}
            <b>{sh["2003/04"].spread}</b> in 2003/04 (std {sh["2003/04"].std}) and{" "}
            <b>{sh["2025/26"].spread}</b> in 2025/26 (std {sh["2025/26"].std}). Each bar
            is a team; the champion is highlighted, the dashed line is the safety cut-off.
          </p>
          <div className="grid2" style={{ marginTop: 8 }}>
            <div>
              <p className="chart-title" style={{ color: "#8a6610" }}>
                2003/04
              </p>
              <LeagueShapeChart
                season="2003/04"
                points={sh["2003/04"].points}
                relegationCutoff={sh["2003/04"].relegation_cutoff}
              />
            </div>
            <div>
              <p className="chart-title" style={{ color: "#d90007" }}>
                2025/26
              </p>
              <LeagueShapeChart
                season="2025/26"
                points={sh["2025/26"].points}
                relegationCutoff={sh["2025/26"].relegation_cutoff}
              />
            </div>
          </div>
          <Reading>
            2025/26 had the wider spread - a longer tail of weak teams to take points off,
            but also a slightly more stretched table. Read it as a league where the very
            top still had to be near-perfect to pull clear.
          </Reading>
        </div>
      </Reveal>

      {/* B4 - squad continuity */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>4. How settled was the squad?</h3>
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
            makes the task of repeating results harder, not easier.
          </Reading>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">
          Add it up: a comparably strong rival, a tighter margin, a deeper tail, and a far
          more rebuilt squad point to a genuinely hard task in 2025/26. But there is one
          more strain a table can't show - the toll of the calendar itself. ↓
        </p>
      </Reveal>
    </Section>
  );
}
