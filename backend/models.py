"""Typed pydantic request/response models for the API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SeasonSummary(BaseModel):
    season: str
    played: int
    wins: int
    draws: int
    losses: int
    points: int
    ppg: float
    goals_for: int
    goals_against: int
    goal_difference: int
    xg_for: float
    xg_against: float
    xg_difference: float
    unbeaten: bool
    goals_minus_xg_for: float
    goals_minus_xg_against: float


class Match(BaseModel):
    season: str
    match_no: int
    date: str
    opponent: str
    venue: str
    gf: int
    ga: int
    result: str
    points: int
    xgf: float
    xga: float
    roll_xgf: float
    roll_xga: float
    roll_xgd: float
    cum_points: int


class Player(BaseModel):
    season: str
    player: str
    position: str
    apps: int
    minutes: float
    shots: int
    goals: int
    xg: float
    assists: float | None = None
    xa: float | None = None
    npg: float | None = None
    npxg: float | None = None
    goals_minus_xg: float
    xg_per_90: float
    goals_per_90: float
    xg_per_shot: float


class HealthResponse(BaseModel):
    status: str
    seasons: list[str]
    matches: int = Field(..., description="total match rows loaded")
