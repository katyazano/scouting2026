import pandas as pd
import os

CSV_PATH = "data/full_test_scouting_data.csv"

_last_mtime = None
_cached_df = None

def load_csv(force=False):
    global _last_mtime, _cached_df

    if not os.path.exists(CSV_PATH):
        print("CSV not found:", CSV_PATH)
        return pd.DataFrame()
        
    mtime = os.path.getmtime(CSV_PATH)

    if force or _last_mtime != mtime:
        df = pd.read_csv(CSV_PATH)
        print("Loaded CSV with", len(df), "rows")

        
        dup_counts = df.groupby(["team_num", "match_num"]).size()
        print("Duplicate entries found:", dup_counts[dup_counts > 1].sum())
        
        # ---- Cast numericos ----
        int_cols = [
            "team_num",
            "match_num",
            "start_zone",
            "auto_active",
            "auto_hang",
            "auto_pts",
            "tele_pts",
            "tele_hang",
            "adv_broke",
            "adv_fixed",
            "adv_climber",
            "adv_chasis",
            "adv_intake",
            "adv_trench",
        ]

        for col in int_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

        # ---- Columnas derivadas ----
        df["total_fuel"] = df["auto_pts"] + df["tele_pts"]

        df["auto_hang"] = df["auto_hang"].astype(int)
        df["tele_hang"] = df["tele_hang"].astype(int)
        df["climb_total"] = df["auto_hang"] + df["tele_hang"]

        df["auto_success"] = df["auto_pts"] > 0
        df["broke_flag"] = df["adv_broke"] == 1
        df["auto_active"] = df["auto_active"] == 1
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        # ---- Consolidar matches duplicados (team_num, match_num) ----
        df = (
            df
            .groupby(["team_num", "match_num"], as_index=False)
            .agg({
                "auto_pts": "mean",
                "tele_pts": "mean",
                "total_fuel": "mean",
                "auto_active": "mean",
                "auto_hang": "mean",
                "tele_hang": "mean",
                "climb_total": "mean",
                "adv_broke": "mean",

                "adv_role": lambda x: x.mode().iloc[0] if not x.mode().empty else "unknown"
            })
        )


        _cached_df = df
        _last_mtime = mtime

    return _cached_df.copy()

