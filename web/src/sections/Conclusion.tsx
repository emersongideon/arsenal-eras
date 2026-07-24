import { Reveal, Section } from "../components/ui";
import type { ModelResult, Season } from "../types";

export function Conclusion({ model }: { model: Record<Season, ModelResult> }) {
  return (
    <Section id="conclusion" eyebrow="So - which era was harder?">
      <Reveal>
        <h2>It depends on what you value. Honestly.</h2>
        <p className="lead narrow">
          The data doesn't crown a winner, and it would be dishonest to pretend it
          does. Here's the fair version of each case.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="verdict" style={{ marginTop: 26 }}>
          <div className="col s0304">
            <h3 style={{ color: "#a97e17" }}>The case for 2003/04</h3>
            <ul>
              <li><b>Zero defeats in 38.</b> The hardest thing to do in football is
                not lose, ever. Nobody has done it since.</li>
              <li><b>Excellent against everyone.</b> ~2.4 PPG against the top rivals,
                barely dropping off against the rest - no soft points, no easy nights.</li>
              <li><b>Out-finished its xG</b> by double figures: elite quality, not just
                elite volume.</li>
              <li>Beat its expected points by <b>{model["2003/04"].points_over_expected}</b> -
                the bigger over-performance of the two.</li>
            </ul>
          </div>
          <div className="col s2526">
            <h3 style={{ color: "#ef0107" }}>The case for 2025/26</h3>
            <ul>
              <li><b>A heavier, faster schedule:</b> {" "}63 competitive games and 15
                European nights, in a deeper, more physical, more scrutinised league.</li>
              <li><b>VAR-era margins:</b> every tight call reviewed, every offside toe
                measured - pressure the 2003/04 side never faced.</li>
              <li><b>Ruthless where it mattered:</b> dropped just a handful of points to
                the bottom half, and still cleared the field by seven.</li>
              <li>Won without its best attacking xG translating into goals - a title
                built on control and defence.</li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="narrow" style={{ marginTop: 30 }}>
          <p>
            <b>The honest takeaway.</b> If "hardest" means <i>sustained perfection</i>,
            2003/04 wins - going unbeaten is a category of difficulty all its own. If
            "hardest" means <i>the toughest environment to win 85 points in</i> - more
            games, deeper opposition, unforgiving officiating - then 2025/26 has the
            better claim than the bare table suggests.
          </p>
          <p className="dim">
            What the model <em>can</em> say cleanly: both were genuine champions who
            beat their expected points, by similar margins, via opposite methods -
            one by finishing, one by defending and holding its nerve. The rest is a
            values judgement, and it should stay one.
          </p>
          <p style={{ marginTop: 18, fontStyle: "italic" }}>
            And the personal footnote the model isn't allowed to have: as an Arsenal
            fan, both title-winning seasons are sweet. But 2003/04 is the one that made
            me a fan in the first place, so I know which way my heart votes even if the
            numbers won't.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
