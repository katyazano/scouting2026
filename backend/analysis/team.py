def team_overview(df, team_num):
    team_df = df[df["team_num"] == team_num].sort_values("match_num")

    if team_df.empty:
        return {}

    return {
        "team_num": team_num,
        "matches_played": len(team_df),

        "avg_auto_pts": round(team_df["auto_pts"].mean(), 2),
        "avg_tele_pts": round(team_df["tele_pts"].mean(), 2),
        "avg_total_fuel": round(team_df["total_fuel"].mean(), 2),

        "auto_success_rate": round(team_df["auto_success"].mean(), 2),
        "climb_success_rate": round((team_df["climb_total"] > 0).mean(), 2),

        "break_rate": round(team_df["broke_flag"].mean(), 2),

        "primary_role": team_df["adv_role"].mode().iloc[0]
            if not team_df["adv_role"].mode().empty else "unknown"
    }