import { ArsenalCombinedChart, SynthesisScatter } from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Section } from "../components/ui";
import type { SynthesisD } from "../types";

export function SectionD({ synthesisD }: { synthesisD: SynthesisD }) {
  const sd = synthesisD;
  const raw0 = sd.arsenal_combined.by_era["2003/04"].raw;
  const raw1 = sd.arsenal_combined.by_era["2025/26"].raw;

  return (
    <Section id="section-d" eyebrow="Section D · The synthesis">
      <Reveal>
        <h2>Putting the two forces together</h2>
        <p className="lead narrow">
          Sections B and C measured the two forces separately: the resistance from outside,
          and the strain from inside. Combining them cleanly needs squad and fixture detail
          that only exists to a consistent standard for Arsenal, so this section does two
          things: it places every club on the outside force, measured the same way for all,
          and then applies the full two-force method to Arsenal, the one club with complete
          data.
        </p>
      </Reveal>

      {/* D1 - peer scatter (outside force only, all clubs) */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>1. The whole league on the outside force</h3>
            <CategoryBadge category="model" />
          </div>
          <p>
            This plane shows the <b>outside force only</b>, measured the same way for all 20
            clubs. Along the bottom is field resistance, the position-race pressure each club
            faced from the rest of the table; up the side is over-performance, actual points
            minus what the same Poisson expected-points model said its performances deserved.
            A club in the top-right faced a crowded field and still beat the model. The inside
            force (squad stability, fixture load) is not on this axis, because it cannot be
            measured to the same standard for rival clubs; it is handled for Arsenal below.
          </p>
          <SynthesisScatter clubs={sd.peer.clubs} />
          <p className="chart-sub" style={{ marginTop: 10 }}>
            Arsenal is highlighted in red; hover or tap any dot for its club and values. The
            dashed line is the model&rsquo;s expectation (zero over-performance).
          </p>
          {/* INTERPRETATION: to be written together once positions are confirmed. */}
        </div>
      </Reveal>

      {/* D2 - Arsenal full two-force method */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>2. The full method, applied to Arsenal</h3>
            <CategoryBadge category="model" />
          </div>
          <p>
            The full two-force method needs squad and fixture detail that is only cleanly
            available for Arsenal, so here we apply the complete method to the one club we
            have full data for, across its two complete-data seasons. This is the
            formalisation held back from the framework diagram: <b>difficulty</b> is an
            equal-weighted average of the normalised outside and inside components, and{" "}
            <b>over-performance</b> is actual minus expected points.
          </p>
          <ArsenalCombinedChart combined={sd.arsenal_combined} />
          <p className="chart-sub" style={{ marginTop: 10 }}>
            Raw components, 2003/04 vs 2025/26: title-race pressure {raw0.field} vs{" "}
            {raw1.field}; minutes-weighted departures {raw0.departures}% vs{" "}
            {raw1.departures}%; short-rest share {raw0.short_rest}% vs {raw1.short_rest}%.
            Each is normalised to 0 to 1 across the two seasons, then averaged.
          </p>

          <aside className="maths-aside">
            <p className="maths-label">The recipe, and it is tunable</p>
            <p className="maths-body">
              Difficulty combines three components, each normalised to 0 to 1 across the
              seasons compared, then averaged with equal weight: the outside force
              (title-race pressure), and two inside forces (minutes-weighted departures, and
              the short-rest share of games). The equal weighting is a default choice, not a
              fact. A club would tune these weights to its own priorities; the method holds
              whatever weights you pick, which is the point of making it explicit rather than
              hiding it in a single number.
            </p>
          </aside>
          {/* INTERPRETATION: to be written together once values are confirmed. */}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <LimitationNote>
          This synthesis is 2025/26-only for the peer scatter. The same view cannot be built
          for 2003/04 because shot data for Arsenal&rsquo;s rivals does not exist for that
          season, so the other clubs&rsquo; scores could not be computed. The full combined
          method is shown for Arsenal alone, because squad stability and fixture load could
          not be measured to the same standard for rival clubs. None of the peers&rsquo;
          inside-force values were estimated or faked.
        </LimitationNote>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">What the whole picture surfaces. ↓</p>
      </Reveal>
    </Section>
  );
}
