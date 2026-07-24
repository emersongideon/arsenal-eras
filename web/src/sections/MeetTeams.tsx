import { CategoryBadge, Reveal, Section, seasonClass } from "../components/ui";
import type { SeasonSummary } from "../types";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="season-tag">{s.season}</span>
        {s.unbeaten && <span className="season-tag">UNBEATEN</span>}
      </div>
      <div className="big-num" style={{ margin: "6px 0 2px" }}>{s.points}</div>
      <div className="dim" style={{ marginBottom: 14, fontSize: 14 }}>league points</div>
      {rows.map(([k, v]) => (
        <div className="statline" key={k}>
          <span className="k">{k}</span>
          <span className="v">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function MeetTeams({ seasons }: { seasons: SeasonSummary[] }) {
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  return (
    <Section id="meet" eyebrow="Meet the teams">
      <Reveal>
        <h2>Five points apart on paper. Worlds apart in style.</h2>
        <p className="lead narrow" style={{ margin: "0 0 8px" }}>
          Let the raw contrast breathe. The 2003/04 side never lost; the 2025/26
          side lost five and still won comfortably - because everyone behind them
          was further back. Same club, same colour, two very different title runs.
        </p>
      </Reveal>
      <Reveal delay={80}>
        <div style={{ margin: "18px 0 22px" }}>
          <CategoryBadge category="fact" />
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="grid2">
          <TeamCard s={s0} />
          <TeamCard s={s1} />
        </div>
      </Reveal>
    </Section>
  );
}
