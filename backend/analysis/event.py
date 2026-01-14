def event_ranges(df):
    metrics = {
        "auto_pts": "Auto Points",
        "tele_pts": "Teleop Points",
        "total_fuel": "Total Points",
        "climb_auto": "Auto Climb",
        "climb_tele": "Teleop Climb",
        "climb_total": "Total Climb"
    }

    result = {}

    for col, label in metrics.items():
        grouped = df.groupby("team_num")[col]

        result[col] = {
            "label": label,
            "data": grouped.agg(
                min="min",
                median="median",
                max="max"
            ).reset_index().to_dict(orient="records")
        }

    return result