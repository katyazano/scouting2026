import numpy as np

def team_trend(df, team_num):
    team_df = (
        df[df["team_num"] == team_num]
        .sort_values("match_num")
        .copy()
        .reset_index(drop=True)   # 👈 CLAVE
    )

    if team_df.empty:
        return []

    # ---- Métrica real por match ----
    team_df["auto_total_pts"] = team_df["auto_pts"] + (team_df["auto_hang"] * 15)
    team_df["tele_total_pts"] = team_df["tele_pts"] + (team_df["tele_hang"] * 10)
    team_df["match_total_pts"] = (
        team_df["auto_total_pts"] + team_df["tele_total_pts"]
    )

    y = team_df["match_total_pts"].to_numpy()

    mean = y.mean()
    std = y.std() if y.std() != 0 else 1

    z_scores = (y - mean) / std

    trend = []

    for i, row in team_df.iterrows():
        trend.append({
            "match_num": int(row["match_num"]),
            "match_total_pts": int(row["match_total_pts"]),
            "z_score": round(float(z_scores[i]), 2),
            "anomaly": bool(abs(z_scores[i]) > 1.5),
        })

    return trend
