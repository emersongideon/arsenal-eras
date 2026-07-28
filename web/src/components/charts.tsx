import { useId, useState } from "react";
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
import type {
  Circumstances,
  MatchRow,
  ModelResult,
  Physical,
  Season,
  SeasonSummary,
} from "../types";
import { SEASON_COLOR } from "./ui";

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

/** Cumulative league points across the 38-game season (the "title race"). */
export function CumulativePointsChart({ matches }: { matches: MatchRow[] }) {
  type WeekRow = { match_no: number } & Partial<Record<Season, number>>;
  const byWeek: Record<number, WeekRow> = {};
  for (const m of matches) {
    const w = m.match_no;
    byWeek[w] = byWeek[w] || { match_no: w };
    byWeek[w][m.season] = m.cum_points;
  }
  const data = Object.values(byWeek).sort((a, b) => a.match_no - b.match_no);
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
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Attacking & defensive output: goals vs xG, both seasons. */
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
    <ResponsiveContainer width="100%" height={300}>
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
    </div>
  );
}

/** Squad stability vs the prior season: retained + newly-arrived (stacked bar),
 *  with a companion strip for the minutes-weighted departure figure (the share of
 *  the prior season's team minutes that left the club). */
export function SquadStabilityChart({
  bySeason,
}: {
  bySeason: Circumstances["squad_stability"]["by_season"];
}) {
  const seasons = Object.keys(bySeason) as Season[];
  const data = seasons.map((s) => ({
    season: s,
    Retained: bySeason[s].retained,
    "New in": bySeason[s].incoming,
  }));
  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -18 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="season"
            stroke={AXIS}
            tick={{ fontSize: 13, fontWeight: 700 }}
          />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            label={{
              value: "PL players",
              angle: -90,
              position: "insideLeft",
              offset: 16,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(0,0,0,.03)" }} />
          <Legend verticalAlign="top" height={30} />
          <Bar dataKey="Retained" stackId="a" fill="#2f6f4f" radius={[0, 0, 0, 0]} />
          <Bar dataKey="New in" stackId="a" fill="#e0a458" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <DepartedMinutesStrip bySeason={bySeason} />
    </>
  );
}

/** Companion visual: the minutes-weighted departure figure for each season, drawn
 *  as two proportional bars so the "how much of last year's playing time left"
 *  comparison is legible at a glance. */
function DepartedMinutesStrip({
  bySeason,
}: {
  bySeason: Circumstances["squad_stability"]["by_season"];
}) {
  const seasons = Object.keys(bySeason) as Season[];
  const max = Math.max(...seasons.map((s) => bySeason[s].departed_minutes_pct), 1);
  return (
    <div className="dep-strip">
      <p className="dep-strip-title">
        Departures, weighted by last season&rsquo;s minutes
        <span className="dim">: share of the prior season&rsquo;s team minutes that left</span>
      </p>
      {seasons.map((s) => {
        const b = bySeason[s];
        return (
          <div className={`dep-row ${s === "2003/04" ? "s0304" : "s2526"}`} key={s}>
            <span className="dep-season">{s}</span>
            <span className="dep-track">
              <span
                className="dep-fill"
                style={{ width: `${(b.departed_minutes_pct / max) * 100}%` }}
              />
            </span>
            <span className="dep-val">{b.departed_minutes_pct}%</span>
          </div>
        );
      })}
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
