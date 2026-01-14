def event_ranges(df):
    metrics = {
        "auto_pts": "Auto Points",
        "tele_pts": "Teleop Points",
        "total_fuel": "Total Points",
        "auto_hang": "Auto Climb",
        "tele_hang": "Teleop Climb",
        "climb_total": "Total Climb (RP)"
    }

    result = {}

    for col, label in metrics.items():
        if col not in df.columns:
            continue  # seguridad extra

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