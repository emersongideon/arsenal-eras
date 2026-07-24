// Types mirroring the processed JSON (data/processed/*.json).

export type Season = "2003/04" | "2025/26";
export type Category = "fact" | "measured" | "speculative";

export interface SeasonSummary {
  season: Season;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  ppg: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  xg_for: number;
  xg_against: number;
  xg_difference: number;
  unbeaten: boolean;
  goals_minus_xg_for: number;
  goals_minus_xg_against: number;
}

export interface MatchRow {
  season: Season;
  match_no: number;
  date: string;
  opponent: string;
  venue: "H" | "A";
  gf: number;
  ga: number;
  result: "W" | "D" | "L";
  points: number;
  xgf: number;
  xga: number;
  roll_xgf: number;
  roll_xga: number;
  roll_xgd: number;
  cum_points: number;
}

export interface PlayerRow {
  season: Season;
  player: string;
  position: string;
  apps: number;
  minutes: number;
  shots: number;
  goals: number;
  xg: number;
  assists: number | null;
  xa: number | null;
  goals_minus_xg: number;
  xg_per_90: number;
  goals_per_90: number;
  xg_per_shot: number;
}

export interface ModelMatch {
  match_no: number;
  date: string;
  opponent: string;
  venue: string;
  gf: number;
  ga: number;
  result: string;
  points: number;
  xgf: number;
  xga: number;
  lambda_for: number;
  lambda_against: number;
  p_win: number;
  p_draw: number;
  p_loss: number;
  xpts: number;
}

export interface ModelResult {
  season: Season;
  actual_points: number;
  expected_points: number;
  points_over_expected: number;
  model: {
    type: string;
    intercept: number;
    coef: number;
    n_obs: number;
    calibration_pred_goal_sum: number;
    calibration_actual_goal_sum: number;
  };
  matches: ModelMatch[];
}

export interface EraData {
  var: {
    category: Category;
    headline: string;
    var_introduced: string;
    assumptions: string[];
    estimated_points_swing: { low: number; high: number };
    direction_note: string;
  };
  fixture_load: {
    category: Category;
    headline: string;
    by_competition: Record<Season, Record<string, number>>;
    total: Record<Season, number>;
    european: Record<Season, number>;
    delta_total: number;
    delta_european: number;
    sources: string[];
  };
  schedule_difficulty: {
    category: Category;
    headline: string;
    by_season: Record<
      Season,
      {
        ppg_overall: number;
        ppg_vs_bottom_half: number;
        ppg_vs_top_rivals: number;
        games_vs_bottom_half: number;
        games_vs_top_rivals: number;
        points_vs_bottom_half: number;
        points_dropped_vs_bottom_half: number;
      }
    >;
    sources: string[];
  };
}

export interface ThoughtExperimentSpec {
  category: Category;
  disclaimer: string;
  base_points: number;
  components: { name: string; band: [number, number]; assumption: string }[];
  var_slider: { min: number; max: number; default: number; step: number };
  default: TeResult;
  samples: TeResult[];
}

export interface TeResult {
  category: Category;
  base_points: number;
  var_points: number;
  range: { low: number; high: number };
  midpoint: number;
}

export interface Meta {
  title: string;
  question: string;
  seasons: Season[];
  sources: Record<string, string>;
  model: string;
  honesty_note: string;
}

export interface Dataset {
  meta: Meta;
  seasons: SeasonSummary[];
  matches: MatchRow[];
  players: PlayerRow[];
  model: Record<Season, ModelResult>;
  era: EraData;
  te: ThoughtExperimentSpec;
}
