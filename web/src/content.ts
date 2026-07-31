// =============================================================================
// EDITABLE COPY  ·  all the report's narrative text lives here
// -----------------------------------------------------------------------------
// Edit the words between the quotes. A few rules:
//   * wrap a phrase in **double asterisks** to make it bold.
//   * wrap a phrase in `backticks` to render it as code (used for tau, exp(...)).
//   * do not use the long em dash ( — ); use commas, colons or full stops.
//   * numbers are written straight into the sentences. The canonical figures
//     come from data/processed/*.json; if you rebuild the data and a number
//     changes, update it here too.
//
// NOT here (by design): the browser tab title and the footer provenance live in
// analysis/build.py (meta). Chart-internal labels (axis titles, legends) and the
// Section D combined-chart's raw-value cards live in components/charts.tsx.
// =============================================================================

export type FromRef = [label: string, anchor: string];

export const content = {
  hero: {
    title: "A framework to measure how hard a title was to win",
    subline:
      "A worked example of turning shot and match data into a read on how hard a title was to win. The table crowns Arsenal's 2003/04 Invincibles over the 2025/26 winners; this asks which was actually harder, by the field each faced and the load each carried. Built from StatsBomb and Understat data through a Poisson expected-points model, every figure tagged fact, model output, or interpretation.",
    cap0304Year: "2003/04",
    cap0304Line: "The Invincibles · 90 pts, unbeaten",
    cap2526Year: "2025/26",
    cap2526Line: "Champions · 85 pts",
    vs: "vs",
  },

  data: {
    eyebrow: "Before we start",
    heading: "Where every number comes from",
    lead: "Everything here comes from public records, so any figure can be checked. Two things to keep in mind.",
    // Each row is [what the data is, where it comes from]. Edit freely.
    sources: {
      "2003/04": [
        ["Shots and xG", "StatsBomb Open Data (event-level)"],
        ["Tables, squads, fixtures", "Public season records"],
        ["Minutes played", "StatsBomb lineups, 90-minute baseline"],
        ["Player ages", "Birthdates, weighted by minutes"],
        ["Prior-season minutes", "FBref 2002/03, via Internet Archive"],
      ],
      "2025/26": [
        ["Shots and xG", "Understat (per-match and per-player)"],
        ["Tables, squads, fixtures", "Public records"],
        ["Minutes played", "Understat"],
        ["Player ages", "Birthdates, weighted by minutes"],
        ["Prior-season minutes", "Understat 2024/25"],
      ],
    },
    caveats: [
      {
        title: "Different xG models",
        body: "The two seasons use different xG models (StatsBomb and Understat), not on the same scale, so xG is compared only within a season, never across the two.",
      },
      {
        title: "Rival strength, by points",
        body: "Shot data for Arsenal's rivals does not exist for 2003/04, so rival strength is measured by league points, which exist for both eras.",
      },
    ],
  },

  a: {
    eyebrow: "Section A",
    heading: "What the table already tells us",
    lead: "The Invincibles finished on **90 points unbeaten**, plus 47 goal difference, 2.37 points per game. The 2025/26 team won the title on **85 points**, 26 wins and 5 losses, plus 44, 2.24 per game. By numbers alone, 2003/04 is the more dominant season.",
    bridge:
      "The table shows which season was more dominant: 2003/04, on every measure. It does not show which was harder to win, and that is a different question with no official answer. This report builds one, from two forces measured in the sections that follow.",
    forceOutsideTag: "External",
    forceOutsideName: "The competitive environment",
    forceOutsideDesc:
      "A stronger, closer field of rivals. The more the chasing pack pressed, the harder the title was to win.",
    forceInsideTag: "Internal",
    forceInsideName: "The squad and body",
    forceInsideDesc:
      "A less settled, more stretched squad: new signings to integrate, a younger or older core, a heavier calendar, all making it harder to carry.",
    forceOutcome: "How hard it was to win the title",
    forcesHandoff: "",
  },

  b: {
    eyebrow: "Section B",
    heading: "External",
    lead: "The first force is external: how strong the rest of the league was. Points total is harder to reach in a strong league. We measure that field as the pressure the chasing pack applied, week by week.",
    p1Title: "Title-race pressure index",
    p1Body: "Each gameweek, every rival counts for more the closer it sits to Arsenal; rivals just behind count extra, since being chased presses harder than chasing; and later weeks count more than August. Summed across the season and indexed to 2003/04 = 1.00, the 2025/26 side comes out at 1.36: about 36% more pressure.",
    mathsLabel: "The maths",
    mathsBody:
      "Each rival's weekly weight is `exp(-|gap| / tau)`, peaking when it is level with Arsenal and fading as the gap grows. Rivals behind Arsenal are multiplied by `beta`. Each week is scaled by `k/38`, so late-season closeness counts more than August.",
    workedTitle: "See the calculation, one gameweek at a time",
    workedSub: "Pick a season and a gameweek to watch that week's pressure get built rival by rival, then scaled by the ramp. Every week summed gives the index.",
    workedNote: "Per-week pressure peaks mid-season for both, when the table is bunched around Arsenal. But 2003/04 then cools as Arsenal pulls clear, while 2025/26 stays contested to the finish. That sustained late pressure is where the 36% gap comes from.",
    p1Reading:
      "In plain terms: 2003/04's nearest rival finished 11 points back and out of it early, while 2025/26's finished 7 back and in the race late, so the title stayed contested longer.",
  },

  c: {
    eyebrow: "Section C",
    heading: "Internal",
    lead: "The second force is internal: the squad Arsenal fielded, and whether it could carry the season. Two measures separate the eras, how settled the squad was and how old. We also looked at the fixture load, but it did not matter much, so it sits as an exploration at the end.",

    // Part 1 - squad stability (moved from Section B)
    stabTitle: "1. Squad stability",
    stabBody1: "A squad that has played together knows its movement and the manager's system; a rebuilt one must build that from scratch, which takes time. So we measure the upheaval three ways: players retained, joined, and departed.",
    stabBody2: "The 2003/04 title squad was familiar: **81.8%** carried over from the previous season, with only 4 new faces. The 2025/26 squad was far less so: **64.0%** carried over, with 9 new players. A regular also leaves a bigger hole than a reserve. So we measure how much of last season's actual playing time walked out the door. By that measure the two eras are actually close: the players who left before 2003/04 covered about **17%** of the previous season's minutes, and before 2025/26 about **16%**.",
    stabCoda: "Roughly the same size of hole, even though 2025/26 changed far more players.",
    stabLimitation:
      "Squad depth and positional cover matter too, but reliable position-by-position data does not exist for 2003/04, and a measure for only one era would not make a fair comparison.",
    stabReading:
      "Both eras lost a similar share of familiar playing time, even though 2025/26 had more player changes.",

    // Part 2 - squad age
    ageTitle: "2. Squad age, weighted by minutes played",
    ageBody1: "We weight each player's age by the minutes they actually played: the age of the team really on the pitch, not everyone on the books.",
    ageBody2: "The Invincibles were a **27.8**-year-old side, 27% of their minutes going to players 30 or over. The 2025/26 side was younger at **26.5**, only 15% to over-30s.",
    ageReading:
      "So 2025/26 was both younger and less settled, still coming together rather than at settled maturity.",

    // Demoted, collapsible exploration - the fixture calendar
    calHeader:
      "We also explored fixture calendar, but was less relevant in this.",
    calBody:
      "The 2025/26 calendar was heavier and more compressed: 63 games to the Invincibles' 59, and 30 on three days' rest or fewer against 19, driven mainly by the larger modern Champions League. The question was whether that cost points. It did not visibly. Points per game held on short rest for both sides (2.42 for 2025/26 and 2.40 for 2003/04, against season averages of 2.24 and 2.37), and with only 10 to 12 short-rest league games each the sample is too small to be decisive. So the calendar was heavier, but there is no clear points cost, and the report does not lean on it.",
    timelineTitle: "The season, match by match",
    timelineSub: "Each tick is a competitive game, Aug to May. Short-rest games are highlighted; shaded bands mark congested stretches, so the December and modern January/February bunching is visible. Hover any tick for the opponent, date and rest (league games; cup and European fixtures show the competition only).",
    calGpsLimitation:
      "Distance, sprints, GPS and recovery data have no 2003/04 equivalent, so none is compared here rather than invented.",
  },

  d: {
    eyebrow: "Section D",
    heading: "Putting the two forces together",
    lead: "Sections B and C measured the two forces separately; this section combines them into one difficulty score per era. Each of the three dimensions is scaled across the two seasons, then averaged using weights you set: title-race pressure (external), plus squad departures and fixture load (internal).",
    synthTitle: "Building the difficulty score",
    weightIntro:
      "The default leans on pressure and departures and weights short-rest low. Move the slider to see how different weights model the difficulty score.",
    weightNote:
      "The score is coarse by design; read the direction, not the decimals: pressure and congestion lean 2025/26, departures lean slightly to 2003/04.",
  },

  e: {
    eyebrow: "Section E",
    heading: "The verdict",
    lead: "Everything measured, in one place, then a call, marked clearly as a judgement, not a finding.",
    tableColDim: "Dimension of difficulty",
    tableColFrom: "From",
    rows: [
      { dim: "Final position / dominance", a: "90 pts, unbeaten", b: "85 pts, 5 losses", from: [["A", "section-a"]] as FromRef[] },
      { dim: "Winning margin over 2nd", a: "11 pts", b: "7 pts", from: [["A", "section-a"], ["B", "section-b"]] as FromRef[] },
      { dim: "Title-race pressure (index)", a: "1.00", b: "1.36", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad retained", a: "81.8%", b: "64.0%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Minutes-weighted departures", a: "16.7%", b: "15.6%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad age (minutes-weighted)", a: "27.8", b: "26.5", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Short-rest games", a: "19 of 59", b: "30 of 63", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Combined difficulty (default weights)", a: "0.45", b: "0.55", from: [["D", "section-d"]] as FromRef[], hi: true },
    ] as { dim: string; a: string; b: string; from: FromRef[]; hi?: boolean }[],
    tableNote: "Each row links back to the section it came from.",
    overPerfNote:
      "Separately, and not a difficulty measure: Arsenal beat the model by +20.6 in 2003/04 and +15.8 in 2025/26, how well it did, not how hard the task was.",
    e2Title: "What the default weighting concludes",
    e2Body: "Under the default weighting, the model gave the 2025/26 season a higher difficulty score, but only narrowly: 0.55 to 0.45. The eras differ sharply on one dimension, title-race pressure, where 2025/26 faced about 36% more. But on the other two metrics, the eras are close: departures slightly favour 2003/04, and the short-rest calendar is weighted down as inconclusive.",
    e3Title: "The verdict, and it is a view",
    e3: [
      "Here I step in with a view. The model puts 2025/26 narrowly ahead. I do not. Going unbeaten across 38 games is not one dimension to be averaged in; it is a different category of hard. It allows no margin, one poor afternoon ends it, and no side has done it since. By the weighting I find most convincing, that makes 2003/04 the harder task.",
      "It is a judgement about what to weight, not a correction of the model, and the margin makes it easy to hold: a narrow lead, not a landslide. When the even-handed read is that close, whether never losing is worth more than everything else is enough to tip it. Weight the dimensions as the model does and 2025/26 edges it; weight the unbeaten run as I do and 2003/04 takes it.",
    ],
    e4Label: "Where this goes next.",
    e4Bullets: [
      "Run the pressure and squad-stability measures across every past title race, for a season-difficulty baseline any campaign can be judged against.",
      "Point the squad-stability measure forward, to estimate what a summer of heavy signings might cost in points before a new group settles.",
      "Widen the internal dimensions with richer data: genuine squad depth, positional cover, and physical tracking, none of which exist cleanly for older seasons yet.",
      "Fold in factors the model cannot yet see, such as opponent-adjusted strength and match state, as data allows.",
    ],
  },
} as const;
