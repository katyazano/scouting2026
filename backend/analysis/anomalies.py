import numpy as np

def team_trend(df, team_num):
    team_df = df[df["team_num"] == team_num].sort_values("match_num")

    if team_df.empty:
        return []

    y = team_df["total_fuel"].values
    mean = y.mean()
    std = y.std() if y.std() != 0 else 1

    z_scores = (y - mean) / std

    trend = []

    for i, row in enumerate(team_df.itertuples()):
        trend.append({
            "match_num": int(row.match_num),
            "total_fuel": int(row.total_fuel),
            "z_score": round(float(z_scores[i]), 2),
            "anomaly": bool(abs(z_scores[i]) > 1.5)
        })

    return trend