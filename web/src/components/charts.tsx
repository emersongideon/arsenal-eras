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
            value: "points a rival sits from Arsenal that week",
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
          labelFormatter={(g) => `${g} points apart`}
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
  const a = row["2003/04"]; // baseline, always 1.00
  const b = row["2025/26"];
  const ratio = a > 0 ? (b / a).toFixed(2) : "-";
  const isDefault = Math.abs(tau - sweep.default_tau) < 1e-9;

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
              value: "decay scale  τ  (how far back on the table a rival still counts each week)",
              position: "bottom",
              offset: 10,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            domain={[0.9, 1.45]}
            ticks={[0.9, 1.0, 1.1, 1.2, 1.3, 1.4]}
            label={{
              value: "pressure, indexed to 2003/04 = 1.00",
              angle: -90,
              position: "insideLeft",
              offset: 16,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={ttStyle}
            formatter={(v: number) => v.toFixed(2)}
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
            The chart stops at τ = 20 on purpose. Beyond it the weekly weights flatten so
            far that distant mid-table and relegation sides start counting as genuine title
            threats, which they were not. Within 5 to 20 the comparison stays meaningful,
            and 2025/26 sits above 2003/04 throughout.
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
          <span className="s0304">2003/04 = {a.toFixed(2)} (baseline)</span>
          <span className="s2526">2025/26 = {b.toFixed(2)}</span>
          <span className="dim">2025/26 is {ratio}× higher</span>
        </span>
      </div>

      <p className="robust-interp">
        The multiple shifts with tau, from about 1.38x to 1.25x, but never falls to parity.
        The honest takeaway is the direction, not the exact number: 2025/26 faced a more
        contested race on any reasonable setting.
      </p>
    </div>
  );
}

const WORKED_SHORT: Record<string, string> = {
  "Manchester City": "Man City",
  "Manchester United": "Man Utd",
  "Newcastle United": "Newcastle",
  "Nottingham Forest": "Forest",
  "Tottenham Hotspur": "Tottenham",
  "West Ham United": "West Ham",
  "Brighton & Hove Albion": "Brighton",
  "Wolverhampton Wanderers": "Wolves",
  "Aston Villa": "Villa",
  "Crystal Palace": "Palace",
  "Charlton Athletic": "Charlton",
  "Bolton Wanderers": "Bolton",
  "Birmingham City": "Birmingham",
  "Blackburn Rovers": "Blackburn",
  "Leicester City": "Leicester",
  "Leeds United": "Leeds",
};

/** Worked example that makes the pressure index transparent. For a chosen season and
 *  gameweek it recomputes the exact per-rival weighting the metric uses (base
 *  exp(-|gap|/tau), beta for rivals behind, and the k/38 season ramp) and plots each
 *  week's ramped pressure across all 38 gameweeks. Shares ONE computation with the
 *  index, so summing the 38 weeks reproduces 1.00 / 1.36. */
export function PressureWorkedExample({
  weekly,
  note,
}: {
  weekly: Circumstances["field_strength"]["weekly"];
  note?: string;
}) {
  const seasons = Object.keys(weekly.by_season) as Season[];
  const [season, setSeason] = useState<Season>(seasons[seasons.length - 1]);
  const [gw, setGw] = useState(20);
  const [tau, setTau] = useState(weekly.tau); // default 10, slider 5-20
  const [beta, setBeta] = useState(weekly.beta); // default 1.5, slider 1-2
  const gwId = useId();
  const tauId = useId();
  const betaId = useId();
  const N = 38;
  const short = (c: string) => WORKED_SHORT[c] ?? c;

  const weekPressure = (s: Season, i: number) => {
    const sd = weekly.by_season[s];
    const tp = sd.arsenal[i];
    let wk = 0;
    for (const r of sd.rivals) {
      const rp = r.pts[i];
      let w = Math.exp(-Math.abs(tp - rp) / tau);
      if (rp < tp) w *= beta; // rival behind, chasing
      wk += w;
    }
    return wk * ((i + 1) / N); // ramp is fixed on
  };

  const perWeek = Array.from({ length: N }, (_, i) => {
    const row: { gw: number } & Record<string, number> = { gw: i + 1 };
    for (const s of seasons) row[s] = weekPressure(s, i);
    return row;
  });
  const totals = Object.fromEntries(
    seasons.map((s) => [s, perWeek.reduce((a, r) => a + r[s], 0)]),
  ) as Record<Season, number>;
  const base = totals[seasons[0]]; // 2003/04 total is the 1.00 baseline
  const idx = (s: Season) => totals[s] / base;

  // the selected gameweek, worked through
  const k = gw - 1;
  const ramp = gw / N;
  const d = weekly.by_season[season];
  const arsPts = d.arsenal[k];
  const rows = d.rivals
    .map((r) => {
      const rp = r.pts[k];
      const gap = arsPts - rp; // >0 rival behind, <0 rival ahead
      const behind = rp < arsPts;
      const bw = Math.exp(-Math.abs(gap) / tau);
      const weighted = behind ? bw * beta : bw;
      return { club: r.club, rp, gap, behind, bw, contribution: weighted * ramp };
    })
    .sort((a, b) => b.contribution - a.contribution);
  const TOP = 6;
  const shown = rows.slice(0, TOP);
  const rest = rows.slice(TOP);
  const restC = rest.reduce((a, r) => a + r.contribution, 0);
  const weekTotal = rows.reduce((a, r) => a + r.contribution, 0);
  const gapLabel = (r: { gap: number; behind: boolean }) =>
    r.gap === 0 ? "level" : r.behind ? `${r.gap} behind` : `${-r.gap} ahead`;

  return (
    <div className="worked">
      <div className="worked-controls">
        <div className="chart-toggle" role="group" aria-label="Season">
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              className={season === s ? "active" : ""}
              aria-pressed={season === s}
              onClick={() => setSeason(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="worked-slider" htmlFor={gwId}>
          <span className="dim">Gameweek</span>
          <input
            id={gwId}
            type="range"
            min={1}
            max={38}
            step={1}
            value={gw}
            onChange={(e) => setGw(Number(e.target.value))}
            aria-label="gameweek"
          />
          <span className="worked-gw">GW {gw}</span>
        </label>
      </div>

      <p className="worked-lead">
        After <b>{gw}</b> games, {season} Arsenal are on <b>{arsPts} pts</b>. Every rival is
        weighted by how close it sits, rivals behind are amplified by beta, and the whole
        week is scaled by the ramp <code>{gw}/38 = {ramp.toFixed(2)}</code> (later weeks count
        for more).
      </p>

      <div className="worked-scroll">
        <table className="worked-table">
          <thead>
            <tr>
              <th>Rival</th>
              <th className="ta-c">Pts</th>
              <th className="ta-c">Gap</th>
              <th className="ta-c">
                base = e<sup>-|gap|/{tau}</sup>
              </th>
              <th className="ta-c">behind ×{beta.toFixed(1)}</th>
              <th className="ta-c">ramp ×{ramp.toFixed(2)}</th>
              <th className="ta-c">contribution</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.club} className={r.behind ? "behind" : ""}>
                <td>{short(r.club)}</td>
                <td className="ta-c">{r.rp}</td>
                <td className="ta-c">{gapLabel(r)}</td>
                <td className="ta-c">{r.bw.toFixed(2)}</td>
                <td className="ta-c">{r.behind ? `×${beta.toFixed(1)}` : "-"}</td>
                <td className="ta-c">×{ramp.toFixed(2)}</td>
                <td className="ta-c wt">{r.contribution.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="worked-rest">
              <td colSpan={6}>+ {rest.length} more rivals, further back</td>
              <td className="ta-c wt">{restC.toFixed(2)}</td>
            </tr>
            <tr className="worked-total">
              <td colSpan={6}>Gameweek {gw} pressure (sum)</td>
              <td className="ta-c wt">{weekTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="chart-title" style={{ marginTop: 22 }}>
        Each week's pressure, all 38 gameweeks
      </p>
      <p className="chart-sub">
        Per-week ramped pressure for both seasons. Sum every week across all 38 gives the
        index: 2003/04 = <b>{idx("2003/04").toFixed(2)}</b>, 2025/26 ={" "}
        <b>{idx("2025/26").toFixed(2)}</b>.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={perWeek} margin={{ top: 12, right: 18, bottom: 24, left: -6 }}>
          <CartesianGrid stroke={GRID} />
          <XAxis
            dataKey="gw"
            type="number"
            domain={[1, 38]}
            ticks={[1, 10, 20, 30, 38]}
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            label={{ value: "gameweek", position: "bottom", offset: 8, fill: AXIS, fontSize: 12 }}
          />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            label={{
              value: "week pressure",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              fill: AXIS,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={ttStyle}
            formatter={(v: number) => v.toFixed(2)}
            labelFormatter={(g) => `Gameweek ${g}`}
          />
          <Legend verticalAlign="top" height={28} />
          <ReferenceLine x={gw} stroke="#1d2530" strokeWidth={1.5} />
          <Line
            type="monotone"
            dataKey="2003/04"
            stroke={GOLD}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="2025/26"
            stroke={RED}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {note && <p className="chart-note">{note}</p>}

      <div className="explorer">
        <p className="explorer-title">Adjust the model</p>
        <div className="explorer-row">
          <div className="explorer-head">
            <label htmlFor={tauId}>How far down the table pressure reaches</label>
            <span className="explorer-val">τ = {tau}</span>
          </div>
          <input
            id={tauId}
            type="range"
            min={5}
            max={20}
            step={1}
            value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
          />
          <p className="explorer-help">
            Lower: only rivals very close to Arsenal count. Higher: rivals further back still
            add some pressure.
          </p>
        </div>
        <div className="explorer-row">
          <div className="explorer-head">
            <label htmlFor={betaId}>How much harder being chased feels</label>
            <span className="explorer-val">β = {beta.toFixed(1)}</span>
          </div>
          <input
            id={betaId}
            type="range"
            min={1}
            max={2}
            step={0.1}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
          />
          <p className="explorer-help">
            At 1.0 a rival just behind and just ahead count the same. Higher: a rival chasing
            from behind presses harder.
          </p>
        </div>
        <p className="explorer-ramp">
          Later weeks always count more than August; that is fixed.
        </p>
        <p className="explorer-live">
          Wherever you set these, 2025/26 stays higher. The direction holds; only the size of
          the gap moves (1.25x to 1.38x across these ranges).
        </p>
      </div>
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
          margin={{ top: 20, right: 16, bottom: 8, left: 6 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="season" stroke={AXIS} tick={{ fontSize: 13, fontWeight: 700 }} />
          <YAxis
            stroke={AXIS}
            tick={{ fontSize: 12 }}
            width={54}
            domain={isMinutes ? [0, 100] : [0, "auto"]}
            label={{
              value: isMinutes ? "% of last season's minutes" : "PL players",
              angle: -90,
              position: "insideLeft",
              offset: 0,
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
          ? `Weighted by last season's minutes. New arrivals show 0% because they had not played for the club yet, so that bar collapses; what stayed sits against what left. The departed share is close across eras (${bySeason["2003/04"].departed_minutes_pct}% vs ${bySeason["2025/26"].departed_minutes_pct}%) despite 2025/26 moving far more players.`
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

/** Arsenal's two-force difficulty across its two complete-data seasons. The RAW
 *  values are shown (each on its own scale, so the true size of every gap is
 *  visible); the normalised 0-1 components feed the interactive weighting tool. */
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
    { key: "field", label: "Title-race pressure (index)", fmt: (v) => v.toFixed(2) },
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
    </div>
  );
}

/** Interactive combine: three auto-normalising weight sliders (summing to 100%)
 *  over the three normalised components, with the resulting difficulty score for
 *  both seasons recomputed live. Default leans on pressure and departures and
 *  down-weights short-rest, whose points effect Section C found inconclusive. */
const WEIGHT_DEFAULT = [45, 45, 10]; // field, departures, short_rest

export function ArsenalWeightingTool({
  combined,
}: {
  combined: SynthesisD["arsenal_combined"];
}) {
  const be = combined.by_era;
  const comps: { key: "field" | "departures" | "short_rest"; label: string }[] = [
    { key: "field", label: "Title-race pressure" },
    { key: "departures", label: "Minutes-weighted departures" },
    { key: "short_rest", label: "Short-rest share" },
  ];
  const [w, setW] = useState<number[]>(WEIGHT_DEFAULT);

  // Move one weight to v; redistribute the remainder across the other two in
  // proportion to their current values so the three always sum to 100.
  function move(i: number, raw: number) {
    const v = Math.max(0, Math.min(100, raw));
    const others = [0, 1, 2].filter((j) => j !== i);
    const remaining = 100 - v;
    const sumOthers = others.reduce((s, j) => s + w[j], 0);
    const next = [...w];
    next[i] = v;
    others.forEach((j) => {
      next[j] = sumOthers > 0 ? (w[j] / sumOthers) * remaining : remaining / 2;
    });
    setW(next);
  }

  // Whole-number weights for display that still add to exactly 100.
  const shown = w.map((x) => Math.round(x));
  const drift = 100 - shown.reduce((a, b) => a + b, 0);
  if (drift !== 0) shown[w.indexOf(Math.max(...w))] += drift;

  const score = (era: "2003/04" | "2025/26") =>
    comps.reduce((s, c, i) => s + (w[i] / 100) * be[era].norm[c.key], 0);
  const s0 = score("2003/04");
  const s1 = score("2025/26");
  const harder = Math.abs(s1 - s0) < 1e-9 ? null : s1 > s0 ? "2025/26" : "2003/04";

  return (
    <div className="weigh-tool">
      <div className="weigh-sliders">
        {comps.map((c, i) => (
          <div className="weigh-row" key={c.key}>
            <div className="weigh-row-head">
              <span className="weigh-label">{c.label}</span>
              <span className="weigh-pct">{shown[i]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(w[i])}
              aria-label={`Weight for ${c.label}`}
              onChange={(e) => move(i, Number(e.target.value))}
            />
          </div>
        ))}
        <button
          type="button"
          className="weigh-reset"
          onClick={() => setW(WEIGHT_DEFAULT)}
          disabled={shown.every((x, i) => x === WEIGHT_DEFAULT[i])}
        >
          Reset to default (45 / 45 / 10)
        </button>
      </div>

      <div className="weigh-out">
        {(
          [
            ["2003/04", s0, "s0304"],
            ["2025/26", s1, "s2526"],
          ] as const
        ).map(([yr, sc, cls]) => (
          <div className={`weigh-score ${cls} ${harder === yr ? "lead" : ""}`} key={yr}>
            <span className="weigh-score-yr">{yr}</span>
            <span className="weigh-score-val">{sc.toFixed(2)}</span>
            {harder === yr && <span className="weigh-score-tag">harder</span>}
          </div>
        ))}
        <p className="weigh-verdict">
          {harder
            ? `At this weighting, ${harder} is the harder title (${(harder === "2025/26"
                ? s1
                : s0
              ).toFixed(2)} against ${(harder === "2025/26" ? s0 : s1).toFixed(2)}).`
            : `At this weighting the two seasons tie (${s0.toFixed(2)} each).`}
        </p>
      </div>
    </div>
  );
}
