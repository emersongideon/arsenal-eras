import { useMemo, useState } from "react";
import { RangeBar } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import { computeThoughtExperiment } from "../data";
import type { ThoughtExperimentSpec } from "../types";

export function Act4({ spec }: { spec: ThoughtExperimentSpec }) {
  const [varPoints, setVarPoints] = useState(spec.var_slider.default);
  const result = useMemo(() => computeThoughtExperiment(spec, varPoints), [spec, varPoints]);

  return (
    <Section id="act4" eyebrow="Act 4 · The thought experiment">
      <Reveal>
        <div style={{ margin: "0 0 16px" }}>
          <CategoryBadge category="speculative" />
        </div>
        <h2>What if you dropped the Invincibles into 2025/26?</h2>
        <div className="method spec narrow">
          {spec.disclaimer}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="card spec" style={{ marginTop: 26 }}>
          <p style={{ marginBottom: 6 }}>
            Take the Invincibles' <b>{spec.base_points} points</b> and adjust for three
            2025/26 conditions. Each is a <em>band</em>, not a number:
          </p>
          <ul style={{ margin: "0 0 6px", paddingLeft: 18 }}>
            {spec.components.map((c) => (
              <li key={c.name} style={{ marginBottom: 8 }}>
                <b>{c.name}:</b>{" "}
                <span style={{ color: "#b4550a", fontWeight: 700 }}>
                  {c.band[0] > 0 ? "+" : ""}{c.band[0]} to {c.band[1] > 0 ? "+" : ""}{c.band[1]} pts
                </span>
                <div className="dim" style={{ fontSize: 14 }}>{c.assumption}</div>
              </li>
            ))}
          </ul>

          {/* Interactive lever */}
          <div className="slider-wrap">
            <div className="slider-head">
              <label htmlFor="var">Drag the VAR assumption</label>
              <span className="slider-val">
                {varPoints > 0 ? "+" : ""}{varPoints.toFixed(1)} pts
              </span>
            </div>
            <input
              id="var" type="range"
              min={spec.var_slider.min} max={spec.var_slider.max} step={spec.var_slider.step}
              value={varPoints}
              onChange={(e) => setVarPoints(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#5e6772" }}>
              <span>VAR hurts them ({spec.var_slider.min})</span>
              <span>VAR helps them (+{spec.var_slider.max})</span>
            </div>
          </div>

          <div className="range-readout">
            <span className="num" style={{ color: "#b4550a" }}>
              {result.range.low}-{result.range.high}
            </span>
            <span className="dim">plausible adjusted points (midpoint ≈ {result.midpoint})</span>
          </div>
          <RangeBar low={result.range.low} high={result.range.high} base={spec.base_points} />

          <p className="dim" style={{ fontSize: 14, marginTop: 14, marginBottom: 0 }}>
            Move the slider and watch the whole band shift. The point isn't the
            number - it's that under any reasonable set of assumptions the answer is
            a <em>range</em>, and that range overlaps heavily with what the 2025/26
            team actually managed. Anyone quoting a single "adjusted points" figure
            is selling certainty that doesn't exist.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
