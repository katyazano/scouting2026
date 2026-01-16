import pandas as pd
import os

CSV_PATH = "data/full_test_scouting_data.csv"

_last_mtime = None
_cached_df = None


def load_csv(force=False):
    global _last_mtime, _cached_df

    if not os.path.exists(CSV_PATH):
        return pd.DataFrame()

    mtime = os.path.getmtime(CSV_PATH)

    if force or _last_mtime != mtime:
        df = pd.read_csv(CSV_PATH)
        df.columns = df.columns.str.lower()

        # ---- Cast numéricos seguros ----
        int_cols = [
            "team_num", "match_num",
            "start_zone",
            "auto_active", "auto_hang",
            "auto_pts", "tele_pts", "tele_hang",
            "adv_broke", "adv_fixed", "adv_climber",
            "adv_chasis", "adv_intake", "adv_trench",
        ]

        for col in int_cols:
            if col in df.columns:
                df[col] = (
                    pd.to_numeric(df[col], errors="coerce")
                    .replace(-1, pd.NA)
                )

        # ---- Strings ----
        for col in ["adv_role", "adv_hoppercapacity"]:
            if col in df.columns:
                df[col] = df[col].astype(str).replace({"nan": None})

        # ---- Shooter ----
        if "adv_shooter" in df.columns:
            df["adv_shooter"] = (
                df["adv_shooter"]
                .replace({-1: None, "": None})
                .astype(str)
                .replace({"nan": None})
            )

        # ---- Timestamp ----
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

        # ---- Derivadas ----
        df["total_fuel"] = df["auto_pts"] + df["tele_pts"]
        df["climb_total"] = df["auto_hang"] + df["tele_hang"]
        df["auto_active"] = df["auto_active"] == 1

        # ---- Consolidar duplicados ----
        df = (
            df.sort_values("timestamp")
            .groupby(["team_num", "match_num"], as_index=False)
            .agg({
                "auto_pts": "mean",
                "tele_pts": "mean",
                "total_fuel": "mean",
                "auto_active": "mean",
                "auto_hang": "mean",
                "tele_hang": "mean",
                "climb_total": "mean",

                "adv_broke": "max",
                "adv_fixed": "max",
                "adv_climber": "max",

                "adv_chasis": "last",
                "adv_intake": "last",
                "adv_trench": "last",
                "adv_shooter": "last",
                "adv_hoppercapacity": "last",
                "adv_role": lambda x: x.mode().iloc[0] if not x.mode().empty else None,

                "timestamp": "last",
            })
        )

        _cached_df = df
        _last_mtime = mtime

    return _cached_df.copy()
