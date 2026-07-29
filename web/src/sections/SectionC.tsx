import { content } from "../content";
import {
  CongestionPpgChart,
  CongestionTimeline,
  RestGapChart,
  SquadAgeScatter,
} from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Rich, Section } from "../components/ui";
import type { Congestion, Physical } from "../types";

const t = content.c;

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

export function SectionC({ p, congestion }: { p: Physical; congestion: Congestion }) {
  const age = p.squad_age.by_season;
  const fc = p.fixture_congestion.by_season;
  const cg = congestion.by_season;
  return (
    <Section
      id="section-c"
      eyebrow={t.eyebrow}
      style={{
        background: "#eef1f6",
        borderTop: "1px solid #dfe3ea",
        borderBottom: "1px solid #dfe3ea",
      }}
    >
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      {/* C1 - squad age */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.p1Title}</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>{t.p1Body1}</p>
          <p>
            <Rich>{t.p1Body2}</Rich>
          </p>
          <SquadAgeScatter bySeason={age} />
          <Reading>{t.p1Reading}</Reading>
        </div>
      </Reveal>

      {/* C2 - fixture congestion */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.p2Title}</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>{t.p2Body1}</p>
          <p>
            <Rich>{t.p2Body2}</Rich>
          </p>

          <p className="chart-title" style={{ marginTop: 6 }}>
            {t.restTitle}
          </p>
          <p className="chart-sub">{t.restSub}</p>
          <RestGapChart bySeason={fc} />

          <div className="callout">
            <p className="callout-eyebrow">{t.calloutLabel}</p>
            <p className="callout-body">
              <Rich>{t.calloutBody}</Rich>
            </p>
          </div>

          <p className="chart-title" style={{ marginTop: 20 }}>
            {t.timelineTitle}
          </p>
          <p className="chart-sub">{t.timelineSub}</p>
          <CongestionTimeline bySeason={fc} />

          {/* closing beat of part 2: did the compressed schedule cost points? */}
          <p className="chart-title" style={{ marginTop: 22 }}>
            {t.ppgBeatTitle}
          </p>
          <p className="chart-sub">{t.ppgBeatSub}</p>
          <div className="chart-card" style={{ margin: "8px 0 6px" }}>
            <p className="chart-title" style={{ margin: "0 6px 2px" }}>
              {t.ppgChartTitle}
            </p>
            <p className="chart-sub">{t.ppgChartSub}</p>
            <CongestionPpgChart bySeason={cg} />
            <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
              {t.ppgSample}
            </p>
          </div>
          <Reading>{t.p2Reading}</Reading>
        </div>
      </Reveal>

      {/* Methodological note - the gap stated, not filled */}
      <Reveal delay={60}>
        <LimitationNote>{t.limitation}</LimitationNote>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">{t.handoff}</p>
      </Reveal>
    </Section>
  );
}
