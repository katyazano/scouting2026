def team_overview(df, team_num):
    team_df = df[df["team_num"] == team_num]

    if team_df.empty:
        return {"error": "Team not found"}

    overview = {
        "team_num": int(team_num),

        "matches_played": int(len(team_df)),

        "auto_success_rate": float(team_df["auto_active"].mean()),

        "avg_auto_pts": float(team_df["auto_pts"].mean()),
        "avg_tele_pts": float(team_df["tele_pts"].mean()),
        "avg_total_fuel": float(team_df["total_fuel"].mean()),

        "break_rate": float(team_df["adv_broke"].mean()),

        "climb_success_rate": float(team_df["auto_hang"].mean()),

        "primary_role": (
            team_df["adv_role"].mode().iloc[0]
            if not team_df["adv_role"].mode().empty
            else "unknown"
        )
    }

    return overview
