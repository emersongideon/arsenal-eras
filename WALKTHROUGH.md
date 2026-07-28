# Walkthrough - how this project works, and how to explain it

This is a plain-English tour of the codebase, written so I (and any reviewer) can
follow what every part does and **why** it's built that way. For each major
component there's a "what it does", the "key decisions", and a "be ready to
explain" list.

**How this was built, honestly:** I designed and directed this project with AI
assistance (I used an AI coding tool the way you'd use a very fast pair-programmer).
I made the decisions - data sources, the model, the honesty framing, the scope -
and I understand every piece well enough to defend it, which is the point of this
document. I'm describing it that way openly; nothing here pretends to be written
without tooling.

---

## 1. The big picture

The project answers one question: **Arsenal's 2003/04 "Invincibles" vs the 2025/26
title winners - which era faced the harder task?** (Not which squad was better: on the
raw table the Invincibles were the more dominant campaign.) It's a guided, scroll-driven
story with a strict rule: never blend **fact**, **measured** output, and
**interpretation**.

The data flows one direction:

```
 raw sources                 processing (Python)            outputs            consumers
 -----------                 -------------------            -------            ---------
 StatsBomb JSON  ─┐                                       data/processed/      FastAPI  ── /api/*
 (2003/04)        ├─► analysis/ (pandas + scikit-learn) ─►  *.json         ─┬─► (SQLite)
 Understat JSON  ─┘     loaders → transforms → model         (committed)    │
 (2025/26)                                                                  └─► web/ (React) ── static site
```

The key architectural idea: **all the hard work happens once, offline, in the
Python layer, and is saved as small JSON files.** The website and the API both just
read those files. There's no live model call, no database server, no data fetched
at page load. That's why it can be hosted as a free static site.

### Repo map

| Folder | What lives here |
|---|---|
| `analysis/` | The data + model layer (pure Python, importable, tested). This is the brains. |
| `analysis.ipynb` | A narrated notebook that reproduces the analysis with charts - the "show your working" artifact. |
| `backend/` | A small FastAPI REST API that serves the processed data via SQLite. |
| `web/` | The React + TypeScript scroll-telling website. |
| `scripts/` | One-off tools (the Understat fetcher). |
| `tests/` | pytest unit tests for the model, transforms, and section builders. |
| `data/raw/` | Cached source data (git-ignored except the small Understat file). |
| `data/processed/` | The committed JSON that the app consumes. |

---

## 2. The data pipeline (`analysis/`)

### What it does
Turns two very different raw data sources into one clean, identical table shape, so
the two seasons can be compared fairly.

- **`config.py`** - one place for constants (team name, the StatsBomb IDs, the
  90-minute baseline, the rolling-window size). No magic numbers scattered around.
- **`loaders.py`** - reads each raw source and returns the **same columns** for both:
  one row per match with `gf, ga` (goals), `xgf, xga` (expected goals for/against),
  `venue`, `result`, `points`. This "canonical schema" is the join that makes the
  comparison possible.
  - 2003/04 comes from **StatsBomb open data** (shot-by-shot events). I sum each
    shot's xG per team to get match xG, and derive minutes from the lineup data.
    StatsBomb files are downloaded on demand and cached (the 106 MB of events is
    git-ignored; the loader re-fetches if missing).
  - 2025/26 comes from **Understat** (already aggregated per match). The raw pull is
    done once by `scripts/fetch_understat.mjs` and cached as a small JSON.
- **`transforms.py`** - the pandas work: `groupby` to get season summaries, a
  **rolling** window for form, and per-season aggregations. Pure
  functions, so they're easy to test.
- **`facts.py`** - hard, looked-up historical facts (final league tables, how many
  cup/European games each season) with source URLs. Kept separate on purpose so
  every "fact" is auditable.
- **`build.py`** - the conductor: calls everything in order and writes the JSON.

### Key decisions
- **Normalise to a shared schema early.** The messiness of each source is contained
  inside `loaders.py`; everything downstream works on clean, identical DataFrames.
- **Cache everything; commit the small processed outputs.** The app never needs the
  network. A fresh clone rebuilds byte-identical numbers (I verified this).
- **Facts live in code with citations,** not hard-coded inside calculations, so the
  "fact" category is genuinely checkable.

### Be ready to explain
- *Why two different xG sources?* StatsBomb's free data only covers Arsenal's 2003/04
  season; Understat covers the current one. They use **different xG models**, which is
  exactly why the model (next section) is calibrated **per season** rather than
  assuming the two are on the same scale.
- *How are "minutes" derived for 2003/04?* From each player's lineup stint
  timestamps, on a 90-minute regulation baseline (a stated simplification).
- *Is any of this scraped in a fragile way?* Understat sits behind a Cloudflare
  challenge, so the fetch uses a real headless browser once and caches the result -
  it's not fetched live and can't break the site.

---

## 3. The expected-points model (`analysis/model.py`) - the interview crux

This is the "measured" core (Sections A and D). It answers: *given the quality of
chances each team created and conceded, how many points did they actually deserve?*

### The idea in one paragraph
Each match, a team scores some goals. Goals are rare, countable events, so I model
the number of goals a team scores as a **Poisson distribution** whose average rate
(lambda, λ) comes from expected goals (xG). From each team's rate I compute the
probability the match is a win, draw, or loss, convert that to **expected points**
(3 × P(win) + 1 × P(draw)), and add it up over all 38 games. Comparing that total to
the points they actually won shows whether they over- or under-performed what their
chances deserved.

### Why Poisson is a reasonable choice (defend this)
1. **Goals are low-count, discrete, roughly independent events over a fixed period
   (90 minutes).** That's the textbook definition of a Poisson process. Poisson is
   the standard, well-established distribution for modelling goals in football
   analytics (Dixon-Coles 1997 is the classic reference).
2. **xG already estimates a mean number of goals.** The Poisson distribution is
   parameterised by its mean (λ). So xG maps naturally onto λ - they're the same kind
   of quantity (an expected count).
3. **It's simple and interpretable, not a black box.** Every step is explainable, and
   for a one-season, match-level dataset that's the honest choice (a neural net would
   be indefensible over 38 games).

### How it's actually fit (the scikit-learn part)
I do **not** just assume `goals = xG`. Instead I fit a **Poisson regression**
(`sklearn.linear_model.PoissonRegressor`) of *actual goals* on *xG*:

- **Training data:** for each match I use **both perspectives** - (xG-for → goals
  scored) and (xG-against → goals conceded). That's 2 × 38 = **76 data points** per
  season, which is why I fit each season separately (and because the two xG providers
  differ, calibrating separately is correct).
- **What it learns:** the mapping λ = exp(intercept + coef × xG). It's a *generalised
  linear model* with a log link, which is the standard form for Poisson regression.
  This **calibrates** xG to that source's goals - if a provider's xG systematically
  runs a bit high or low, the fit absorbs it.
- **`alpha = 1e-6`:** `alpha` is scikit-learn's L2 regularisation strength. I set it
  almost to zero on purpose - I want a plain maximum-likelihood fit (calibration),
  not shrinkage, because with one feature and a clear relationship there's nothing to
  regularise against.
- **From rates to points** (`match_outcome_probs`): given λ_for and λ_against, I build
  the grid of scorelines with `scipy.stats.poisson`, and sum the probabilities where
  the home team scores more (win), equal (draw), or fewer (loss). Expected points =
  3 × P(win) + 1 × P(draw). The grid is truncated at 10 goals per side (the
  probability of more is negligible - a tested property).

### The sanity check that proves it isn't hand-tuned
For each season the model's **total predicted goals equals the total actual goals**
(99 = 99 for 2003/04, 98 = 98 for 2025/26). That's the calibration guarantee of a
Poisson GLM fit this way, and it's asserted in a test. It means the "expected points"
gap is a real signal, not an artefact of a mis-scaled model.

### The result (and why it's interesting)
Both title teams **beat** their expected points - the hallmark of champions who win
the tight games:
- 2003/04: 90 actual vs ~69 expected (**+20.6**), by *out-finishing* their chances.
- 2025/26: 85 actual vs ~69 expected (**+15.8**), by *out-defending* and winning
  close games despite under-shooting their xG.

### Limitations (say these before a reviewer does)
- **Independence assumption.** I treat the two teams' goal counts in a match as
  independent. In reality they're mildly correlated (game state - a team that's
  winning defends deeper). The classic fix is a **Dixon-Coles adjustment** or a
  **bivariate Poisson**; I'd add that with more time.
- **In-sample calibration only.** With 38 games I fit and evaluate on the same data.
  I'd want cross-validation / a hold-out on a larger dataset before making strong
  claims.
- **Point estimate, no error bars.** "Expected points" is a single number; the honest
  version simulates each match from its λ to get a confidence band. Noted in the
  README's future work.
- **xG is itself a model** with its own assumptions, and the two seasons' xG come from
  different providers - hence per-season calibration and a stated caveat, not a
  direct xG-to-xG comparison.

### Be ready to explain
- *Why not logistic regression / a classifier for W/D/L?* Because goals carry more
  information than the result, and modelling the goal process (Poisson) lets me derive
  the outcome probabilities *and* respects that a 3-0 and a 1-0 are different evidence.
- *Why fit a regression at all instead of using xG directly as λ?* Calibration across
  two different xG sources, and to avoid baking in "goals = xG" as an assumption.

---

## 4. Circumstances, physical, synthesis (`circumstances.py`, `physical.py`, `synthesis.py`)

This is the depth of the argument (Sections B-D), and where the **data-availability
honesty** matters most.

- **`circumstances.py` (Section B)** - two measured angles on how hard the league was:
  - *Field strength - a title-race pressure index.* Quoting the pack's points is shallow
    (a team 30 points back was never a threat), so instead I weight every one of the 19
    rivals by `exp(-gap / tau)` - its points behind the champion, exponentially decayed -
    and sum them into a distance-discounted "effective number of title threats". It's
    highest when several teams finish near the top. This single metric replaces the old
    shallow "who came 2nd/3rd", "winning margin" and "points spread" views. **Measured**
    (a computation on the final tables; rival xG doesn't exist for 2003/04, so it's
    points-based for both).

    *The `tau` robustness check (the interactive chart).* `tau` is the one free knob: it
    sets how fast a rival's weight fades with distance. Low `tau` means pressure fades
    fast, so only very close rivals count; high `tau` means it fades slowly, so even
    distant sides add a little. To avoid defending a single value, `_pressure_sweep()`
    computes the index for both seasons across `tau = 5 -> 20` (step 0.5) and exports it
    as `field_strength.sweep`; the frontend's `PressureRobustnessChart` plots the two
    curves and gives the reader a draggable marker to read off both values at any `tau`.
    How to read it: the 2025/26 (red) line sits above 2003/04 (gold) at every point in the
    range, so the ordering is a property of the field, not of the parameter; only the
    absolute numbers move. Range choice, verified against the printed sweep: below `tau=5`
    both indices sit near zero (unreadable); above `tau=20` the "effective threats" reading
    degrades (distant relegation sides start to count) and the two curves converge toward
    the full 19 rivals - so the gap narrows as `tau` grows and widens as it shrinks, but
    the lines never cross or touch anywhere tested (`tau = 3 -> 40`). The default marker
    sits at `tau=10`, the value quoted in the report body.
  - *Squad stability* - how much upheaval each squad absorbed going into its title
    season, measured three ways off the sourced squad lists: **players retained**
    (share of *this* season's title-winning squad that was at the club the year before -
    81.8% in 2003/04 vs 64.0% in 2025/26), **players joined** (new faces in the league
    squad - 4 vs 9), and **players departed, weighted by minutes**. The minutes weighting
    is the important part: a raw departure count is misleading (2003/04 actually lost
    *more* players, 10 vs 8, but most were fringe). So each departure is weighted by the
    minutes that player played *the season before*, and expressed as a share of the prior
    season's total team minutes that left the club: `departed_minutes_pct =
    sum(prior-season minutes of players who left) / total prior-season team minutes`.
    That needs prior-season (2002/03 and 2024/25) minutes, which the base pipeline did
    not have: 2024/25 comes from Understat (same source family as 2025/26); 2002/03 from
    FBref's Standard Stats, read via an Internet Archive Wayback snapshot because live
    FBref is Cloudflare-gated (cached under `data/raw/` for reproducibility). Names are
    matched across sources with accent/case normalisation plus a tiny alias map (e.g.
    FBref "Oleh Luzhny" -> squad-list "Oleh Luzhnyi"). **Measured.** The result is
    deliberately un-tidy: the minutes-weighted departures come out *comparable* (16.7% in
    2003/04 vs 15.6% in 2025/26 - if anything 2003/04 lost marginally more, losing Seaman,
    Luzhnyi and van Bronckhorst). The upheaval gap between the eras is therefore on the
    *incoming* side (signings + low carryover), not departures - and the report copy says
    exactly that rather than the tidier "more out" story the counts might suggest.
- **`physical.py` (Section C)** - two metrics that exist cleanly for BOTH eras:
  - *Minutes-weighted squad age* - birthdates weighted by that season's league minutes.
  - *Fixture congestion* - games-per-month and rest-gaps, computed from every
    competitive match date. This is where the honesty note lives: modern tracking data
    (distance, sprints, GPS) has **no 2003/04 equivalent**, so it is deliberately
    excluded rather than fabricated.
- **`synthesis.py` (Section D)** - re-reads the measured expected-points model *through*
  the circumstances: not "did they beat their xG?" but "against a stronger or weaker
  field, and in what shape?". It only assembles measured numbers side by side; the
  cumulative reading is presented in the frontend and tagged **interpretation**.

### Be ready to explain
- *Why is rival xG missing for 2003/04, and how is that handled?* Understat (the only
  accessible free xG source that covers non-Arsenal teams) starts in 2014/15, and
  StatsBomb's free data only has Arsenal's matches. So there's no rival xG for 2003/04 -
  the chasing pack is compared on actual points for both eras, and the gap is stated.
- *Why keep "interpretation" separate from the measurements?* Because a stated reading
  ("this points to a harder task") is a judgement, not a number. Presenting it as a
  measured fact would be exactly the dishonesty the whole app is built to avoid.

---

## 5. The API (`backend/`)

### What it does
A small **FastAPI** service that serves the processed data. Endpoints are in the README.

- **`db.py`** - loads the processed JSON into an **in-memory SQLite** database at
  startup and exposes it via real SQL queries. Tabular data goes into typed columns;
  the nested analytical documents go into a small key/value table.
- **`models.py`** - **pydantic** models that type every response.
- **`main.py`** - the routes: seasons, matches, players, model, and the section
  documents (circumstances / physical / synthesis).

### Key decisions
- **No database of record.** The data is tiny and read-only, so a stateful database
  would be pure overhead. SQLite-in-memory gives me genuine SQL (a skill I wanted to
  show) without any of that weight.
- **The API needs no pandas/scikit-learn at runtime.** It's a pure read-only query
  layer over the pre-built JSON, so its dependencies stay minimal (just FastAPI +
  pydantic). I verified it boots from a clean checkout with only
  `backend/requirements.txt` installed.

### Be ready to explain
- *Is the SQL real or decorative?* Real - the list/filter/sort endpoints are
  `SELECT ... WHERE ... ORDER BY` against the SQLite tables.
- *Why does the site work without this API?* See the frontend section - the site reads
  the same JSON directly, so the API is a demonstration and a programmatic option, not
  a dependency.

---

## 6. The frontend (`web/`)

### What it does
A single-page **React + TypeScript** app with two views, switched by a persistent
toggle (choice saved to localStorage):
- **Report** (`ReportView`): the scroll-driven analytical read. Hook, "Before we start:
  the data," then Section A (the surface), B (the field), C (the physical picture),
  D (performance against task), E (what this surfaces).
- **Dashboard** (`DashboardView`): every metric side by side, a head-to-head comparison
  table plus all charts in a grid, for scanning and modelling.

- **`data.ts`** - loads the baked JSON from `/public/data`.
- **`types.ts`** - TypeScript interfaces mirroring the JSON shape (type safety across
  the whole UI).
- **`components/charts.tsx`** - the recharts charts (title race, output bars, the
  interactive `tau`-sweep pressure-index robustness chart in the report plus the
  per-rival pressure bars on the dashboard, squad stability, squad age, fixture
  congestion, expected-points, per-match scatter).
- **`components/ui.tsx`** - shared pieces: the **category badge** (fact / measured /
  model output / interpretation - the honesty system made visual), a scroll-reveal
  wrapper, the GitHub link.
- **`sections/*`** - one file per narrative section.

### Key decisions
- **Static-first.** The site depends on no backend at load time, which is what makes
  free GitHub Pages hosting possible. The FastAPI API is optional.
- **One source of truth for the model maths.** The slider's formula is duplicated in
  JS only because it must run in the browser; the numbers come from the committed spec
  and match the Python function.
- **Accessibility.** All body text meets WCAG AA contrast (checked with computed
  ratios), the layout is responsive to 375 px with no horizontal scroll, and the
  colour-coded chart legend uses shades that are also legible as text.

### Be ready to explain
- *Why mirror the formula instead of calling the API?* So the interaction is instant
  and the site stays fully static/offline. It's a deliberate trade-off, and the values
  are kept consistent with the server.
- *Is the TypeScript actually typed or full of `any`?* Properly typed - eslint is
  configured with `no-explicit-any` and passes with zero warnings.

---

## 7. Tests, tooling, and CI

- **`tests/`** - 17 pytest tests covering the model (probabilities sum to ~1, a
  symmetric match is 50/50, higher xG raises win probability, the calibration
  identity, output shape), the transforms (season tallies, rolling window, derived
  per-90 columns), and the section builders (title-race margin matches the final
  table, league spread, squad-stability counts reconcile, fixture totals match the
  source, age is genuinely minutes-weighted). They test **logic and invariants**, not
  just that code runs.
- **Linters/formatters:** `ruff` for Python (config in `pyproject.toml`) and
  `prettier` + `eslint` (typescript-eslint + react-hooks) for the frontend. All pass
  with zero warnings; commands are in the README.
- **CI/CD:** a GitHub Actions workflow builds the SPA and deploys it to GitHub Pages on
  every push to `main`.

---

## 8. Questions a technical reviewer is likely to ask (honest answers)

**"Both teams beat expected points by ~15-20 - isn't that a lot / is the model
broken?"** No. xG-based expected points is known to under-rate title winners, because
those teams systematically win the coin-flip matches (finishing, goalkeeping, game
management) that the model treats as ~even. The calibration identity (predicted goals
= actual goals) shows the model isn't mis-scaled. The over-performance *is* the
finding.

**"Why is expected points only ~69 for a 90-point season?"** Because the model
deliberately strips out everything beyond chance quality - finishing skill, keeping,
and luck in tight games. 69 is "what the chances alone deserved"; the 21-point gap is
what the Invincibles added on top.

**"You compare xG across two different providers - isn't that apples to oranges?"**
The raw xG numbers aren't directly compared. The model is **calibrated per season** so
each is mapped to its own goals, and the README/UI flag it explicitly. The comparison
is of *expected points* (a calibrated output), plus clearly-labelled context.

**"The independence assumption is wrong."** Agreed, and I say so. Real scorelines are
mildly correlated; the standard fixes are Dixon-Coles or a bivariate Poisson. For this
scope the simpler model is defensible, and the limitation is documented.

**"You're missing rival xG / physical tracking data for 2003/04 - isn't that a hole?"**
It's a deliberate one. Rival-team xG doesn't exist that far back, and physical-tracking
data has no 2003/04 equivalent, so instead of inventing a comparison I use actual points
for the chasing pack and exclude tracking data entirely, with the gap stated in the UI.
Cutting a metric you can't source for both eras is more credible than fabricating one -
that discipline is the point of the whole piece.

**"Aren't the 'suggested readings' just your opinion?"** Yes - and each is badged
**interpretation** and visually walled off from the measurement it sits under. The
numbers are shared; the reading is labelled as a judgement you can disagree with.

**"Why SQLite/FastAPI if the site is static?"** To demonstrate the API/SQL skills the
role asks for, and to offer a programmatic way to query the data. The static site is
the primary deliverable; the API is an honest bonus, not a prop.

**"How much of this did the AI write?"** I directed it with AI assistance and reviewed
and understand all of it - which is what this document demonstrates. The decisions
(sources, model, honesty framing, scope) are mine; the AI accelerated the typing.

---

## 9. What I'd change with more time
- Bivariate Poisson / Dixon-Coles to drop the independence assumption.
- Cross-validation and uncertainty bands (simulate each match from its λ).
- More seasons/teams (the pipeline is parameterised on competition/season/team).
- Player-level physical and defensive metrics, which open xG feeds don't include.
