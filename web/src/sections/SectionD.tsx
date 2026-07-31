import { content } from "../content";
import { ArsenalCombinedChart, ArsenalWeightingTool } from "../components/charts";
import { CategoryBadge, Reveal, Section } from "../components/ui";
import type { SynthesisD } from "../types";

const t = content.d;

export function SectionD({ synthesisD }: { synthesisD: SynthesisD }) {
  const sd = synthesisD;

  return (
    <Section id="section-d" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      {/* The difficulty synthesis: raw components -> tunable weighting -> live score */}
      <Reveal delay={60}>
        <div className="card sublayer">
          <div className="sublayer-head">
            <h3>{t.synthTitle}</h3>
            <CategoryBadge category="model" />
          </div>
          <ArsenalCombinedChart combined={sd.arsenal_combined} />

          <p style={{ marginTop: 20 }}>{t.weightIntro}</p>
          <ArsenalWeightingTool combined={sd.arsenal_combined} />
          <p className="chart-note">{t.weightNote}</p>
        </div>
      </Reveal>
    </Section>
  );
}
