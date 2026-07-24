import { ExpectedPointsChart, MatchXgScatter } from "../components/charts";
import { CategoryBadge, Reveal, Section, seasonClass } from "../components/ui";
import type { ModelResult, Season } from "../types";

export function Act2({ model }: { model: Record<Season, ModelResult> }) {
  const seasons = Object.keys(model) as Season[];
  return (
    <Section id="act2" eyebrow="Act 2 · Under the hood">
      <Reveal>
        <h2>How many points did they actually deserve?</h2>
        <div style={{ margin: "8px 0 18px" }}>
          <CategoryBadge category="measured" />
        </div>
        <div className="method narrow">
          <strong>The method.</strong> Goals are rare, roughly
          independent events, so each team's goals in a match are modelled as a
          Poisson process. I don't assume "goals = xG"; instead I fit a Poisson
          regression (<code>scikit-learn PoissonRegressor</code>) that maps each
          match's xG onto a scoring <em>rate</em>, calibrated separately per season
          because the two xG providers differ. From the two rates I compute the
          probability of a win, draw and loss, and turn those into{" "}
          <strong>expected points</strong>. Summed over 38 games, that's how many
          points the underlying performances merited - stripping out finishing
          luck, goalkeeping heroics and late winners.
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ margin: "26px 0 14px" }}>
          <p className="chart-title">Actual points vs model-expected points</p>
          <p className="chart-sub">
            Grey = what the xG model says they deserved. Colour = what they actually got.
          </p>
          <ExpectedPointsChart model={model} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <p className="narrow" style={{ marginBottom: 24 }}>
          <strong>Both title teams beat their expected points</strong> - and by a lot.
          That's the signature of champions: they win the tight games the model
          calls coin-flips. The 2003/04 side over-performed by{" "}
          <b>{model["2003/04"].points_over_expected}</b> points, the 2025/26 side by{" "}
          <b>{model["2025/26"].points_over_expected}</b>. Different routes to it,
          though - one out-finished its chances, the other out-defended and out-nerved
          the room.
        </p>
      </Reveal>

      <div className="grid2">
        {seasons.map((s, i) => (
          <Reveal key={s} delay={i * 90}>
            <div className={`chart-card ${seasonClass(s)}`}>
              <p className="chart-title" style={{ color: s === "2003/04" ? "#8a6610" : "#d90007" }}>
                {s} · every match
              </p>
              <p className="chart-sub">
                Each dot is a game: xG created vs conceded. Below the dashed line =
                deserved to win. <span style={{ color: "#15803d" }}>green W</span>,{" "}
                <span style={{ color: "#b45309" }}>amber D</span>,{" "}
                <span style={{ color: "#c0392b" }}>red L</span>.
              </p>
              <MatchXgScatter res={model[s]} />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={60}>
        <p className="narrow dim" style={{ marginTop: 20, fontSize: 14 }}>
          Sanity check: for each season the model's total predicted goals equals the
          actual goals scored ({model["2003/04"].model.calibration_actual_goal_sum} and{" "}
          {model["2025/26"].model.calibration_actual_goal_sum} respectively), so it's
          calibrated, not hand-tuned. Assumption I'm making: the two teams' goal
          counts in a match are independent - a known simplification.
        </p>
      </Reveal>
    </Section>
  );
}
