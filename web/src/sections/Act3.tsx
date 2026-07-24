import { FixtureLoadChart, ScheduleDifficultyChart } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { EraData } from "../types";

export function Act3({ era }: { era: EraData }) {
  const sd = era.schedule_difficulty.by_season;
  return (
    <Section
      id="act3"
      eyebrow="Act 3 · But the game changed"
      style={{ background: "#eef1f6", borderTop: "1px solid #dfe3ea", borderBottom: "1px solid #dfe3ea" }}
    >
      <Reveal>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <span className="badge" style={{ background: "#e2e7f0", color: "#3a4a63", border: "1px solid #c7d0df" }}>
            <span className="tick" /> Context, not measurement
          </span>
        </div>
        <h2>The two teams didn't play the same sport</h2>
        <p className="lead narrow">
          Before crowning anyone, three things that shifted between the eras. These
          aren't inputs to the points model - they're the context around it. Some are
          hard fact, one is frankly a guess. Each is labelled.
        </p>
      </Reveal>

      {/* Lever A - VAR (speculative) */}
      <Reveal delay={60}>
        <div className="card spec" style={{ margin: "26px 0 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3>a. VAR didn't exist in 2003/04</h3>
            <CategoryBadge category="speculative" />
          </div>
          <p>{era.var.headline} The Premier League introduced VAR in {era.var.var_introduced},
            so a chunk of 2025/26's marginal calls - tight offsides, handball penalties -
            simply couldn't have been reviewed 22 years earlier.</p>
          <p className="dim" style={{ fontSize: 14, marginBottom: 8 }}>
            I can't measure a counterfactual, so this is a directional estimate only:
          </p>
          <div style={{ fontSize: 15 }}>
            Estimated net league-points swing:{" "}
            <b style={{ color: "#b4550a" }}>
              {era.var.estimated_points_swing.low} to +{era.var.estimated_points_swing.high} pts
            </b>
            <ul style={{ marginTop: 10 }}>
              {era.var.assumptions.map((a) => (
                <li key={a} className="dim" style={{ fontSize: 14 }}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* Lever B - fixture load (fact) */}
      <Reveal delay={60}>
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3>b. Fixture load - a fatigue proxy</h3>
            <CategoryBadge category="fact" />
          </div>
          <p>{era.fixture_load.headline} The expanded Champions League is the driver:{" "}
            <b>{era.fixture_load.european["2025/26"]}</b> European games in 2025/26 versus{" "}
            <b>{era.fixture_load.european["2003/04"]}</b> in 2003/04 - part of{" "}
            <b>{era.fixture_load.total["2025/26"]}</b> total competitive matches against{" "}
            <b>{era.fixture_load.total["2003/04"]}</b>.</p>
          <FixtureLoadChart byComp={era.fixture_load.by_competition} />
        </div>
      </Reveal>

      {/* Lever C - schedule difficulty (measured) */}
      <Reveal delay={60}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3>c. Who they took points off - a depth proxy</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>
            Derived from the real results: points-per-game against the division's
            bottom half versus its top rivals. The contrast is striking. The
            Invincibles were <b>evenly excellent</b> - ~{sd["2003/04"].ppg_vs_top_rivals.toFixed(1)} PPG
            against the best, ~{sd["2003/04"].ppg_vs_bottom_half.toFixed(1)} against the rest.
            The 2025/26 side <b>feasted on weaker teams</b> ({sd["2025/26"].ppg_vs_bottom_half.toFixed(1)} PPG,
            dropping just {sd["2025/26"].points_dropped_vs_bottom_half} points to the bottom half)
            but <b>struggled against the top</b> ({sd["2025/26"].ppg_vs_top_rivals.toFixed(1)} PPG) -
            where all five defeats lived.
          </p>
          <ScheduleDifficultyChart bySeason={sd} />
        </div>
      </Reveal>
    </Section>
  );
}
