import { content } from "../content";
import { CumulativePointsChart } from "../components/charts";
import { Reveal, Rich, Section, seasonClass } from "../components/ui";
import type { SeasonSummary } from "../types";
import type { MatchRow } from "../types";

const t = content.a;

type Lead = 0 | 1 | null;

function TeamCard({
  s,
  idx,
  leaders,
}: {
  s: SeasonSummary;
  idx: 0 | 1;
  leaders: Record<string, Lead>;
}) {
  const cls = seasonClass(s.season);
  const rows: [string, string, string][] = [
    ["record", "Record (W-D-L)", `${s.wins}-${s.draws}-${s.losses}`],
    ["goals", "Goals for / against", `${s.goals_for} / ${s.goals_against}`],
    ["gd", "Goal difference", (s.goal_difference > 0 ? "+" : "") + s.goal_difference],
    ["xg", "xG for / against", `${s.xg_for} / ${s.xg_against}`],
    ["ppg", "Points per game", s.ppg.toFixed(2)],
  ];
  const pointsWin = leaders.points === idx;
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
      <div className={`big-num ${pointsWin ? "win" : ""}`} style={{ margin: "6px 0 2px" }}>
        {s.points}
      </div>
      <div className="dim" style={{ marginBottom: 14, fontSize: 14 }}>
        league points
        {pointsWin && <span className="lead-tag">▲ higher</span>}
      </div>
      {rows.map(([k, label, v]) => {
        const win = leaders[k] === idx;
        return (
          <div className="statline" key={k}>
            <span className="k">{label}</span>
            <span className={`v ${win ? "win" : ""}`}>
              {win && (
                <span className="win-mark" aria-hidden="true">
                  ▲
                </span>
              )}
              {v}
            </span>
          </div>
        );
      })}
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

  // Which season leads each dominance metric (0 = 2003/04, 1 = 2025/26, null = tie).
  // xG is left neutral: it is a model estimate, only compared within a season.
  const higher = (a: number, b: number): Lead => (a === b ? null : a > b ? 0 : 1);
  const lower = (a: number, b: number): Lead => (a === b ? null : a < b ? 0 : 1);
  const goals: Lead =
    s0.goals_for >= s1.goals_for && s0.goals_against <= s1.goals_against
      ? 0
      : s1.goals_for >= s0.goals_for && s1.goals_against <= s0.goals_against
        ? 1
        : null;
  const leaders: Record<string, Lead> = {
    points: higher(s0.points, s1.points),
    record: lower(s0.losses, s1.losses), // fewer losses = more dominant (unbeaten)
    goals,
    gd: higher(s0.goal_difference, s1.goal_difference),
    xg: null,
    ppg: higher(s0.ppg, s1.ppg),
  };

  return (
    <Section id="section-a" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">
          <Rich>{t.lead}</Rich>
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="grid2" style={{ margin: "22px 0 6px" }}>
          <TeamCard s={s0} idx={0} leaders={leaders} />
          <TeamCard s={s1} idx={1} leaders={leaders} />
        </div>
        <p className="dim narrow" style={{ fontSize: 13, textAlign: "center" }}>
          ▲ marks the higher figure. On every dominance measure, 2003/04 leads. (xG is a
          model estimate, read within a season, so it is not marked.)
        </p>
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

      <Reveal delay={60}>
        <p className="narrow" style={{ margin: "22px auto" }}>
          <Rich>{t.link}</Rich>
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="forces">
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
