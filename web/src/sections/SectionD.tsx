import { content } from "../content";
import { ArsenalCombinedChart, SynthesisScatter } from "../components/charts";
import { CategoryBadge, LimitationNote, Reveal, Rich, Section } from "../components/ui";
import type { SynthesisD } from "../types";

const t = content.d;

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

  return (
    <Section id="section-d" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      {/* D1 - peer scatter (outside force only, all clubs) */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.p1Title}</h3>
            <CategoryBadge category="model" />
          </div>
          <p>
            <Rich>{t.p1Body}</Rich>
          </p>
          <SynthesisScatter clubs={sd.peer.clubs} />
          <p className="chart-sub" style={{ marginTop: 10 }}>
            {t.scatterSub}
          </p>
          <Reading>
            {t.p1Reading.map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? "8px 0 0" : "12px 0 0" }}>
                <Rich>{para}</Rich>
              </p>
            ))}
          </Reading>
        </div>
      </Reveal>

      {/* D2 - Arsenal full two-force method */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.p2Title}</h3>
            <CategoryBadge category="model" />
          </div>
          <p>
            <Rich>{t.p2Body}</Rich>
          </p>
          <ArsenalCombinedChart combined={sd.arsenal_combined} />
          <p className="chart-sub" style={{ marginTop: 10 }}>
            {t.combinedSub}
          </p>

          <aside className="maths-aside">
            <p className="maths-label">{t.recipeLabel}</p>
            <p className="maths-body">{t.recipeBody}</p>
          </aside>
          <Reading>
            <p style={{ margin: "8px 0 0" }}>{t.p2Reading}</p>
          </Reading>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <LimitationNote>{t.limitation}</LimitationNote>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow dim handoff">{t.handoff}</p>
      </Reveal>
    </Section>
  );
}
