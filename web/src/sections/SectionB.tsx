import { content } from "../content";
import {
  PressureRobustnessChart,
  SquadStabilityChart,
  TauExplainer,
} from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Rich, Section } from "../components/ui";
import type { Circumstances } from "../types";

const t = content.b;

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

export function SectionB({ c }: { c: Circumstances }) {
  const ct = c.squad_stability.by_season;

  return (
    <Section id="section-b" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      {/* B1 - title-race pressure index */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.p1Title}</h3>
            <CategoryBadge category="model" />
          </div>
          <p>{t.p1Body}</p>

          <aside className="maths-aside">
            <p className="maths-label">{t.mathsLabel}</p>
            <p className="maths-body">
              <Rich>{t.mathsBody}</Rich>
            </p>
          </aside>

          <p className="chart-title" style={{ marginTop: 20 }}>
            {t.tauTitle}
          </p>
          <p className="chart-sub">
            <Rich>{t.tauSub}</Rich>
          </p>
          <TauExplainer />

          <p className="chart-title" style={{ marginTop: 22 }}>
            {t.sweepTitle}
          </p>
          <p className="chart-sub">{t.sweepSub}</p>
          <PressureRobustnessChart sweep={c.field_strength.sweep} />
          <Reading>{t.p1Reading}</Reading>
        </div>
      </Reveal>

      {/* B2 - squad stability */}
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
          <SquadStabilityChart bySeason={ct} />
          <LimitationNote>{t.p2Limitation}</LimitationNote>
          <Reading>{t.p2Reading}</Reading>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">{t.handoff}</p>
      </Reveal>
    </Section>
  );
}
