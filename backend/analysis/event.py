def event_ranges(df, metric_key):
    df = df.copy()

    df["auto_total_pts"] = df["auto_pts"] + (df["auto_hang"] * 15)
    df["tele_climb_pts"] = df["tele_hang"] * 10
    df["tele_total_pts"] = df["tele_pts"] + df["tele_climb_pts"]
    df["match_total_pts"] = df["auto_total_pts"] + df["tele_total_pts"]

    grouped = df.groupby("team_num")

    if metric_key == "auto_total_pts":
        series = grouped["auto_total_pts"]

    elif metric_key == "auto_success_rate":
        series = grouped["auto_active"]

    elif metric_key == "auto_hang_success_rate":
        series = grouped["auto_hang"]

    elif metric_key == "tele_avg_fuel":
        series = grouped["tele_pts"]

    elif metric_key == "tele_mode_hang":
        return {
            "metric": metric_key,
            "data": [
                {
                    "team_num": int(team),
                    "mode": int(grouped.get_group(team)["tele_hang"].mode().iloc[0])
                }
                for team in grouped.groups.keys()
            ]
        }

    elif metric_key == "tele_total_pts":
        series = grouped["tele_total_pts"]

    elif metric_key == "match_avg_total_pts":
        series = grouped["match_total_pts"]

    elif metric_key == "tele_hang_success_rate":
        series = (df["tele_hang"] > 0).groupby(df["team_num"])

    elif metric_key == "break_rate":
        series = grouped["adv_broke"]

    else:
        return {"error": f"Unknown metric '{metric_key}'"}

    return {
        "metric": metric_key,
        "data": [
            {
                "team_num": int(team),
                "min": float(series.get_group(team).min()),
                "avg": float(series.get_group(team).mean()),
                "max": float(series.get_group(team).max()),
            }
            for team in series.groups.keys()
        ]
    }
