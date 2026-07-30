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
    scrollHint: "↓ Start with where the data comes from",
  },

  data: {
    eyebrow: "Before we start · the data",
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
    handoff: "With the sources named, the surface. ↓",
  },

  a: {
    eyebrow: "Section A · The surface",
    heading: "What the table already tells us",
    lead: "The Invincibles finished on **90 points unbeaten**, plus 47 goal difference, 2.37 points per game. The 2025/26 team won the title on **85 points**, 26 wins and 5 losses, plus 44, 2.24 per game. By numbers alone, 2003/04 is the more dominant season.",
    cumeLeadIn:
      "The table gives totals. It hides the shape of each run, so start there: points week by week, and where each line flattens.",
    cumeTitle: "The title race, week by week",
    cumeCaption:
      "Cumulative league points, 2003/04 vs 2025/26. The 2025/26 side lost 5 times (marked); the 2003/04 line never flattened into a defeat.",
    link: "This report is an experiment to see how that might change if measured on different factors.",
    forceOutsideTag: "Outside",
    forceOutsideName: "The field",
    forceOutsideDesc:
      "A stronger, closer field of rivals. The more the chasing pack pressed, the harder the title was to win.",
    forceInsideTag: "Inside",
    forceInsideName: "The squad and body",
    forceInsideDesc:
      "A less settled, more stretched squad: new signings to integrate, a younger or older core, a heavier calendar, all making it harder to carry.",
    forceOutcome: "How hard the title was to win",
    forcesHandoff: "Start on the outside: the field. ↓",
  },

  b: {
    eyebrow: "Section B · The field",
    heading: "Resistance map",
    lead: "The first force is outside: how strong the rest of the league was. The same points total is harder to reach in a strong league, so a title is only as good as the field it beat. We measure that by the pressure the chasing pack applied, how close rivals pushed Arsenal all season.",
    p1Title: "Title-race pressure index",
    p1Body: "Measured week by week, not from the final table: each gameweek, every rival is weighted by how close it sits to Arsenal, with rivals above Arsenal counted double, since chasing is harder than leading. Summed across all 38 weeks, that is the index. Setting 2003/04 at **1.00**, 2025/26 comes out at **1.17**, about 17% more pressure.",
    mathsLabel: "The maths, if you want it",
    mathsBody:
      "Each rival's weight is `exp(-gap / tau)`, where `gap` is its points behind Arsenal and `tau` sets how fast the weight fades. The `2x` for rivals above and the value of `tau` are stated choices; the direction holds across every tested `tau`, and with or without the `2x`.",
    sweepTitle: "The index across every τ",
    sweepSub: "Rather than fix one value of tau, the chart sweeps it. 2025/26 stays above 2003/04 at every setting, so the direction does not depend on the choice.",
    p1Reading:
      "In plain terms: 2003/04's nearest rival finished 11 points back and out of it early, while 2025/26's finished 7 back and in the race late, so the title stayed contested longer.",
    handoff: "That is the field. The other force is the squad that carried the season. ↓",
  },

  c: {
    eyebrow: "Section C · The squad and body",
    heading: "The squad and body",
    lead: "The second force is internal: the squad Arsenal fielded, and whether it could carry the season. It has two sides that show clear differences, how settled the squad was and how old, and one that does not, the fixture load. The first two lead; the calendar sits as an exploration at the end.",

    // Part 1 - squad stability (moved from Section B)
    stabTitle: "1. Squad stability",
    stabBody1: "A squad that has played together knows its movement and the manager's system; one with many new signings has to build that from scratch, which takes time. So we measure the upheaval each squad absorbed three ways: players retained, players joined, and players departed. Departures are weighted by minutes lost, the share of last season's playing time that walked out the door, so losing a key player counts for more than losing a squad filler.",
    stabBody2: "The 2003/04 title squad was highly settled: **81.8%** carried over from the previous season, with only 4 new faces. The 2025/26 squad was far less so: **64.0%** carried over, with 9 new players. But both lost a similar share of playing time to departures. Of every 100 minutes played the previous season, the players who then left took about **17 minutes** in 2003/04 and **16** in 2025/26.",
    stabLimitation:
      "Squad depth and positional cover matter too, and a fuller version of this would include them. We leave them out because reliable position-by-position data does not exist for the 2003/04 squad, and a measure available for only one era would not make a fair comparison.",
    stabReading:
      "Both eras lost a similar share of their core; what set 2025/26 apart was integrating more new players, not a bigger loss of proven quality.",

    // Part 2 - squad age
    ageTitle: "2. Squad age, weighted by minutes played",
    ageBody1: "We weight each player's age by the minutes they actually played: the age of the team really on the pitch, not everyone on the books.",
    ageBody2: "By this measure, the Invincibles were a **27.8**-year-old side, and 27% of their playing minutes went to players aged 30 or over. The 2025/26 side was younger, at **26.5**, with only 15% of minutes going to over-30s.",
    ageReading:
      "So 2025/26 was both younger and less settled, a squad still coming together rather than one at settled maturity.",

    // Demoted, collapsible exploration - the fixture calendar
    calHeader:
      "We also explored the fixture calendar. It turned out not to move the picture, so it sits here rather than above.",
    calBody:
      "The 2025/26 calendar was heavier and more compressed: 63 games to the Invincibles' 59, and 30 on three days' rest or fewer against 19, driven mainly by the larger modern Champions League. The question was whether that cost points. It did not visibly. Points per game held on short rest for both sides (2.42 for 2025/26 and 2.40 for 2003/04, against season averages of 2.24 and 2.37), and with only 10 to 12 short-rest league games each the sample is too small to be decisive. So the calendar was heavier, but there is no clear points cost, and the report does not lean on it.",
    timelineTitle: "The season, match by match",
    timelineSub: "Each tick is a competitive game, Aug to May. Short-rest games are highlighted; shaded bands mark congested stretches, so the December and modern January/February bunching is visible.",
    calGpsLimitation:
      "Distance, sprints, GPS and recovery data have no 2003/04 equivalent, so none is compared here rather than invented.",

    handoff: "Both forces are now measured. Section D combines them. ↓",
  },

  d: {
    eyebrow: "Section D · The synthesis",
    heading: "Putting the two forces together",
    lead: "Sections B and C measured the two forces separately. This section combines them into a single difficulty score for each era. The recipe is simple: each of the three components is scaled across the two seasons, then averaged using weights you can set yourself. Difficulty combines the outside force (title-race pressure) and the inside forces (squad departures and fixture load), nothing else.",
    synthTitle: "Building the difficulty score",
    weightIntro:
      "There is no single right way to weigh three forces, so the weighting is yours. The default leans on pressure and departures and weights short-rest low, since its effect on points was inconclusive. Move the sliders to see the answer shift.",
    weightNote:
      "The score is coarse by design; read the direction, not the decimals: pressure and congestion lean 2025/26, departures lean slightly to 2003/04, and which matters most is the one call the data cannot make for you.",
    handoff:
      "So the model, weighing evenly-ish, gives 2025/26 the harder task, narrowly. Section E weighs it as a person would. ↓",
  },

  e: {
    eyebrow: "Section E · What this surfaces",
    heading: "The verdict",
    lead: "Everything measured, in one place, then a call, marked clearly as a judgement, not a finding.",
    tableColDim: "Dimension of difficulty",
    tableColFrom: "From",
    rows: [
      { dim: "Final position / dominance", a: "90 pts, unbeaten", b: "85 pts, 5 losses", from: [["A", "section-a"]] as FromRef[] },
      { dim: "Winning margin over 2nd", a: "11 pts", b: "7 pts", from: [["A", "section-a"], ["B", "section-b"]] as FromRef[] },
      { dim: "Title-race pressure (index)", a: "1.00", b: "1.17", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad retained", a: "81.8%", b: "64.0%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Minutes-weighted departures", a: "16.7%", b: "15.6%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad age (minutes-weighted)", a: "27.8", b: "26.5", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Short-rest games", a: "19 of 59", b: "30 of 63", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Combined difficulty (default weights)", a: "0.45", b: "0.55", from: [["D", "section-d"]] as FromRef[], hi: true },
    ] as { dim: string; a: string; b: string; from: FromRef[]; hi?: boolean }[],
    tableNote: "Each row links back to the section it came from.",
    overPerfNote:
      "Separately, and not a difficulty measure: Arsenal beat the model by +20.6 in 2003/04 and +15.8 in 2025/26, a measure of how well it did, not how hard the task was.",
    e2Title: "What the default weighting concludes",
    e2Body: "Under the default weighting, the model gives 2025/26 the harder task, but narrowly: 0.55 to 0.45. The gap rests on a title race tighter by about 17% and a less settled squad; the calendar is weighted down as inconclusive. The honest read is not a clear win, but a marginal one on a weighting you can change.",
    e3Title: "The verdict, and it is a view",
    e3: [
      "Here I step in with a view, marked as a view, not a finding. The model puts 2025/26 narrowly ahead. I do not. Going unbeaten across 38 games is not one force to be averaged in; it is a different category of hard. It allows no margin, one poor afternoon ends it, and no side has done it since. By the weighting I find most convincing, that makes 2003/04 the harder task.",
      "It is a judgement about what to weight, not a correction of the model, and the margin makes it easy to hold: the model's lead for 2025/26 is only 0.55 to 0.45, resting on a race tighter by 17%, not a landslide. When the even-handed read is that close, whether never losing is worth more than everything else is enough to tip it. Weight the forces as the model does and 2025/26 edges it; weight the unbeaten run as I do and 2003/04 takes it.",
    ],
    e4Label: "Where this goes next.",
    e4Bullets: [
      "Run the pressure and squad-stability measures across every past title race, for a season-difficulty baseline any campaign can be judged against.",
      "Point the squad-stability measure forward, to estimate what a summer of heavy signings might cost in points before a new group settles.",
      "Widen the inside forces with richer data: genuine squad depth, positional cover, and physical tracking, none of which exist cleanly for older seasons yet.",
      "Fold in factors the model cannot yet see, such as opponent-adjusted strength and match state, as data allows.",
    ],
  },
} as const;
