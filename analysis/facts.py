"""Final Premier League tables - looked-up, cited HISTORICAL FACT.

Kept in their own module (rather than hard-coded inside computations) so every
figure is auditable. Used by the "circumstances" section for the chasing pack,
title-race margin, and league-points spread. Team names match the match data.
"""

from __future__ import annotations

from .config import S0304, S2526

SOURCES = {
    "pl_2003_04": "https://en.wikipedia.org/wiki/2003%E2%80%9304_FA_Premier_League",
    "pl_2025_26": "https://en.wikipedia.org/wiki/2025%E2%80%9326_Premier_League",
}

# Final league standings, position -> (team, points).
FINAL_TABLE = {
    S0304: [
        ("Arsenal", 90),
        ("Chelsea", 79),
        ("Manchester United", 75),
        ("Liverpool", 60),
        ("Newcastle United", 56),
        ("Aston Villa", 56),
        ("Charlton Athletic", 53),
        ("Bolton Wanderers", 53),
        ("Fulham", 52),
        ("Birmingham City", 50),
        ("Middlesbrough", 48),
        ("Southampton", 47),
        ("Portsmouth", 45),
        ("Tottenham Hotspur", 45),
        ("Blackburn Rovers", 44),
        ("Manchester City", 41),
        ("Everton", 39),
        ("Leicester City", 33),
        ("Leeds United", 33),
        ("Wolverhampton Wanderers", 33),
    ],
    S2526: [
        ("Arsenal", 85),
        ("Manchester City", 78),
        ("Manchester United", 71),
        ("Aston Villa", 65),
        ("Liverpool", 60),
        ("Bournemouth", 57),
        ("Sunderland", 54),
        ("Brighton & Hove Albion", 53),
        ("Brentford", 53),
        ("Chelsea", 52),
        ("Fulham", 52),
        ("Newcastle United", 49),
        ("Everton", 49),
        ("Leeds United", 47),
        ("Crystal Palace", 45),
        ("Nottingham Forest", 44),
        ("Tottenham Hotspur", 41),
        ("West Ham United", 39),
        ("Burnley", 22),
        ("Wolverhampton Wanderers", 20),
    ],
}
