"""Arsenal Eras - analysis & modeling package.

Modules:
  config      paths + shared constants
  loaders     raw StatsBomb / Understat -> canonical pandas DataFrames
  transforms  cleaning, joining, aggregation (groupby / merge / rolling)
  model       PoissonRegressor xG->goals + Poisson expected-points model
  era         Act 3 "era gap" levers + Act 4 thought-experiment ranges
  build       orchestrates everything -> data/processed/*.json
"""
