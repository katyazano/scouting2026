import pandas as pd
import os

CSV_PATH = "data/test.csv"
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

        # ---- Cast básicos ----
        int_cols = [
            "team_num", "match_num",
            "auto_pts", "tele_pts",
            "auto_hang", "tele_hang",
            "adv_broke", "adv_fixed", "adv_climber"
        ]

        for col in int_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

        # ---- Columnas derivadas ----
        df["total_fuel"] = df["auto_pts"] + df["tele_pts"]
        df["climb_auto"] = df["auto_hang"]
        df["climb_tele"] = df["tele_hang"]
        df["climb_total"] = df["auto_hang"] + df["tele_hang"]
        df["auto_success"] = df["auto_pts"] > 0
        df["broke_flag"] = df["adv_broke"] == 1
        df["auto_active"] = df["auto_active"] == 1
        df["timestamp"] = pd.to_datetime(df["timestamp"])



        _cached_df = df
        _last_mtime = mtime

    return _cached_df.copy()