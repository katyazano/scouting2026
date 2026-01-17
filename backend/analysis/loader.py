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

        print("Loaded CSV with", len(df), "rows")

        # --------------------------------------------------
        # Limpieza básica
        # --------------------------------------------------

        numeric_cols = [
            "team_num", "match_num",
            "auto_pts", "tele_pts",
            "auto_hang", "tele_hang",
            "auto_active",
            "adv_broke", "adv_fixed", "adv_climber"
        ]

        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # --------------------------------------------------
        # Resolver duplicados correctamente
        # --------------------------------------------------
        # Regla: nos quedamos con el último registro por team+match
        # (timestamp más reciente)

        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

            df = (
                df
                .sort_values("timestamp")
                .drop_duplicates(
                    subset=["team_num", "match_num"],
                    keep="last"
                )
            )
        else:
            df = df.drop_duplicates(
                subset=["team_num", "match_num"],
                keep="last"
            )

        print("After deduplication:", len(df), "rows")

        # --------------------------------------------------
        # Tipos finales (JSON safe)
        # --------------------------------------------------

        df["team_num"] = df["team_num"].astype(int)
        df["match_num"] = df["match_num"].astype(int)

        df["auto_active"] = df["auto_active"].astype(int)
        df["auto_hang"] = df["auto_hang"].astype(int)
        df["tele_hang"] = df["tele_hang"].astype(int)
        df["adv_broke"] = df["adv_broke"].astype(int)

        _cached_df = df
        _last_mtime = mtime

    return _cached_df.copy()
