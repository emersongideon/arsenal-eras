"""Hard historical facts used in Act 3 (the "era gap").

These are category (a) - HISTORICAL FACT. They are not derived from the xG data;
they are looked-up, sourced figures. They live in their own module (rather than
being hard-coded inside computations) so every number is auditable and cited.

Sources are Wikipedia season/competition pages unless noted; see SOURCES.
"""
from __future__ import annotations

from .config import S0304, S2526

SOURCES = {
    "pl_2003_04": "https://en.wikipedia.org/wiki/2003%E2%80%9304_FA_Premier_League",
    "pl_2025_26": "https://en.wikipedia.org/wiki/2025%E2%80%9326_Premier_League",
    "arsenal_2003_04": "https://en.wikipedia.org/wiki/2003%E2%80%9304_Arsenal_F.C._season",
    "ucl_2026_final": "https://en.wikipedia.org/wiki/2026_UEFA_Champions_League_final",
    "efl_2025_26": "https://en.wikipedia.org/wiki/2025%E2%80%9326_EFL_Cup",
}

# --- Fixture load: competitive matches by competition (fatigue proxy) --------
# 2025/26 note: Arsenal did NOT contest the Community Shield (won no 24/25
# qualifying trophy). The Champions League moved to the 36-team league-phase
# format in 2024, so the European campaign is 8 league games + knockouts; in
# 2025/26 Arsenal reached the final (lost to PSG) = 15 UCL games.
FIXTURE_LOAD = {
    S0304: {
        "Premier League": 38,
        "FA Cup": 5,
        "League Cup": 5,
        "Champions League": 10,
        "Community Shield": 1,
        "total": 59,
        "european": 10,
    },
    S2526: {
        "Premier League": 38,
        "FA Cup": 4,
        "League Cup": 6,
        "Champions League": 15,
        "Community Shield": 0,
        "total": 63,
        "european": 15,
    },
}

# --- Final Premier League tables (position -> (team, points)) -----------------
# Used to identify "bottom-half" opponents (positions 11-20) for the
# schedule-difficulty lever. Team names are normalised to match the match data.
FINAL_TABLE = {
    S0304: [
        ("Arsenal", 90), ("Chelsea", 79), ("Manchester United", 75),
        ("Liverpool", 60), ("Newcastle United", 56), ("Aston Villa", 56),
        ("Charlton Athletic", 53), ("Bolton Wanderers", 53), ("Fulham", 52),
        ("Birmingham City", 50), ("Middlesbrough", 48), ("Southampton", 47),
        ("Portsmouth", 45), ("Tottenham Hotspur", 45), ("Blackburn Rovers", 44),
        ("Manchester City", 41), ("Everton", 39), ("Leicester City", 33),
        ("Leeds United", 33), ("Wolverhampton Wanderers", 33),
    ],
    S2526: [
        ("Arsenal", 85), ("Manchester City", 78), ("Manchester United", 71),
        ("Aston Villa", 65), ("Liverpool", 60), ("Bournemouth", 57),
        ("Sunderland", 54), ("Brighton & Hove Albion", 53), ("Brentford", 53),
        ("Chelsea", 52), ("Fulham", 52), ("Newcastle United", 49),
        ("Everton", 49), ("Leeds United", 47), ("Crystal Palace", 45),
        ("Nottingham Forest", 44), ("Tottenham Hotspur", 41),
        ("West Ham United", 39), ("Burnley", 22), ("Wolverhampton Wanderers", 20),
    ],
}


def bottom_half_teams(season: str) -> set[str]:
    """Teams finishing 11th-20th (the weaker half of the division)."""
    return {team for team, _ in FINAL_TABLE[season][10:]}


def top_teams(season: str) -> set[str]:
    """Teams finishing 2nd-6th (the strongest realistic rivals; excl. Arsenal)."""
    return {team for team, _ in FINAL_TABLE[season][1:6]}
