import { content } from "../content";
import { PressureWorkedExample } from "../components/charts";
import { CategoryBadge, Reveal, Rich, Section } from "../components/ui";
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
          <p>
            <Rich>{t.p1Body}</Rich>
          </p>

          <aside className="maths-aside">
            <p className="maths-label">{t.mathsLabel}</p>
            <p className="maths-body">
              <Rich>{t.mathsBody}</Rich>
            </p>
          </aside>

          <p className="chart-title" style={{ marginTop: 22 }}>
            {t.workedTitle}
          </p>
          <p className="chart-sub">{t.workedSub}</p>
          <PressureWorkedExample weekly={c.field_strength.weekly} note={t.workedNote} />

          <Reading>{t.p1Reading}</Reading>
        </div>
      </Reveal>
    </Section>
  );
}
