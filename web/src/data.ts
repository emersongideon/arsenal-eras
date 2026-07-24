// Loads the baked processed JSON from /public/data. Everything is static, so
// the story loads with zero backend dependency. (The FastAPI service exposes
// the same data + a live thought-experiment endpoint, but the app doesn't need
// it - the Act-4 slider recomputes locally via the mirrored formula below.)
import type {
  Dataset,
  EraData,
  MatchRow,
  Meta,
  ModelResult,
  PlayerRow,
  Season,
  SeasonSummary,
  TeResult,
  ThoughtExperimentSpec,
} from "./types";

const BASE = "data";

async function getJSON<T>(name: string): Promise<T> {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadDataset(): Promise<Dataset> {
  const [meta, seasons, matches, players, model, era, te] = await Promise.all([
    getJSON<Meta>("meta.json"),
    getJSON<SeasonSummary[]>("seasons.json"),
    getJSON<MatchRow[]>("matches.json"),
    getJSON<PlayerRow[]>("players.json"),
    getJSON<Record<Season, ModelResult>>("model.json"),
    getJSON<EraData>("era.json"),
    getJSON<ThoughtExperimentSpec>("thought_experiment.json"),
  ]);
  return { meta, seasons, matches, players, model, era, te };
}

// Client-side mirror of analysis.era.thought_experiment - the single source of
// truth is the Python function; this reproduces its arithmetic so the Act-4
// slider is instant and works offline. Bands come from the spec JSON.
export function computeThoughtExperiment(
  spec: ThoughtExperimentSpec,
  varPoints: number
): TeResult {
  const v = Math.max(spec.var_slider.min, Math.min(spec.var_slider.max, varPoints));
  const fatigue = spec.components[0].band;
  const depth = spec.components[1].band;
  const low = spec.base_points + fatigue[0] + depth[0] + v;
  const high = spec.base_points + fatigue[1] + depth[1] + v;
  return {
    category: "speculative",
    base_points: spec.base_points,
    var_points: Math.round(v * 100) / 100,
    range: { low: Math.round(low * 10) / 10, high: Math.round(high * 10) / 10 },
    midpoint: Math.round(((low + high) / 2) * 10) / 10,
  };
}
