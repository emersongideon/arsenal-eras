import { useId, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type {
  Circumstances,
  Congestion,
  MatchRow,
  ModelResult,
  Physical,
  Season,
  SeasonSummary,
  SynthesisD,
} from "../types";
import { InfoTip, SEASON_COLOR } from "./ui";

const GOLD = SEASON_COLOR["2003/04"];
const RED = SEASON_COLOR["2025/26"];
const AXIS = "#5e6772"; // WCAG AA for axis tick/label text on white
const GRID = "#eceef1";

const ttStyle: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid #e5e8ec",
  fontSize: 13,
  boxShadow: "0 8px 28px rgba(16,24,40,.10)",
};

// ===========================================================================
// Section A - the surface
// ===========================================================================

/** Cumulative league points across the 38-game season (the "title race"). The
 *  2025/26 line marks its 5 defeats as dots, so the reader can see where the flat
 *  steps (games that brought no points) fell; 2003/04, unbeaten, has none. */
export function CumulativePointsChart({ matches }: { matches: MatchRow[] }) {
  type WeekRow = { match_no: number } & Partial<Record<Season, number>>;
  const byWeek: Record<number, WeekRow> = {};
  for (const m of matches) {
    const w = m.match_no;
    byWeek[w] = byWeek[w] || { match_no: w };
    byWeek[w][m.season] = m.cum_points;
  }
  const data = Object.values(byWeek).sort((a, b) => a.match_no - b.match_no);
  const losses2526 = new Set(
    matches.filter((m) => m.season === "2025/26" && m.result === "L").map((m) => m.match_no)
  );
  const lossDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { match_no: number };
  }) => {
    const mw = props.payload?.match_no;
    if (mw != null && losses2526.has(mw) && props.cx != null && props.cy != null) {
      return (
        <circle
          key={`loss-${mw}`}
          cx={props.cx}
          cy={props.cy}
          r={5}
          fill={RED}
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return <g key={`n-${mw}`} />;
  };
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: -8 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          dataKey="match_no"
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          label={{
            value: "Matchweek",
            position: "bottom",
            offset: 8,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={ttStyle} />
        <Legend verticalAlign="top" height={30} />
        <Line
          type="monotone"
          dataKey="2003/04"
          stroke={GOLD}
          strokeWidth={3}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="2025/26"
          stroke={RED}
          strokeWidth={3}
          dot={lossDot}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Attacking & defensive output: goals vs xG. Grouped BY SEASON so the season is
 *  read straight off the x-axis (not distinguished by colour alone); the four
 *  metrics are colour-coded (greens = attack, oranges = defence; solid = actual,
 *  pale = expected) and every bar is labelled with its value. */
export function OutputBars({ seasons }: { seasons: SeasonSummary[] }) {
  const s0 = seasons.find((s) => s.season === "2003/04")!;
  const s1 = seasons.find((s) => s.season === "2025/26")!;
  const row = (s: SeasonSummary) => ({
    season: s.season,
    "Goals for": s.goals_for,
    "xG for": s.xg_for,
    "Goals against": s.goals_against,
    "xG against": s.xg_against,
  });
  const data = [row(s0), row(s1)]; // 2003/04 first (leftmost)
  const fmt = (v: number | string) =>
    Number.isInteger(Number(v)) ? String(v) : Number(v).toFixed(1);
  const bars: [string, string][] = [
    ["Goals for", "#2f6f4f"],
    ["xG for", "#9fc9b4"],
    ["Goals against", "#b4550a"],
    ["xG against", "#e3b483"],
  ];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 22, right: 16, bottom: 8, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        {bars.map(([key, fill]) => (
          <Bar key={key} dataKey={key} fill={fill} radius={[3, 3, 0, 0]}>
            <LabelList dataKey={key} position="top" formatter={fmt} fontSize={11} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===========================================================================
// Section B - circumstances
// ===========================================================================

const ORDINALS = ["2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

/** Title-race pressure by finishing position: each rival's exp(-gap/tau) weight,
 *  both seasons. A higher, slower-decaying curve = a more pressured title. */
export function FieldPressureChart({
  bySeason,
}: {
  bySeason: Circumstances["field_strength"]["by_season"];
}) {
  const n = ORDINALS.length; // top rivals (2nd..9th); the tail is ~0
  const data = Array.from({ length: n }, (_, i) => ({
    label: ORDINALS[i],
    "2003/04": bySeason["2003/04"].contributions[i].pressure,
    "2025/26": bySeason["2025/26"].contributions[i].pressure,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: -8 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          label={{
            value: "rival's finishing position",
            position: "bottom",
            offset: 6,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <YAxis
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          domain={[0, 0.55]}
          label={{
            value: "pressure weight",
            angle: -90,
            position: "insideLeft",
            offset: 14,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <Bar dataKey="2003/04" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="2025/26" fill={RED} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Intuition-builder for tau: how a single rival's weight falls off as its
 *  points-gap grows, for a low tau vs a high tau. Not season data - two example
 *  decay curves so the reader grasps "tau = how far back a rival still matters"
 *  before meeting the sweep chart. */
export function TauExplainer() {
  const data = Array.from({ length: 25 }, (_, gap) => ({
    gap,
    low: Number(Math.exp(-gap / 5).toFixed(3)),
    high: Number(Math.exp(-gap / 20).toFixed(3)),
  }));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={data} margin={{ top: 10, right: 18, bottom: 24, left: -8 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          dataKey="gap"
          type="number"
          domain={[0, 24]}
          ticks={[0, 5, 10, 15, 20]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "points a rival finished behind Arsenal",
            position: "bottom",
            offset: 10,
            fill: AXIS,
            fontSize: 11,
          }}
        />
        <YAxis
          domain={[0, 1]}
          ticks={[0, 0.5, 1]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "weight",
            angle: -90,
            position: "insideLeft",
            offset: 16,
            fill: AXIS,
            fontSize: 11,
          }}
        />
        <Tooltip
          contentStyle={ttStyle}
          formatter={(v: number | string) => Number(v).toFixed(2)}
          labelFormatter={(g) => `${g} points behind`}
        />
        <Line
          type="monotone"
          dataKey="low"
          stroke="#1d4ed8"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="high"
          stroke="#0d9488"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
        {/* labels placed directly on the chart, no legend to map colours to */}
        <ReferenceDot x={8} y={0.14} r={0} isFront>
          <Label
            value="low τ, fades fast"
            position="right"
            fill="#1d4ed8"
            fontSize={12}
            fontWeight={700}
          />
        </ReferenceDot>
        <ReferenceDot x={11.5} y={0.62} r={0} isFront>
          <Label
            value="high τ, fades slowly"
            position="right"
            fill="#0d9488"
            fontSize={12}
            fontWeight={700}
          />
        </ReferenceDot>
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Interactive robustness check for the pressure index: the index for both
 *  seasons swept across the decay scale tau. A draggable marker lets the reader
 *  read off both values at any tau and confirm the ranking never flips. */
export function PressureRobustnessChart({
  sweep,
}: {
  sweep: Circumstances["field_strength"]["sweep"];
}) {
  const [lo, hi] = sweep.range;
  const [tau, setTau] = useState(sweep.default_tau);
  const sliderId = useId();
  const data = sweep.points;
  // Slider steps land on data points, so an exact match exists; fall back to nearest.
  const row =
    data.find((d) => Math.abs(d.tau - tau) < sweep.step / 2) ??
    data.reduce((a, b) => (Math.abs(b.tau - tau) < Math.abs(a.tau - tau) ? b : a));
  const a = row["2003/04"];
  const b = row["2025/26"];
  const ratio = a > 0 ? (b / a).toFixed(2) : "-";
  const isDefault = Math.abs(tau - sweep.default_tau) < 1e-9;
  const yMax = Math.ceil(Math.max(...data.map((d) => d["2025/26"])) + 0.5);

  return (
    <div className="robust">
      <div className="robust-chart-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 18, right: 18, bottom: 26, left: -6 }}>
          <CartesianGrid stroke={GRID} />
          <XAxis
            dataKey="tau"
            type="number"
            domain={[lo, hi]}
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            allowDecimals={false}
            label={{
              value: "decay scale  τ  (how far back a rival still counts)",
              position: "bottom",
              offset: 10,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            domain={[0, yMax]}
            label={{
              value: "pressure index",
              angle: -90,
              position: "insideLeft",
              offset: 16,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={ttStyle}
            formatter={(v: number) => v.toFixed(3)}
            labelFormatter={(t) => `τ = ${t}`}
          />
          <Legend verticalAlign="top" height={30} />
          {!isDefault && (
            <ReferenceLine
              x={sweep.default_tau}
              stroke="#c4c8cc"
              strokeDasharray="5 5"
              label={{
                value: "report",
                position: "insideTopRight",
                fill: "#9aa4b2",
                fontSize: 11,
              }}
            />
          )}
          <ReferenceLine
            x={tau}
            stroke="#1d2530"
            strokeWidth={1.5}
            label={{
              value: `τ = ${tau}`,
              position: "insideTop",
              dy: 6,
              fill: "#1d2530",
              fontSize: 12,
              fontWeight: 700,
            }}
          />
          <Line
            type="monotone"
            dataKey="2003/04"
            stroke={GOLD}
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="2025/26"
            stroke={RED}
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
        <div className="robust-tau-info">
          <InfoTip label="Why the chart stops at high tau">
            The chart stops at τ = 20 on purpose. Beyond it the two lines keep converging,
            but the measure stops meaning genuine title threats: it starts counting
            mid-table and relegation sides as if they were contenders, which they were not.
          </InfoTip>
        </div>
      </div>

      <label className="robust-slider" htmlFor={sliderId}>
        <span className="dim">Drag to move the marker</span>
        <input
          id={sliderId}
          type="range"
          min={lo}
          max={hi}
          step={sweep.step}
          value={tau}
          onChange={(e) => setTau(Number(e.target.value))}
          aria-label="decay scale tau"
        />
      </label>

      <div className="robust-readout" role="status" aria-live="polite">
        <span>
          At <b>τ = {tau}</b>
          {isDefault && <span className="dim"> (used in the report)</span>}:
        </span>
        <span className="robust-vals">
          <span className="s0304">2003/04 = {a.toFixed(3)}</span>
          <span className="s2526">2025/26 = {b.toFixed(3)}</span>
          <span className="dim">2025/26 is {ratio}× higher</span>
        </span>
      </div>

      <p className="robust-interp" aria-live="polite">
        At <b>τ = {tau}</b>
        {isDefault ? " used in the report" : ""}, 2025/26 shows <b>{ratio}×</b> more
        title-race pressure than 2003/04. Drag the marker and that multiple shifts, from
        roughly 2× at low τ down to about 1.3× at high τ, but 2025/26 stays above 2003/04 at
        every setting. So the honest takeaway is the direction, not the exact number:
        2025/26 faced a more crowded title race on any reasonable setting, even if how much
        more depends on how far back you let rivals count.
      </p>
    </div>
  );
}

const KEPT = "#2f6f4f"; // retained (green)
const NEWIN = "#e0a458"; // joined / new in (amber)
const OUT = "#c0392b"; // departed (outgoing red, distinct from the 2025/26 season red)

/** Squad movement vs the prior season - retained, joined and departed - with a
 *  toggle between a headcount view ("by player count") and a minutes-weighted view
 *  ("by minutes"). The weighted view splits last season's playing time into the
 *  share kept vs the share that left, which is where the 16.7% / 15.6% departure
 *  figures live and where "similar share of proven minutes lost despite more bodies
 *  in" becomes visible. */
export function SquadStabilityChart({
  bySeason,
}: {
  bySeason: Circumstances["squad_stability"]["by_season"];
}) {
  const [view, setView] = useState<"count" | "minutes">("count");
  const seasons = Object.keys(bySeason) as Season[];

  const countData = seasons.map((s) => ({
    season: s,
    Retained: bySeason[s].retained,
    "New in": bySeason[s].incoming,
    Departed: bySeason[s].outgoing,
  }));
  const minutesData = seasons.map((s) => {
    const b = bySeason[s];
    const retainedPct =
      Math.round(((b.prior_total_minutes - b.departed_minutes) / b.prior_total_minutes) * 1000) /
      10;
    // New arrivals carry 0 of LAST season's minutes (they were not yet here), so
    // weighting collapses that bar - which is exactly the point the flip makes.
    return { season: s, Retained: retainedPct, "New in": 0, Departed: b.departed_minutes_pct };
  });

  const isMinutes = view === "minutes";
  const lbl = (v: number | string) => (isMinutes ? `${v}%` : `${v}`);

  return (
    <div className="stability-chart">
      <div className="chart-toggle" role="group" aria-label="Squad movement view">
        <button
          type="button"
          className={!isMinutes ? "active" : ""}
          aria-pressed={!isMinutes}
          onClick={() => setView("count")}
        >
          By player count
        </button>
        <button
          type="button"
          className={isMinutes ? "active" : ""}
          aria-pressed={isMinutes}
          onClick={() => setView("minutes")}
        >
          By minutes
        </button>
      </div>

      <ResponsiveContainer width="100%" height={290}>
        <BarChart
          data={isMinutes ? minutesData : countData}
          margin={{ top: 20, right: 16, bottom: 8, left: -14 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            domain={isMinutes ? [0, 100] : [0, "auto"]}
            label={{
              value: isMinutes ? "% of last season's minutes" : "PL players",
              angle: -90,
              position: "insideLeft",
              offset: 12,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={ttStyle}
            cursor={{ fill: "rgba(0,0,0,.03)" }}
            formatter={(v: number | string) => lbl(v)}
          />
          <Legend verticalAlign="top" height={30} />
          <Bar dataKey="Retained" fill={KEPT} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="Retained" position="top" fontSize={11} formatter={lbl} />
          </Bar>
          <Bar dataKey="New in" fill={NEWIN} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="New in" position="top" fontSize={11} formatter={lbl} />
          </Bar>
          <Bar dataKey="Departed" fill={OUT} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="Departed" position="top" fontSize={11} formatter={lbl} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="chart-note">
        {isMinutes
          ? `Weighted by last season's minutes. New arrivals contributed 0% of last season's playing time (they were not yet at the club), so the new-in bar collapses; what stayed sits against what left, and the departed share is close across the eras (${bySeason["2003/04"].departed_minutes_pct}% vs ${bySeason["2025/26"].departed_minutes_pct}%) even though 2025/26 moved far more players.`
          : "Headcount of players retained, joined and departed versus the prior season."}
      </p>
    </div>
  );
}

// ===========================================================================
// Section C - physical
// ===========================================================================

/** Minutes-weighted mean squad age, both seasons. */
export function SquadAgeChart({
  bySeason,
}: {
  bySeason: Physical["squad_age"]["by_season"];
}) {
  const data = (Object.keys(bySeason) as Season[]).map((s) => ({
    season: s,
    age: bySeason[s].minutes_weighted_age,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} domain={[20, 32]} />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Bar dataKey="age" radius={[4, 4, 0, 0]} name="min-weighted age">
          {data.map((d) => (
            <Cell key={d.season} fill={SEASON_COLOR[d.season]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Per-player age vs minutes, one panel per season. Each dot is a player; the
 *  dot's size AND height both encode minutes played, so the heavy-minutes players
 *  are unmistakable. The vertical line is the minutes-weighted average age, which
 *  the big dots visibly pull. Makes the weighting (and the age-distribution shape)
 *  legible rather than collapsing it to a single bar. */
type AgePlayer = { name: string; age: number; minutes: number };

// Symbol area range (px^2) recharts maps minutes onto; shared with the legend so
// the sample dots match the chart.
const DOT_AREA = [70, 720] as const;

export function SquadAgeScatter({
  bySeason,
}: {
  bySeason: Physical["squad_age"]["by_season"];
}) {
  const seasons = Object.keys(bySeason) as Season[];
  const all = seasons.flatMap((s) => bySeason[s].players);
  const ageMin = Math.floor(Math.min(...all.map((p) => p.age)) - 1);
  const ageMax = Math.ceil(Math.max(...all.map((p) => p.age)) + 1);
  const minutesTop = Math.ceil(Math.max(...all.map((p) => p.minutes)) / 300) * 300;
  const mMin = Math.min(...all.map((p) => p.minutes));
  const mMax = Math.max(...all.map((p) => p.minutes));
  // radius (px) for a legend sample at `mins`, matching recharts' area mapping
  const legendR = (mins: number) => {
    const t = (mins - mMin) / (mMax - mMin || 1);
    return Math.sqrt((DOT_AREA[0] + t * (DOT_AREA[1] - DOT_AREA[0])) / Math.PI);
  };

  return (
    <div className="age-scatter">
      <div className="size-legend" aria-hidden="true">
        <span className="dim">Dot size = minutes played:</span>
        {[500, 1500, 3000].map((m) => (
          <span className="size-legend-item" key={m}>
            <span
              className="size-dot"
              style={{ width: legendR(m) * 2, height: legendR(m) * 2 }}
            />
            {m.toLocaleString()}
          </span>
        ))}
      </div>

      {seasons.map((s) => {
        const wavg = bySeason[s].minutes_weighted_age;
        const color = SEASON_COLOR[s];
        return (
          <div className="scatter-panel" key={s}>
            <p className="scatter-panel-title">
              <span className={`season-tag ${s === "2003/04" ? "s0304" : "s2526"}`}>
                {s}
              </span>
              <span className="dim">
                {" "}
                minutes-weighted average age <b>{wavg}</b>
              </span>
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 18, right: 18, bottom: 24, left: -6 }}>
                <CartesianGrid stroke={GRID} />
                <XAxis
                  type="number"
                  dataKey="age"
                  domain={[ageMin, ageMax]}
                  stroke={AXIS}
                  tick={{ fontSize: 12 }}
                  tickCount={7}
                  label={{
                    value: "player age in the title season",
                    position: "bottom",
                    offset: 8,
                    fill: AXIS,
                    fontSize: 12,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="minutes"
                  domain={[0, minutesTop]}
                  stroke={AXIS}
                  tick={{ fontSize: 12 }}
                  width={44}
                  label={{
                    value: "league minutes",
                    angle: -90,
                    position: "insideLeft",
                    offset: 18,
                    fill: AXIS,
                    fontSize: 12,
                  }}
                />
                <ZAxis type="number" dataKey="minutes" range={[...DOT_AREA]} />
                <ReferenceLine
                  x={wavg}
                  stroke="#1d2530"
                  strokeWidth={1.5}
                  label={{
                    value: `weighted avg ${wavg}`,
                    position: "top",
                    fill: "#1d2530",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <Tooltip content={<AgeTip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  data={bySeason[s].players as AgePlayer[]}
                  fill={color}
                  fillOpacity={0.72}
                  stroke={color}
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

function AgeTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: AgePlayer }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tt">
      <strong>{d.name}</strong>
      <div>
        age {d.age} · {d.minutes.toLocaleString()} min
      </div>
    </div>
  );
}

const SEASON_MONTHS = [
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
];

/** Games per calendar month across all competitions, both seasons. */
export function FixtureCongestionChart({
  bySeason,
}: {
  bySeason: Physical["fixture_congestion"]["by_season"];
}) {
  const pick = (s: Season, mon: string) =>
    bySeason[s].games_per_month.find((m) => m.label.startsWith(mon))?.games ?? 0;
  const data = SEASON_MONTHS.map((mon) => ({
    month: mon,
    "2003/04": pick("2003/04", mon),
    "2025/26": pick("2025/26", mon),
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -18 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis dataKey="month" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          allowDecimals={false}
          label={{
            value: "games",
            angle: -90,
            position: "insideLeft",
            offset: 12,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <Tooltip contentStyle={ttStyle} />
        <Legend verticalAlign="top" height={30} />
        <Line
          type="monotone"
          dataKey="2003/04"
          stroke={GOLD}
          strokeWidth={3}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="2025/26"
          stroke={RED}
          strokeWidth={3}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Visual A: rest-gap distribution. How many games followed a <=2 / 3 / 4-5 /
 *  6-7 / 8+ day rest, both seasons side by side. The direct evidence that 2025/26
 *  is weighted toward the short-rest buckets. */
export function RestGapChart({
  bySeason,
}: {
  bySeason: Physical["fixture_congestion"]["by_season"];
}) {
  const labels = bySeason["2003/04"].rest_buckets.map((b) => b.label);
  const data = labels.map((label) => ({
    label,
    "2003/04": bySeason["2003/04"].rest_buckets.find((b) => b.label === label)!.count,
    "2025/26": bySeason["2025/26"].rest_buckets.find((b) => b.label === label)!.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          label={{
            value: "rest before the game (days since previous match)",
            position: "bottom",
            offset: 6,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <YAxis
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          allowDecimals={false}
          label={{
            value: "games",
            angle: -90,
            position: "insideLeft",
            offset: 16,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <Bar dataKey="2003/04" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="2025/26" fill={RED} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const TL_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
// map calendar month (1-12) to an Aug..May axis index (Aug=0 .. May=9)
const MONTH_AXIS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 1: 5, 2: 6, 3: 7, 4: 8, 5: 9,
};
const SHORT_TICK = "#ff5a1f"; // hot accent for short-rest games
const NORMAL_TICK = "#b8c0cb"; // muted for normal-rest games

type TLMatch = Physical["fixture_congestion"]["by_season"][keyof Physical["fixture_congestion"]["by_season"]]["matches"][number];

/** fraction 0..1 along an Aug->May axis for a match date. */
function axisFrac(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const idx = MONTH_AXIS[m] ?? 0;
  const daysInMonth = new Date(y, m, 0).getDate();
  return (idx + (d - 1) / daysInMonth) / TL_MONTHS.length;
}

/** Congested stretches: maximal runs of consecutive short-rest games. A run of
 *  N short-rest games means N+1 matches bunched together (each within 3 days of
 *  the previous), so a run of >=2 is 3+ games in quick succession. Returns the
 *  fractional x-span (start of the bunch to its last game) for shading. */
function congestedBands(matches: TLMatch[]): { start: number; end: number }[] {
  const bands: { start: number; end: number }[] = [];
  let runStart = -1;
  const close = (endIdx: number) => {
    if (runStart >= 1 && endIdx - runStart >= 1) {
      bands.push({
        start: axisFrac(matches[runStart - 1].date),
        end: axisFrac(matches[endIdx].date),
      });
    }
    runStart = -1;
  };
  matches.forEach((m, i) => {
    if (m.short) {
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      close(i - 1);
    }
  });
  if (runStart !== -1) close(matches.length - 1);
  return bands;
}

/** Visual B: season congestion timeline. One strip per season, Aug->May, every
 *  competitive match a tick placed by date; short-rest games (<=3 days) in a hot
 *  colour so clusters (December, modern European weeks) jump out. */
export function CongestionTimeline({
  bySeason,
}: {
  bySeason: Physical["fixture_congestion"]["by_season"];
}) {
  const seasons = Object.keys(bySeason) as Season[];
  const [hover, setHover] = useState<{
    x: number;
    text: string;
    short: boolean;
  } | null>(null);

  return (
    <div className="timeline">
      <div className="tl-legend" aria-hidden="true">
        <span className="tl-key">
          <i className="tl-swatch" style={{ background: SHORT_TICK }} /> short rest
          (3 days or fewer)
        </span>
        <span className="tl-key">
          <i className="tl-swatch" style={{ background: NORMAL_TICK }} /> normal rest
        </span>
        <span className="tl-key">
          <i className="tl-swatch band" /> congested stretch (3+ games in quick succession)
        </span>
      </div>
      <div className="tl-scroll">
        <div className="tl-inner">
          {seasons.map((s) => (
            <div className="tl-block" key={s}>
              <span className={`season-tag ${s === "2003/04" ? "s0304" : "s2526"}`}>
                {s}
              </span>
              <div className="tl-track">
                {TL_MONTHS.map((mo, i) => (
                  <span
                    className="tl-monthline"
                    key={mo}
                    style={{ left: `${(i / TL_MONTHS.length) * 100}%` }}
                  />
                ))}
                {congestedBands(bySeason[s].matches as TLMatch[]).map((bd, i) => (
                  <span
                    className="tl-band"
                    key={`band-${i}`}
                    aria-hidden="true"
                    style={{
                      left: `${bd.start * 100}%`,
                      width: `${(bd.end - bd.start) * 100}%`,
                    }}
                  />
                ))}
                {(bySeason[s].matches as TLMatch[]).map((m, i) => {
                  const left = axisFrac(m.date) * 100;
                  const rest =
                    m.rest_days === null ? "season opener" : `${m.rest_days} days rest`;
                  const text = `${m.competition} · ${m.date} · ${rest}`;
                  return (
                    <button
                      type="button"
                      key={`${m.date}-${i}`}
                      className={`tl-tick ${m.short ? "short" : ""}`}
                      style={{ left: `${left}%` }}
                      aria-label={text}
                      onMouseEnter={() => setHover({ x: left, text, short: m.short })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ x: left, text, short: m.short })}
                      onBlur={() => setHover(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div className="tl-axis">
            {TL_MONTHS.map((mo, i) => (
              <span
                className="tl-month"
                key={mo}
                style={{ left: `${(i / TL_MONTHS.length) * 100}%` }}
              >
                {mo}
              </span>
            ))}
          </div>
          {hover && (
            <div
              className={`tl-tip ${hover.short ? "short" : ""}`}
              style={{ left: `${hover.x}%` }}
            >
              {hover.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Section D - performance under congestion
// ===========================================================================

const GOLD_TEXT = "#8a6610"; // AA-contrast gold for small text/labels on white

/** League points-per-game in short-rest vs normal-rest games, both seasons, with
 *  each season's overall PPG marked as a dashed reference line. Sample sizes are
 *  printed on the bars so small buckets are not over-read. The y-axis is clipped
 *  to 1.8-2.6 (and labelled) so the differences are legible without inventing them. */
export function CongestionPpgChart({
  bySeason,
}: {
  bySeason: Congestion["by_season"];
}) {
  const b0 = bySeason["2003/04"];
  const b1 = bySeason["2025/26"];
  const data = [
    {
      bucket: "Short rest (≤3 days)",
      "2003/04": b0.buckets.short.ppg ?? 0,
      "2025/26": b1.buckets.short.ppg ?? 0,
      n0: b0.buckets.short.games,
      n1: b1.buckets.short.games,
    },
    {
      bucket: "Normal rest (4+ days)",
      "2003/04": b0.buckets.normal.ppg ?? 0,
      "2025/26": b1.buckets.normal.ppg ?? 0,
      n0: b0.buckets.normal.games,
      n1: b1.buckets.normal.games,
    },
  ];
  const ppgFmt = (v: number | string) => Number(v).toFixed(2);
  const nFmt = (v: number | string) => `n=${v}`;
  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={data} margin={{ top: 22, right: 104, bottom: 8, left: -6 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="bucket" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis
          stroke={AXIS}
          tick={{ fontSize: 12 }}
          domain={[1.8, 2.6]}
          ticks={[1.8, 2.0, 2.2, 2.4, 2.6]}
          allowDataOverflow
          label={{
            value: "league points per game",
            angle: -90,
            position: "insideLeft",
            offset: 14,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <Tooltip contentStyle={ttStyle} formatter={ppgFmt} cursor={{ fill: "rgba(0,0,0,.03)" }} />
        <Legend verticalAlign="top" height={30} />
        <ReferenceLine
          y={b0.overall_ppg}
          stroke={GOLD}
          strokeDasharray="5 5"
          label={{
            value: `2003/04 avg ${b0.overall_ppg.toFixed(2)}`,
            position: "right",
            fill: GOLD_TEXT,
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={b1.overall_ppg}
          stroke={RED}
          strokeDasharray="5 5"
          label={{
            value: `2025/26 avg ${b1.overall_ppg.toFixed(2)}`,
            position: "right",
            fill: RED,
            fontSize: 11,
          }}
        />
        <Bar dataKey="2003/04" fill={GOLD} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="2003/04" position="top" formatter={ppgFmt} fontSize={12} />
          <LabelList
            dataKey="n0"
            position="insideBottom"
            formatter={nFmt}
            fill="#fff"
            fontSize={11}
          />
        </Bar>
        <Bar dataKey="2025/26" fill={RED} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="2025/26" position="top" formatter={ppgFmt} fontSize={12} />
          <LabelList
            dataKey="n1"
            position="insideBottom"
            formatter={nFmt}
            fill="#fff"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===========================================================================
// Sections A / D - the expected-points model
// ===========================================================================

/** Actual points vs model-expected points, both seasons. */
export function ExpectedPointsChart({ model }: { model: Record<Season, ModelResult> }) {
  const data = (Object.keys(model) as Season[]).map((s) => ({
    season: s,
    Actual: model[s].actual_points,
    Expected: model[s].expected_points,
  }));
  return (
    <ResponsiveContainer width="100%" height={320}>
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

/** Per-match xG-for vs xG-against, one season, coloured by result. */
export function MatchXgScatter({ res }: { res: ModelResult }) {
  const color = (r: string) =>
    r === "W" ? "#15803d" : r === "D" ? "#b45309" : "#c0392b";
  const data = res.matches.map((m) => ({
    xgf: m.xgf,
    xga: m.xga,
    opponent: m.opponent,
    result: m.result,
    score: `${m.gf}-${m.ga}`,
    xpts: m.xpts,
  }));
  const max = Math.ceil(Math.max(...data.flatMap((d) => [d.xgf, d.xga])) + 0.5);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 18, bottom: 28, left: -4 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          type="number"
          dataKey="xgf"
          name="xG for"
          domain={[0, max]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "xG created",
            position: "bottom",
            offset: 10,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <YAxis
          type="number"
          dataKey="xga"
          name="xG against"
          domain={[0, max]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "xG conceded",
            angle: -90,
            position: "insideLeft",
            offset: 14,
            fill: AXIS,
            fontSize: 12,
          }}
        />
        <ZAxis range={[70, 70]} />
        <ReferenceLine
          segment={[
            { x: 0, y: 0 },
            { x: max, y: max },
          ]}
          stroke="#c4c8cc"
          strokeDasharray="6 6"
        />
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

type ScatterPoint = {
  opponent: string;
  score: string;
  result: string;
  xgf: number;
  xga: number;
  xpts: number;
};

function XgScatterTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tt">
      <strong>{d.opponent}</strong> · {d.score} ({d.result})
      <div>
        xG for {d.xgf.toFixed(2)} · xG against {d.xga.toFixed(2)}
      </div>
      <div>expected points {d.xpts.toFixed(2)}</div>
    </div>
  );
}

// ===========================================================================
// Section D - the synthesis
// ===========================================================================

type PeerClub = SynthesisD["peer"]["clubs"][number];

function SynthTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PeerClub }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tt">
      <strong>{d.club}</strong>
      <div>field resistance {d.field_resistance.toFixed(2)}</div>
      <div>
        over-performance {d.over_performance >= 0 ? "+" : ""}
        {d.over_performance.toFixed(1)} pts
      </div>
    </div>
  );
}

/** Part 1: peer scatter. x = field resistance (outside force, same for every
 *  club); y = over-performance (actual minus model-expected points). Arsenal
 *  highlighted; peers muted, identified on hover. Top-right = crowded field AND
 *  beat the model. */
const CLUB_SHORT: Record<string, string> = {
  "Manchester City": "Man City",
  "Manchester United": "Man Utd",
  "Wolverhampton Wanderers": "Wolves",
  "Nottingham Forest": "Forest",
  "Tottenham Hotspur": "Spurs",
  "Newcastle United": "Newcastle",
  "West Ham United": "West Ham",
  "Brighton & Hove Albion": "Brighton",
  "Crystal Palace": "Palace",
};
// Labelled directly on the chart: Arsenal plus the notable dots (top over-performers
// and the clear outliers). The crowded mid-table is left to hover, so labels stay
// legible rather than overlapping into a mush.
const NOTABLE = new Set([
  "Manchester City",
  "Manchester United",
  "Aston Villa",
  "Sunderland",
  "Fulham",
  "Wolverhampton Wanderers",
  "Burnley",
]);
const short = (c: string) => CLUB_SHORT[c] ?? c;

export function SynthesisScatter({ clubs }: { clubs: PeerClub[] }) {
  const withLabel = (c: PeerClub) => ({ ...c, label: short(c.club) });
  const peers = clubs.filter((c) => !c.is_arsenal);
  const notablePeers = peers.filter((c) => NOTABLE.has(c.club)).map(withLabel);
  const otherPeers = peers.filter((c) => !NOTABLE.has(c.club));
  const arsenal = clubs.filter((c) => c.is_arsenal).map(withLabel);
  const xs = clubs.map((c) => c.field_resistance);
  const ys = clubs.map((c) => c.over_performance);
  const xMax = Math.ceil(Math.max(...xs));
  const yMin = Math.floor(Math.min(...ys) / 5) * 5;
  const yMax = Math.ceil(Math.max(...ys) / 5) * 5;
  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart margin={{ top: 24, right: 20, bottom: 28, left: -2 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          type="number"
          dataKey="field_resistance"
          domain={[0, xMax]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "field resistance faced  (position-race pressure, higher = more contested)",
            position: "bottom",
            offset: 12,
            fill: AXIS,
            fontSize: 11,
          }}
        />
        <YAxis
          type="number"
          dataKey="over_performance"
          domain={[yMin, yMax]}
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          label={{
            value: "over-performance (pts vs model)",
            angle: -90,
            position: "insideLeft",
            offset: 12,
            fill: AXIS,
            fontSize: 11,
          }}
        />
        <ZAxis range={[70, 70]} />
        <ReferenceLine
          y={0}
          stroke="#9aa4b2"
          strokeDasharray="5 5"
          label={{ value: "met expectation", position: "insideRight", fill: "#9aa4b2", fontSize: 10 }}
        />
        <Tooltip content={<SynthTip />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={otherPeers} fill="#9aa4b2" fillOpacity={0.85} isAnimationActive={false} />
        <Scatter data={notablePeers} fill="#6b7482" fillOpacity={0.95} isAnimationActive={false}>
          <LabelList dataKey="label" position="top" fontSize={10} fill="#5e6772" />
        </Scatter>
        <Scatter data={arsenal} fill={RED} isAnimationActive={false}>
          <ZAxis range={[190, 190]} />
          <LabelList dataKey="label" position="top" fontSize={12} fontWeight={700} fill={RED} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/** Part 2: Arsenal's full two-force difficulty across its two complete-data
 *  seasons. The RAW values are the headline (each on its own scale, so the true,
 *  non-binary size of every gap is visible); the normalised 0-1 combine is demoted
 *  to a supporting element showing how the 0.33 / 0.67 score is built. */
export function ArsenalCombinedChart({
  combined,
}: {
  combined: SynthesisD["arsenal_combined"];
}) {
  const be = combined.by_era;
  const metrics: {
    key: "field" | "departures" | "short_rest";
    label: string;
    fmt: (v: number) => string;
  }[] = [
    { key: "field", label: "Title-race pressure", fmt: (v) => v.toFixed(2) },
    { key: "departures", label: "Minutes-weighted departures", fmt: (v) => `${v.toFixed(1)}%` },
    { key: "short_rest", label: "Short-rest share of games", fmt: (v) => `${v.toFixed(1)}%` },
  ];
  return (
    <div className="combined-chart">
      <p className="combined-head">The raw values, the true size of each gap</p>
      <div className="raw-metrics">
        {metrics.map((m) => {
          const a = be["2003/04"].raw[m.key];
          const b = be["2025/26"].raw[m.key];
          const max = Math.max(a, b) || 1;
          return (
            <div className="raw-metric" key={m.key}>
              <p className="raw-metric-label">{m.label}</p>
              {(
                [
                  ["2003/04", a, "s0304"],
                  ["2025/26", b, "s2526"],
                ] as const
              ).map(([yr, val, cls]) => (
                <div className={`raw-row ${cls}`} key={yr}>
                  <span className="raw-yr">{yr}</span>
                  <span className="raw-track">
                    <span className="raw-fill" style={{ width: `${(val / max) * 100}%` }} />
                  </span>
                  <span className="raw-val">{m.fmt(val)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="combined-prose">
        To combine these into one difficulty score, each component is scaled from 0 to 1
        across the two seasons and the three are averaged with equal weight. Because there
        are only two seasons, each component scales to either 0 or 1, so the average is
        coarse by design: 2003/04 comes out at {be["2003/04"].difficulty.toFixed(2)} and
        2025/26 at {be["2025/26"].difficulty.toFixed(2)}. The number to trust is not its
        precision but its direction. It reflects the raw values above: the two eras are
        nearly identical on departures, while 2025/26 is clearly higher on both title-race
        pressure and fixture congestion. Two of the three forces point to 2025/26 as the
        harder task, which is what the combined score reflects.
      </p>
    </div>
  );
}
