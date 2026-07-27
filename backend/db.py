"""SQLite layer.

The processed JSON is loaded into an in-memory SQLite database at startup and
queried with real SQL from the API. Tabular data (seasons, matches, players)
goes into typed columns; the nested analytical documents (model, era, thought
experiment, meta) go into a small key/value `documents` table as JSON. Both are
retrieved via SQL - SQLite is genuinely the query layer here, not decoration.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROCESSED = ROOT / "data" / "processed"


def _load(name: str):
    return json.loads((PROCESSED / name).read_text())


def build_connection() -> sqlite3.Connection:
    """Create an in-memory DB and populate it from data/processed/*.json."""
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE seasons (
            season TEXT PRIMARY KEY, played INTEGER, wins INTEGER, draws INTEGER,
            losses INTEGER, points INTEGER, ppg REAL, goals_for INTEGER,
            goals_against INTEGER, goal_difference INTEGER, xg_for REAL,
            xg_against REAL, xg_difference REAL, unbeaten INTEGER,
            goals_minus_xg_for REAL, goals_minus_xg_against REAL
        )""")
    cur.execute("""
        CREATE TABLE matches (
            season TEXT, match_no INTEGER, date TEXT, opponent TEXT, venue TEXT,
            gf INTEGER, ga INTEGER, result TEXT, points INTEGER,
            xgf REAL, xga REAL, roll_xgf REAL, roll_xga REAL, roll_xgd REAL,
            cum_points INTEGER
        )""")
    cur.execute("""
        CREATE TABLE players (
            season TEXT, player TEXT, position TEXT, apps INTEGER, minutes REAL,
            shots INTEGER, goals INTEGER, xg REAL, assists REAL, xa REAL,
            npg REAL, npxg REAL, goals_minus_xg REAL, xg_per_90 REAL,
            goals_per_90 REAL, xg_per_shot REAL
        )""")
    cur.execute("CREATE TABLE documents (key TEXT PRIMARY KEY, json TEXT)")

    def insert(table: str, rows: list[dict]) -> None:
        if not rows:
            return
        cols = [c[1] for c in cur.execute(f"PRAGMA table_info({table})")]
        placeholders = ",".join("?" for _ in cols)
        cur.executemany(
            f"INSERT INTO {table} ({','.join(cols)}) VALUES ({placeholders})",
            [tuple(r.get(c) for c in cols) for r in rows],
        )

    insert("seasons", _load("seasons.json"))
    insert("matches", _load("matches.json"))
    insert("players", _load("players.json"))
    for key in ("model", "circumstances", "physical", "synthesis", "meta"):
        cur.execute(
            "INSERT INTO documents (key, json) VALUES (?, ?)",
            (key, json.dumps(_load(f"{key}.json"))),
        )

    conn.commit()
    return conn


# --- query helpers (SQL) ----------------------------------------------------
def all_rows(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> list[dict]:
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def one_document(conn: sqlite3.Connection, key: str) -> dict | None:
    row = conn.execute("SELECT json FROM documents WHERE key = ?", (key,)).fetchone()
    return json.loads(row["json"]) if row else None
