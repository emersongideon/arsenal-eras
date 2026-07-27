// Types mirroring the processed JSON (data/processed/*.json).

export type Season = "2003/04" | "2025/26";
export type Category = "fact" | "measured" | "interpretation";

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

// --- Section B: circumstances ---------------------------------------------
export interface PressureContribution {
  pos: number;
  team: string;
  points: number;
  gap: number;
  pressure: number;
}

export interface Circumstances {
  field_strength: {
    tau: number;
    xg_note: string;
    by_season: Record<
      Season,
      {
        champion: string;
        champion_points: number;
        runner_up: string;
        runner_up_points: number;
        margin: number;
        pressure_index: number;
        teams_within_10: number;
        teams_within_15: number;
        pressure_by_tau: Record<string, number>;
        contributions: PressureContribution[];
      }
    >;
  };
  squad_continuity: {
    by_season: Record<
      Season,
      {
        prior_season: string;
        squad_size: number;
        retained: number;
        incoming: number;
        outgoing: number;
        retention_pct: number;
      }
    >;
  };
  sources: { final_tables: string[]; squads: string[] };
}

// --- Section C: physical ---------------------------------------------------
export interface Physical {
  squad_age: {
    by_season: Record<
      Season,
      {
        reference_date: string;
        minutes_weighted_age: number;
        simple_mean_age: number;
        youngest: number;
        oldest: number;
        u23_minutes_share: number;
        over30_minutes_share: number;
      }
    >;
  };
  fixture_congestion: {
    note: string;
    by_season: Record<
      Season,
      {
        total_games: number;
        span_days: number;
        games_per_month: { label: string; games: number }[];
        busiest_month: string;
        busiest_month_games: number;
        min_rest_days: number;
        median_rest_days: number;
        short_rest_count: number;
      }
    >;
  };
  tracking_note: string;
  sources: { fixtures: string[]; birthdates: string };
}

// --- Section D: synthesis --------------------------------------------------
export interface Synthesis {
  by_season: Record<
    Season,
    {
      actual_points: number;
      expected_points: number;
      points_over_expected: number;
      runner_up_points: number;
      margin_to_second: number;
      pressure_index: number;
      retention_pct: number;
      incoming: number;
    }
  >;
}

export interface Meta {
  title: string;
  question: string;
  starting_fact: string;
  seasons: Season[];
  sources: Record<string, string>;
  model: string;
  honesty_note: string;
}

export interface Dataset {
  meta: Meta;
  seasons: SeasonSummary[];
  matches: MatchRow[];
  model: Record<Season, ModelResult>;
  circumstances: Circumstances;
  physical: Physical;
  synthesis: Synthesis;
}
