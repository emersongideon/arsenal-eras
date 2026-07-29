import { ArsenalCombinedChart, SynthesisScatter } from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Section } from "../components/ui";
import type { SynthesisD } from "../types";

/** Interpretation block (interpretation pill), rendering its children directly so
 *  it can hold multiple paragraphs. */
function Reading({ children }: { children: React.ReactNode }) {
  return (
    <div className="reading">
      <CategoryBadge category="interpretation" />
      {children}
    </div>
  );
}

export function SectionD({ synthesisD }: { synthesisD: SynthesisD }) {
  const sd = synthesisD;
  const raw0 = sd.arsenal_combined.by_era["2003/04"].raw;
  const raw1 = sd.arsenal_combined.by_era["2025/26"].raw;
  const ars = sd.peer.clubs.find((c) => c.is_arsenal)!;
  const sundOver =
    sd.peer.clubs.find((c) => c.club === "Sunderland")?.over_performance ?? 9.6;
  const d03 = sd.arsenal_combined.by_era["2003/04"].difficulty.toFixed(2);
  const d25 = sd.arsenal_combined.by_era["2025/26"].difficulty.toFixed(2);

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
          <Reading>
            <p style={{ margin: "8px 0 0" }}>
              Arsenal sits far top-left: it faced the least crowded title race in the league,
              because it pulled clear at the top, but it beat its expected points by more than
              any other club (+{ars.over_performance}). Its story on this plane is vertical,
              not horizontal. It did not survive a dogfight; it over-delivered against its own
              underlying numbers by the widest margin in the division.
            </p>
            <p style={{ margin: "12px 0 0" }}>
              This looks like it contradicts Section B, which found 2025/26&rsquo;s title race
              more crowded than 2003/04&rsquo;s. It does not: the reference points differ.
              Compared to the Invincibles&rsquo; cakewalk, 2025/26 was a tighter race. Compared
              to this season&rsquo;s mid-table, where Chelsea, Fulham and Brighton sat packed
              together around a field resistance of 9, Arsenal&rsquo;s race at the top was the
              most one-sided in the league. Crowding depends on who you measure against.
            </p>
            <p style={{ margin: "12px 0 0" }}>
              The &ldquo;hard field and still beat the model&rdquo; quadrant, top-right,
              belongs to sides like Sunderland (+{sundOver} in a crowded lower-mid-table) and
              Fulham. Arsenal&rsquo;s achievement is a different shape: not resistance overcome,
              but expectation exceeded.
            </p>
          </Reading>
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
          <Reading>
            <p style={{ margin: "8px 0 0" }}>
              Applying the full method to Arsenal&rsquo;s two complete-data seasons, the
              equal-weighted difficulty comes out higher for 2025/26 ({d25}) than 2003/04 (
              {d03}). It is a genuine trade-off, not a landslide: 2025/26 faced more
              title-race pressure and a far more congested calendar, while 2003/04 lost
              marginally more of its proven playing time to departures. Two of the three
              forces point to 2025/26 as the harder task. This is the model&rsquo;s
              even-handed reading, with every force weighted equally. Whether that is the
              right weighting, and whether it settles the question, is what the final section
              takes up.
            </p>
          </Reading>
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
