import { content } from "../content";
import { CumulativePointsChart, OutputBars } from "../components/charts";
import { InfoTip, Reveal, Rich, Section, seasonClass } from "../components/ui";
import type { MatchRow, SeasonSummary } from "../types";

const t = content.a;

function TeamCard({ s }: { s: SeasonSummary }) {
  const cls = seasonClass(s.season);
  const rows: [string, string | number][] = [
    ["Record (W-D-L)", `${s.wins}-${s.draws}-${s.losses}`],
    ["Goals for / against", `${s.goals_for} / ${s.goals_against}`],
    ["Goal difference", (s.goal_difference > 0 ? "+" : "") + s.goal_difference],
    ["xG for / against", `${s.xg_for} / ${s.xg_against}`],
    ["Points per game", s.ppg.toFixed(2)],
  ];
  return (
    <div className={`card team-card ${cls}`}>
      <span className="rail" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="season-tag">{s.season}</span>
        {s.unbeaten && <span className="season-tag">UNBEATEN</span>}
      </div>
      <div className="big-num" style={{ margin: "6px 0 2px" }}>
        {s.points}
      </div>
      <div className="dim" style={{ marginBottom: 14, fontSize: 14 }}>
        league points
      </div>
      {rows.map(([k, v]) => (
        <div className="statline" key={k}>
          <span className="k">{k}</span>
          <span className="v">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionA({
  seasons,
  matches,
}: {
  seasons: SeasonSummary[];
  matches: MatchRow[];
}) {
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  return (
    <Section id="section-a" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">
          <Rich>{t.lead}</Rich>
        </p>
        <p className="pivot-line">{t.pivot}</p>
      </Reveal>

      <Reveal delay={100}>
        <div className="grid2" style={{ margin: "22px 0" }}>
          <TeamCard s={s0} />
          <TeamCard s={s1} />
        </div>
      </Reveal>

      <Reveal delay={70}>
        <p className="narrow" style={{ margin: "6px auto 14px" }}>
          {t.cumeLeadIn}
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card" style={{ marginBottom: 18 }}>
          <p className="chart-title">{t.cumeTitle}</p>
          <p className="chart-sub">{t.cumeCaption}</p>
          <CumulativePointsChart matches={matches} />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chart-card">
          <div className="chart-head-row">
            <p className="chart-title" style={{ margin: 0 }}>
              {t.xgTitle}
            </p>
            <InfoTip label="What these terms mean">
              <Rich>{t.xgInfo}</Rich>
            </InfoTip>
          </div>
          <p className="chart-sub">{t.xgSub}</p>
          <OutputBars seasons={seasons} />
          <p className="chart-note">{t.xgNote}</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <p className="narrow" style={{ margin: "22px auto" }}>
          <Rich>{t.link}</Rich>
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="forces">
          <h3 className="forces-h">{t.forcesHeading}</h3>
          <p className="forces-lead narrow">{t.forcesLead}</p>

          <div className="forces-diagram">
            <div className="forces-inputs">
              <div className="force-box outside">
                <span className="force-tag">{t.forceOutsideTag}</span>
                <p className="force-name">{t.forceOutsideName}</p>
                <p className="force-desc">{t.forceOutsideDesc}</p>
              </div>
              <span className="forces-plus" aria-hidden="true">
                +
              </span>
              <div className="force-box inside">
                <span className="force-tag">{t.forceInsideTag}</span>
                <p className="force-name">{t.forceInsideName}</p>
                <p className="force-desc">{t.forceInsideDesc}</p>
              </div>
            </div>
            <div className="forces-down" aria-hidden="true">
              ↓
            </div>
            <div className="force-box outcome">
              <p className="force-name">{t.forceOutcome}</p>
            </div>
          </div>

          <p className="narrow dim handoff" style={{ marginTop: 24 }}>
            {t.forcesHandoff}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
