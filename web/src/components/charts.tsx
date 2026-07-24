import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { MatchRow, ModelResult, Season, SeasonSummary } from "../types";
import { SEASON_COLOR } from "./ui";

const GOLD = SEASON_COLOR["2003/04"];
const RED = SEASON_COLOR["2025/26"];
const AXIS = "#5e6772"; // WCAG AA for axis tick/label text on white
const GRID = "#eceef1";

/** Act 1 - cumulative points across the 38-game league season (a "title race"). */
export function CumulativePointsChart({ matches }: { matches: MatchRow[] }) {
  const byWeek: Record<number, any> = {};
  for (const m of matches) {
    const w = m.match_no;
    byWeek[w] = byWeek[w] || { match_no: w };
    byWeek[w][m.season] = m.cum_points;
  }
  const data = Object.values(byWeek).sort((a: any, b: any) => a.match_no - b.match_no);
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: -8 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis dataKey="match_no" stroke={AXIS} tick={{ fontSize: 12 }}
          label={{ value: "Matchweek", position: "bottom", offset: 8, fill: AXIS, fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={ttStyle} />
        <Legend verticalAlign="top" height={30} />
        <Line type="monotone" dataKey="2003/04" stroke={GOLD} strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="2025/26" stroke={RED} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Act 1 - attacking & defensive output, goals vs xG, both seasons. */
export function OutputBars({ seasons }: { seasons: SeasonSummary[] }) {
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  const data = [
    { metric: "Goals for", "2003/04": s0.goals_for, "2025/26": s1.goals_for },
    { metric: "xG for", "2003/04": s0.xg_for, "2025/26": s1.xg_for },
    { metric: "Goals against", "2003/04": s0.goals_against, "2025/26": s1.goals_against },
    { metric: "xG against", "2003/04": s0.xg_against, "2025/26": s1.xg_against },
  ];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="metric" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <Bar dataKey="2003/04" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="2025/26" fill={RED} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Act 2 - actual vs model-expected points, both seasons. The measured core. */
export function ExpectedPointsChart({ model }: { model: Record<Season, ModelResult> }) {
  const data = (Object.keys(model) as Season[]).map((s) => ({
    season: s,
    Actual: model[s].actual_points,
    Expected: model[s].expected_points,
  }));
  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} domain={[0, 100]} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <Bar dataKey="Expected" fill="#9aa4b2" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.season} fill={SEASON_COLOR[d.season]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Act 2 - per-match xG-for vs xG-against, one season, coloured by result. */
export function MatchXgScatter({ res }: { res: ModelResult }) {
  // Accessible W/D/L colours (each >=5:1 on white, so they double as legend text).
  const color = (r: string) => (r === "W" ? "#15803d" : r === "D" ? "#b45309" : "#c0392b");
  const data = res.matches.map((m) => ({
    xgf: m.xgf, xga: m.xga, opponent: m.opponent, result: m.result,
    score: `${m.gf}-${m.ga}`, xpts: m.xpts,
  }));
  const max = Math.ceil(Math.max(...data.flatMap((d) => [d.xgf, d.xga])) + 0.5);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 18, bottom: 28, left: -4 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis type="number" dataKey="xgf" name="xG for" domain={[0, max]} stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{ value: "xG created", position: "bottom", offset: 10, fill: AXIS, fontSize: 12 }} />
        <YAxis type="number" dataKey="xga" name="xG against" domain={[0, max]} stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{ value: "xG conceded", angle: -90, position: "insideLeft", offset: 14, fill: AXIS, fontSize: 12 }} />
        <ZAxis range={[70, 70]} />
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: max, y: max }]}
          stroke="#c4c8cc" strokeDasharray="6 6" />
        <Tooltip content={<XgScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={color(d.result)} fillOpacity={0.85} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/** Act 3b - fixture load stacked by competition. */
export function FixtureLoadChart({
  byComp,
}: {
  byComp: Record<Season, Record<string, number>>;
}) {
  const comps = ["Premier League", "FA Cup", "League Cup", "Champions League", "Community Shield"];
  const colors: Record<string, string> = {
    "Premier League": "#374151", "FA Cup": "#6b7280", "League Cup": "#9ca3af",
    "Champions League": "#2354d6", "Community Shield": "#c9ced6",
  };
  const data = (Object.keys(byComp) as Season[]).map((s) => {
    const row: any = { season: s };
    for (const c of comps) row[c] = byComp[s][c] ?? 0;
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} width={72} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        {comps.map((c, i) => (
          <Bar key={c} dataKey={c} stackId="a" fill={colors[c]}
            radius={i === comps.length - 1 ? [0, 4, 4, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Act 3c - points-per-game vs bottom-half and top rivals. */
export function ScheduleDifficultyChart({
  bySeason,
}: {
  bySeason: Record<Season, { ppg_vs_bottom_half: number; ppg_vs_top_rivals: number }>;
}) {
  const data = [
    {
      bucket: "vs bottom half (11-20)",
      "2003/04": bySeason["2003/04"].ppg_vs_bottom_half,
      "2025/26": bySeason["2025/26"].ppg_vs_bottom_half,
    },
    {
      bucket: "vs top rivals (2-6)",
      "2003/04": bySeason["2003/04"].ppg_vs_top_rivals,
      "2025/26": bySeason["2025/26"].ppg_vs_top_rivals,
    },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="bucket" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} domain={[0, 3]}
          label={{ value: "points / game", angle: -90, position: "insideLeft", offset: 16, fill: AXIS, fontSize: 12 }} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <Bar dataKey="2003/04" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="2025/26" fill={RED} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Act 4 - the speculative adjusted-points band, driven by the slider. */
export function RangeBar({
  low, high, base, absMin = 70, absMax = 95,
}: {
  low: number; high: number; base: number; absMin?: number; absMax?: number;
}) {
  const span = absMax - absMin;
  const pct = (v: number) => ((v - absMin) / span) * 100;
  return (
    <div style={{ margin: "10px 0 4px" }}>
      <div style={{ position: "relative", height: 54 }}>
        <div style={{
          position: "absolute", top: 22, left: 0, right: 0, height: 10,
          borderRadius: 6, background: "#eef0f3",
        }} />
        <div style={{
          position: "absolute", top: 22, height: 10, borderRadius: 6,
          left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%`,
          background: "linear-gradient(90deg,#e6a256,#b4550a)",
        }} />
        {/* Invincibles' actual points marker */}
        <div title={`Actual 2003/04: ${base} pts`} style={{
          position: "absolute", top: 12, left: `${pct(base)}%`, transform: "translateX(-50%)",
          width: 2, height: 30, background: "#12151b",
        }} />
        <div style={{
          position: "absolute", top: 0, left: `${pct(base)}%`, transform: "translateX(-50%)",
          fontSize: 11, color: "#12151b", fontWeight: 700, whiteSpace: "nowrap",
        }}>actual 90</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5e6772" }}>
        <span>{absMin}</span><span>{absMax} pts</span>
      </div>
    </div>
  );
}

const ttStyle: React.CSSProperties = {
  borderRadius: 10, border: "1px solid #e5e8ec", fontSize: 13,
  boxShadow: "0 8px 28px rgba(16,24,40,.10)",
};

function XgScatterTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tt">
      <strong>{d.opponent}</strong> · {d.score} ({d.result})
      <div>xG for {d.xgf.toFixed(2)} · xG against {d.xga.toFixed(2)}</div>
      <div>expected points {d.xpts.toFixed(2)}</div>
    </div>
  );
}
