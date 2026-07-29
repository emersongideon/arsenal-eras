import { CategoryBadge, Reveal, Section } from "../components/ui";
import type {
  Circumstances,
  Physical,
  SeasonSummary,
  Synthesis,
  SynthesisD,
} from "../types";

type FromRef = [label: string, anchor: string];

function FromCell({ refs }: { refs: FromRef[] }) {
  return (
    <>
      {refs.map(([label, anchor], i) => (
        <span key={anchor}>
          {i > 0 && " / "}
          <a href={`#${anchor}`}>{label}</a>
        </span>
      ))}
    </>
  );
}

export function Conclusion({
  synth,
  physical,
  circumstances,
  synthesisD,
  seasons,
}: {
  synth: Synthesis;
  physical: Physical;
  circumstances: Circumstances;
  synthesisD: SynthesisD;
  seasons: SeasonSummary[];
}) {
  const s = synth.by_season;
  const st = circumstances.squad_stability.by_season;
  const age = physical.squad_age.by_season;
  const fc = physical.fixture_congestion.by_season;
  const sd = synthesisD.arsenal_combined.by_era;
  const s0 = seasons.find((x) => x.season === "2003/04")!;
  const s1 = seasons.find((x) => x.season === "2025/26")!;

  const A: FromRef[] = [["A", "section-a"]];
  const AB: FromRef[] = [["A", "section-a"], ["B", "section-b"]];
  const B: FromRef[] = [["B", "section-b"]];
  const C: FromRef[] = [["C", "section-c"]];
  const D: FromRef[] = [["D", "section-d"]];

  const rows: { dim: string; a: string; b: string; from: FromRef[]; hi?: boolean }[] = [
    { dim: "Final position / dominance", a: `${s0.points} pts, unbeaten`, b: `${s1.points} pts, ${s1.losses} losses`, from: A },
    { dim: "Winning margin over 2nd", a: `${s["2003/04"].margin_to_second} pts`, b: `${s["2025/26"].margin_to_second} pts`, from: AB },
    { dim: "Title-race pressure (own era)", a: `${s["2003/04"].pressure_index}`, b: `${s["2025/26"].pressure_index}`, from: B },
    { dim: "Squad retained", a: `${s["2003/04"].retention_pct.toFixed(1)}%`, b: `${s["2025/26"].retention_pct.toFixed(1)}%`, from: B },
    { dim: "Minutes-weighted departures", a: `${st["2003/04"].departed_minutes_pct}%`, b: `${st["2025/26"].departed_minutes_pct}%`, from: B },
    { dim: "Squad age (minutes-weighted)", a: `${age["2003/04"].minutes_weighted_age}`, b: `${age["2025/26"].minutes_weighted_age}`, from: C },
    { dim: "Short-rest games", a: `${fc["2003/04"].short_rest_count} of ${fc["2003/04"].total_games}`, b: `${fc["2025/26"].short_rest_count} of ${fc["2025/26"].total_games}`, from: C },
    { dim: "Points under congestion", a: "held (no drop)", b: "held (no drop)", from: C },
    { dim: "Model over-performance", a: `+${s["2003/04"].points_over_expected}`, b: `+${s["2025/26"].points_over_expected}`, from: D },
    { dim: "Combined difficulty (equal weight)", a: sd["2003/04"].difficulty.toFixed(2), b: sd["2025/26"].difficulty.toFixed(2), from: D, hi: true },
  ];

  return (
    <Section id="section-e" eyebrow="Section E · What this surfaces">
      <Reveal>
        <h2>The verdict</h2>
        <p className="lead narrow">
          Everything the report measured, in one place, and then a call, marked clearly as
          a judgement rather than a finding.
        </p>
      </Reveal>

      {/* E.1 - the contrast table */}
      <Reveal delay={70}>
        <div className="tbl-wrap" style={{ marginTop: 22 }}>
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Dimension of difficulty</th>
                <th className="s0304">2003/04</th>
                <th className="s2526">2025/26</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dim} className={r.hi ? "hi" : ""}>
                  <td>{r.dim}</td>
                  <td className="ta-c">{r.a}</td>
                  <td className="ta-c">{r.b}</td>
                  <td className="ta-c">
                    <FromCell refs={r.from} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
            Each row links back to the section it came from.
          </p>
        </div>
      </Reveal>

      {/* E.2 - the model's even-handed result */}
      <Reveal delay={70}>
        <h3 style={{ marginTop: 30 }}>What the model concludes, weighted evenly</h3>
        <p className="narrow">
          Weighted evenly, the model reaches a clear answer: 2025/26 faced the harder task.
          It won against a tighter field, with a less settled squad, across a more congested
          calendar, and its combined difficulty score ({sd["2025/26"].difficulty.toFixed(2)}
          ) sits well above 2003/04&rsquo;s ({sd["2003/04"].difficulty.toFixed(2)}). Two of
          the three forces point the same way. If difficulty is the even-weighted sum of
          these forces, 2025/26 is the harder title.
        </p>
      </Reveal>

      {/* E.3 - the human verdict, clearly a view */}
      <Reveal delay={70}>
        <h3 style={{ marginTop: 30 }}>The verdict, and it is a view</h3>
        <div className="reading" style={{ marginTop: 10 }}>
          <CategoryBadge category="interpretation" />
          <p style={{ margin: "8px 0 0" }}>
            Here I will step in with a view, and mark it clearly as a view, not a finding.
            The model weights the three forces equally. I do not. To me, going unbeaten
            across all 38 games is not one force among several to be averaged in; it is a
            different category of hard. It allows no margin. One poor afternoon anywhere
            across nine months ends it, and no side has managed it since. A high combined
            difficulty score reflects a season that was demanding on average; an unbeaten
            season reflects one that was unforgiving at every single step. By the weighting I
            find most convincing, that makes 2003/04 the harder task.
          </p>
          <p style={{ margin: "12px 0 0" }}>
            I want to be honest about what that is. It is a judgement about what to weight,
            not a correction of the model. The even-handed reading points to 2025/26, and
            anyone who weights the three forces as the model does, rather than singling out
            the unbeaten run as I have, would reasonably conclude 2025/26 was harder. The
            data lays out the trade-off cleanly; which way it tips depends on the one choice
            the data cannot make for you, and I have made mine.
          </p>
        </div>
      </Reveal>

      {/* E.4 - where this goes next */}
      <Reveal delay={80}>
        <div className="method narrow" style={{ marginTop: 30 }}>
          <strong>Where this goes next.</strong>
          <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
            <li>
              Run the pressure index and squad-stability measures across every past title
              race, building a season-difficulty baseline any campaign can be judged against.
            </li>
            <li>
              Point the squad-stability read forward, estimating how much a summer of heavy
              signings might cost in points before a new group settles.
            </li>
            <li>
              Extend the peer scatter&rsquo;s inside-force axis once league-wide squad and
              fixture data is sourced, placing any club fully on both forces.
            </li>
            <li>
              And with richer data there are further factors, opponent-adjusted strength and
              match-state among them, that the model could fold in from here.
            </li>
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
