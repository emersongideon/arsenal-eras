// Loads the baked processed JSON from /public/data. Everything is static, so the
// story loads with zero backend dependency. (The FastAPI service exposes the same
// data via a REST/SQL layer, but the site doesn't need it.)
import type {
  Circumstances,
  Congestion,
  Dataset,
  MatchRow,
  Meta,
  ModelResult,
  Physical,
  Season,
  SeasonSummary,
  Synthesis,
  SynthesisD,
} from "./types";

const BASE = "data";

async function getJSON<T>(name: string): Promise<T> {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadDataset(): Promise<Dataset> {
  const [
    meta,
    seasons,
    matches,
    model,
    circumstances,
    physical,
    congestion,
    synthesis,
    synthesisD,
  ] = await Promise.all([
    getJSON<Meta>("meta.json"),
    getJSON<SeasonSummary[]>("seasons.json"),
    getJSON<MatchRow[]>("matches.json"),
    getJSON<Record<Season, ModelResult>>("model.json"),
    getJSON<Circumstances>("circumstances.json"),
    getJSON<Physical>("physical.json"),
    getJSON<Congestion>("congestion.json"),
    getJSON<Synthesis>("synthesis.json"),
    getJSON<SynthesisD>("synthesis_d.json"),
  ]);
  return {
    meta,
    seasons,
    matches,
    model,
    circumstances,
    physical,
    congestion,
    synthesis,
    synthesisD,
  };
}
