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
      "A worked example of turning shot-level and match data into a repeatable read on how hard a title was to win. The case study is Arsenal's two title sides, the unbeaten 2003/04 Invincibles and the 2025/26 winners: the table already crowns 2003/04 the more dominant, so the real question is which title was the harder to win, measured through the field each faced and the physical load each carried. Built from StatsBomb and Understat event data through a Poisson expected-points model, with every figure tagged as fact, model output, or interpretation.",
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
    lead: "Everything here is built from public records, so any figure can be checked or rebuilt. Here is what goes into each season, and two things to keep in mind when reading the numbers.",
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
    caveatsHeading: "Two things to keep in mind",
    caveats: [
      {
        title: "xG is compared within a season, never across the two",
        body: "Expected goals (xG) is a model's estimate of how many goals the chances a team created should have produced. But 2003/04's xG comes from StatsBomb's model and 2025/26's from Understat's, and the two grade the same chance a little differently, like two thermometers calibrated in different units. Their numbers are not on one shared scale, so we only ever compare a season's xG to itself (did Arsenal beat or fall short of its own xG?), never one era's xG figure against the other's.",
      },
      {
        title: "Rival strength is judged on league points",
        body: "Shot data exists for Arsenal in 2003/04, but not for its rivals that season. So to measure how strong the chasing pack was, we use final league points, which exist for every club in both eras and can be compared directly.",
      },
    ],
    handoff: "With the sources named, the surface. ↓",
  },

  a: {
    eyebrow: "Section A · The surface",
    heading: "What the table already tells us",
    lead: "The Invincibles finished on **90 points unbeaten**, plus 47 goal difference, 2.37 points per game. The 2025/26 team won the title on **85 points**, 26 wins and 5 losses, plus 44, 2.24 per game. By numbers alone, 2003/04 is the more dominant season.",
    cumeLeadIn:
      "First, just the shape of each title run: points accumulating week by week. Watch where each line flattens: a flat step is a game that did not bring three points.",
    cumeTitle: "The title race, week by week",
    cumeCaption:
      "Cumulative league points earned by Arsenal across all 38 matches, 2003/04 vs 2025/26. The 2025/26 side lost 5 times, marked as dots on its line; each is a flat step where no points came. The 2003/04 line has none: unbeaten, it never once flattened into a defeat.",
    xgTitle: "Attack and defence: goals vs expected goals",
    xgInfo:
      "**Goals for** = goals Arsenal actually scored. **Goals against** = goals Arsenal actually conceded. **xG for** = expected goals, the quality-weighted total of the chances Arsenal created (how many they should have scored). **xG against** = the same for chances they allowed (how many they should have conceded).",
    xgSub: "Season totals for both ends of the pitch, grouped by season and labelled with their values.",
    xgNote:
      "2003/04 scored more than its xG (strong finishing), while 2025/26 scored fewer than its high xG but conceded fewer than expected (a defensively efficient title).",
    link: "These two charts show what each season looked like on the surface: how the points came, and how the goals matched the chances. Neither yet says how **hard** that surface was to produce. That is what the rest of the report measures, starting with the two forces below.",
    forcesHeading: "How hard was each title to win?",
    forcesLead:
      "The table tells us how dominant each season was, not how hard it was to win. Those are different questions, and the second one has no official answer, so this report proposes one. The claim is simple: how hard a title was to win can be captured by a short list of measurable factors, and those factors fall into two forces. The resistance from outside is how strong the rest of the league was. The strain from inside is how settled the squad was and how much physical load it carried. Sections B and C measure each factor for both eras; Section D then scales them onto one axis and averages them into a single difficulty score, laid out so you can see every factor that went in and reweight it yourself.",
    forceOutsideTag: "Outside",
    forceOutsideName: "The field",
    forceOutsideDesc: "How much resistance the rest of the league applied.",
    forceInsideTag: "Inside",
    forceInsideName: "The squad and body",
    forceInsideDesc: "How settled the squad was and how heavy the physical load it carried.",
    forceOutcome: "How hard the title was to win",
    forcesHandoff: "We start on the outside: how much resistance the league itself applied. ↓",
  },

  b: {
    eyebrow: "Section B · The field",
    heading: "Resistance map",
    lead: "This is the first of the two forces from the framework: the resistance from outside, meaning how strong the rest of the league was. The same points total is harder to reach in a strong league than a weak one, so a title is only as impressive as the field it was won against. We measure that field two ways: how much title-race pressure the chasing pack applied, and how settled the squad was that delivered the title. Both can be measured for each era.",
    p1Title: "1. Title-race pressure index",
    p1Body: "The resistance the rest of the table applied can be captured in a single measure. The idea: a rival breathing down your neck all season is a far harder test than one that fell away early, so the closer a rival finishes, the more pressure it represents. We add up that pressure across every rival to get a title-race pressure index. The higher the index, the more genuine title threats the team had to hold off, and so the harder the title was to win.",
    mathsLabel: "The maths, if you want it",
    mathsBody:
      "Each rival's weight is `exp(-gap / τ)`, where `gap` is the points it finished behind Arsenal and `τ` sets how fast that weight fades as a rival finishes further back. We use exponential decay so the weight fades smoothly rather than cutting off sharply at an arbitrary points gap. The index is the sum of these weights across all rivals.",
    tauTitle: "What τ does",
    tauSub: "The x-axis is how many points a rival finished behind Arsenal; the y-axis is the weight that rival gets. τ controls how fast the weight falls as a rival finishes further back. A **high** τ means the weight falls slowly, so even rivals who finished well behind still count for something (a far-back rival still matters). A **low** τ means the weight falls fast, so only rivals who finished very close count at all. In short: higher τ means distant rivals still matter; lower τ means only close rivals matter.",
    sweepTitle: "The index across every τ",
    sweepSub: "Rather than defend a single value of τ, the chart sweeps it across its usable range. Drag the marker to read the index for each season at any τ.",
    p1Reading:
      "What that more crowded race meant in plain terms: in 2003/04 the nearest rival finished 11 points behind, already out of the race with games to spare. In 2025/26 the nearest rival finished just 7 points behind and was still within reach late on. Arsenal could not ease off in 2025/26 the way the Invincibles could once they had pulled clear. That is what more title-race pressure means: the title stayed contested for longer.",
    p2Title: "2. Squad stability",
    p2Body1: "A settled team and a rebuilt one are not facing the same job. A squad that has played together knows its movement and the manager's system; one with many new signings has to build that from scratch, which takes time. So we measure the upheaval each squad absorbed three ways: players retained, players joined, and players departed, weighting departures by the minutes those players had played the season before, so losing a key player counts for more than losing a squad filler.",
    p2Body2: "The 2003/04 title squad was highly settled: **81.8%** carried over from the previous season, with only 4 new faces. The 2025/26 squad was far less so: **64.0%** carried over, with 9 new players. But the two lost a similar share of their proven playing time. Imagine last season as 100 minutes on the pitch: the players who left before 2003/04 accounted for about 17 of them, before 2025/26 about 16.",
    p2Limitation:
      "Squad depth and positional cover matter too, and a fuller version of this would include them. We leave them out because reliable position-by-position data does not exist for the 2003/04 squad, and a measure available for only one era would not make a fair comparison.",
    p2Reading:
      "So the eras differ less than the raw squad turnover suggests. Both lost a similar share of their established core; what set 2025/26 apart was the number of new players it had to integrate, not a bigger loss of proven quality. It was a harder integration job, not a deeper rebuild.",
    handoff: "The field is one half of the task. The calendar is the other. ↓",
  },

  c: {
    eyebrow: "Section C · The physical picture",
    heading: "When the body breaks, a title race slips away",
    lead: "The second force is internal: the physical demand the season placed on the squad, and whether the squad could carry it. A title is a nine-month test of endurance as much as quality, and when legs go, leads slip. We measure this two ways that exist cleanly for both eras: how old the side that actually played was, and how heavy and compressed its fixture schedule was. Then we test the thing that actually matters: did the physical load show up in dropped points?",
    p1Title: "1. Squad age, weighted by minutes played",
    p1Body1: "Age matters physically, but a simple squad average is misleading, because a 34-year-old who barely featured would count the same as a 24-year-old who played every week. So we weight each player's age by the minutes they actually played. This answers the more useful question: how old was the team that was really on the pitch, not how old is everyone on the books.",
    p1Body2: "By this measure, the Invincibles were a **27.8**-year-old side, and 27% of their playing minutes went to players aged 30 or over. The 2025/26 side was younger, at **26.5**, with only 15% of minutes going to over-30s.",
    p1Reading:
      "An older side carries more experience but usually less physical margin over a long, congested season. The Invincibles were the older team; 2025/26 was younger. On its own this settles nothing, but it sets up the real test: how heavy was the schedule each side had to survive, and did it cost them? That is what the fixture load, and then the points, will show.",
    p2Title: "2. Fixture congestion, all competitions",
    p2Body1: "Games are only half the load; how tightly they are packed is the other half. Playing 60 matches with a clear week between each is very different from playing them in bunches with two or three days' rest, when players cannot fully recover before the next one. So we measure two things from the actual match dates across every competition: how many games each side played, and how often those games came after only a short rest.",
    p2Body2: "The 2025/26 side played **63 games** to the Invincibles' **59**, and **30** of those came after three days' rest or fewer, against **19** for the Invincibles. The gap is driven mainly by the modern Champions League, which is larger and runs deeper into the calendar than the 2003/04 version.",
    restTitle: "How much rest before each game",
    restSub: "Every game bucketed by the days since the previous match. The 2025/26 side sits far more heavily in the short-rest buckets.",
    calloutLabel: "The significant difference",
    calloutBody: "The shift is in how often games came thick and fast. 2025/26 played **30 of its 63 games** on three days' rest or fewer, close to half; the Invincibles played **19 of 59**, closer to a third. The single busiest month was heavier too: **9 games in Jan 2026** against 8 in Dec 2003. The timeline below shows where those short-rest games bunched into congested stretches.",
    timelineTitle: "The season, match by match",
    timelineSub: "Each tick is one competitive game, placed by date from August to May. Short-rest games are highlighted, and shaded bands mark congested stretches where three or more games came in quick succession, so it is visible where the calendar bunched up (December, and the modern January and February European weeks).",
    ppgBeatTitle: "Did the compressed schedule cost points?",
    ppgBeatSub: "The real test: did either side actually drop more points when it played on short rest? We line the same rest-gaps up against the points won in each league game.",
    ppgChartTitle: "League points per game, by rest before the match",
    ppgChartSub: "Points per game over the 38 league matches each season, split by the rest before each game (measured across all competitions). Dashed lines mark each season's overall PPG. Sample sizes are shown on the bars.",
    ppgSample: "Short-rest games: 2003/04 n=10, 2025/26 n=12. Normal-rest: n=28 and n=26. The short-rest buckets are small, so treat the per-bucket figures as indicative rather than decisive.",
    p2Reading:
      "So the compressed calendar did not, in the end, cost points: 2025/26's points per game held up in short-rest games rather than dropping. That matters for how we read the physical picture. The schedule was heavier, but the side absorbed it, so the more telling physical difference between the two eras is not the calendar but the age of the team carrying it, which is where we started this section.",
    limitation:
      "Distance covered, high-intensity sprints, GPS load and recovery data have no 2003/04 equivalent, so none of it is compared here. Any cross-era comparison of those would be invented. Flagging the gap is the more useful call than filling it with a number that cannot be sourced.",
    handoff: "Both forces are now measured, the field outside and the strain inside. Section D combines them. ↓",
  },

  d: {
    eyebrow: "Section D · The synthesis",
    heading: "Putting the two forces together",
    lead: "Sections B and C measured the two forces separately: the resistance from outside, and the strain from inside. Combining them cleanly needs squad and fixture detail that only exists to a consistent standard for Arsenal, so this section does two things: it places every club on the outside force, measured the same way for all, and then applies the full two-force method to Arsenal, the one club with complete data.",
    p1Title: "1. The whole league on the outside force",
    p1Body: "This plane shows the **outside force only**, measured the same way for all 20 clubs. Along the bottom is field resistance, the position-race pressure each club faced from the rest of the table; up the side is over-performance, actual points minus what the same Poisson expected-points model said its performances deserved. A club in the top-right faced a crowded field and still beat the model. The inside force (squad stability, fixture load) is not on this axis, because it cannot be measured to the same standard for rival clubs; it is handled for Arsenal below.",
    scatterSub: "Arsenal is highlighted in red; hover or tap any dot for its club and values. The dashed line is the model's expectation (zero over-performance).",
    p1Reading: [
      "Arsenal sits far top-left: it faced the least crowded title race in the league, because it pulled clear at the top, but it beat its expected points by more than any other club (+15.8). Its story on this plane is vertical, not horizontal. It did not survive a dogfight; it over-delivered against its own underlying numbers by the widest margin in the division.",
      "This looks like it contradicts Section B, which found 2025/26's title race more crowded than 2003/04's. It does not: the reference points differ. Compared to the Invincibles' cakewalk, 2025/26 was a tighter race. Compared to this season's mid-table, where Chelsea, Fulham and Brighton sat packed together around a field resistance of 9, Arsenal's race at the top was the most one-sided in the league. Crowding depends on who you measure against.",
      "The \"hard field and still beat the model\" quadrant, top-right, belongs to sides like Sunderland (+9.6 in a crowded lower-mid-table) and Fulham. Arsenal's achievement is a different shape: not resistance overcome, but expectation exceeded.",
    ],
    p2Title: "2. The full method, applied to Arsenal",
    p2Body: "The full two-force method needs squad and fixture detail that is only cleanly available for Arsenal, so here we apply the complete method to the one club we have full data for, across its two complete-data seasons. This is the formalisation held back from the framework diagram: **difficulty** is an equal-weighted average of the normalised outside and inside components, and **over-performance** is actual minus expected points.",
    combinedSub: "Raw components, 2003/04 vs 2025/26: title-race pressure 0.85 vs 1.36; minutes-weighted departures 16.7% vs 15.6%; short-rest share 32.2% vs 47.6%. Each is normalised to 0 to 1 across the two seasons, then averaged.",
    recipeLabel: "The recipe, and it is tunable",
    recipeBody:
      "Difficulty combines three components, each normalised to 0 to 1 across the seasons compared, then averaged with equal weight: the outside force (title-race pressure), and two inside forces (minutes-weighted departures, and the short-rest share of games). The equal weighting is a default choice, not a fact. A club would tune these weights to its own priorities; the method holds whatever weights you pick, which is the point of making it explicit rather than hiding it in a single number.",
    p2Reading:
      "Applying the full method to Arsenal's two complete-data seasons, the equal-weighted difficulty comes out higher for 2025/26 (0.67) than 2003/04 (0.33). It is a genuine trade-off, not a landslide: 2025/26 faced more title-race pressure and a far more congested calendar, while 2003/04 lost marginally more of its proven playing time to departures. Two of the three forces point to 2025/26 as the harder task. This is the model's even-handed reading, with every force weighted equally. Whether that is the right weighting, and whether it settles the question, is what the final section takes up.",
    limitation:
      "This synthesis is 2025/26-only for the peer scatter. The same view cannot be built for 2003/04 because shot data for Arsenal's rivals does not exist for that season, so the other clubs' scores could not be computed. The full combined method is shown for Arsenal alone, because squad stability and fixture load could not be measured to the same standard for rival clubs. None of the peers' inside-force values were estimated or faked.",
    handoff: "What the whole picture surfaces. ↓",
  },

  e: {
    eyebrow: "Section E · What this surfaces",
    heading: "The verdict",
    lead: "Everything the report measured, in one place, and then a call, marked clearly as a judgement rather than a finding.",
    tableColDim: "Dimension of difficulty",
    tableColFrom: "From",
    rows: [
      { dim: "Final position / dominance", a: "90 pts, unbeaten", b: "85 pts, 5 losses", from: [["A", "section-a"]] as FromRef[] },
      { dim: "Winning margin over 2nd", a: "11 pts", b: "7 pts", from: [["A", "section-a"], ["B", "section-b"]] as FromRef[] },
      { dim: "Title-race pressure (own era)", a: "0.85", b: "1.36", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad retained", a: "81.8%", b: "64.0%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Minutes-weighted departures", a: "16.7%", b: "15.6%", from: [["B", "section-b"]] as FromRef[] },
      { dim: "Squad age (minutes-weighted)", a: "27.8", b: "26.5", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Short-rest games", a: "19 of 59", b: "30 of 63", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Points under congestion", a: "held (no drop)", b: "held (no drop)", from: [["C", "section-c"]] as FromRef[] },
      { dim: "Model over-performance", a: "+20.6", b: "+15.8", from: [["D", "section-d"]] as FromRef[] },
      { dim: "Combined difficulty (equal weight)", a: "0.33", b: "0.67", from: [["D", "section-d"]] as FromRef[], hi: true },
    ] as { dim: string; a: string; b: string; from: FromRef[]; hi?: boolean }[],
    tableNote: "Each row links back to the section it came from.",
    e2Title: "What the model concludes, weighted evenly",
    e2Body: "Weighted evenly, the model reaches a clear answer: 2025/26 faced the harder task. It won against a tighter field, with a less settled squad, across a more congested calendar, and its combined difficulty score (0.67) sits well above 2003/04's (0.33). Two of the three forces point the same way. If difficulty is the even-weighted sum of these forces, 2025/26 is the harder title.",
    e3Title: "The verdict, and it is a view",
    e3: [
      "Here I will step in with a view, and mark it clearly as a view, not a finding. The model weights the three forces equally. I do not. To me, going unbeaten across all 38 games is not one force among several to be averaged in; it is a different category of hard. It allows no margin. One poor afternoon anywhere across nine months ends it, and no side has managed it since. A high combined difficulty score reflects a season that was demanding on average; an unbeaten season reflects one that was unforgiving at every single step. By the weighting I find most convincing, that makes 2003/04 the harder task.",
      "I want to be honest about what that is. It is a judgement about what to weight, not a correction of the model. The even-handed reading points to 2025/26, and anyone who weights the three forces as the model does, rather than singling out the unbeaten run as I have, would reasonably conclude 2025/26 was harder. The data lays out the trade-off cleanly; which way it tips depends on the one choice the data cannot make for you, and I have made mine.",
    ],
    e4Label: "Where this goes next.",
    e4Bullets: [
      "Run the pressure index and squad-stability measures across every past title race, building a season-difficulty baseline any campaign can be judged against.",
      "Point the squad-stability read forward, estimating how much a summer of heavy signings might cost in points before a new group settles.",
      "Extend the peer scatter's inside-force axis once league-wide squad and fixture data is sourced, placing any club fully on both forces.",
      "And with richer data there are further factors, opponent-adjusted strength and match-state among them, that the model could fold in from here.",
    ],
  },
} as const;
