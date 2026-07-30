import { content } from "../content";
import {
  CongestionPpgChart,
  CongestionTimeline,
  RestGapChart,
  SquadAgeScatter,
  SquadStabilityChart,
} from "../components/charts";
import {
  CategoryBadge,
  Collapsible,
  LimitationNote,
  Reveal,
  Rich,
  Section,
} from "../components/ui";
import type { Circumstances, Congestion, Physical } from "../types";

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

export function SectionC({
  c,
  p,
  congestion,
}: {
  c: Circumstances;
  p: Physical;
  congestion: Congestion;
}) {
  const stab = c.squad_stability.by_season;
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

      {/* C1 - squad stability (moved from Section B) */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.stabTitle}</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>{t.stabBody1}</p>
          <p>
            <Rich>{t.stabBody2}</Rich>
          </p>
          <SquadStabilityChart bySeason={stab} />
          <LimitationNote>{t.stabLimitation}</LimitationNote>
          <Reading>{t.stabReading}</Reading>
        </div>
      </Reveal>

      {/* C2 - squad age */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.ageTitle}</h3>
            <CategoryBadge category="measured" />
          </div>
          <p>{t.ageBody1}</p>
          <p>
            <Rich>{t.ageBody2}</Rich>
          </p>
          <SquadAgeScatter bySeason={age} />
          <Reading>{t.ageReading}</Reading>
        </div>
      </Reveal>

      {/* Demoted: the fixture calendar, explored but inconclusive, collapsed by default */}
      <Reveal delay={60}>
        <Collapsible summary={t.calHeader}>
          <p style={{ marginTop: 14 }}>{t.calLead}</p>
          <p>{t.congBody1}</p>
          <p>
            <Rich>{t.congBody2}</Rich>
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

          <LimitationNote>{t.calGpsLimitation}</LimitationNote>
          <Reading>{t.calClosing}</Reading>
        </Collapsible>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">{t.handoff}</p>
      </Reveal>
    </Section>
  );
}
