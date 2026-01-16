import pandas as pd
import numpy as np

# -------------------------
# Helpers
# -------------------------

def py_int(x):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    try:
        return int(x)
    except Exception:
        return None


def safe_mode(series):
    series = series.dropna()
    if series.empty:
        return None
    mode = series.mode()
    return mode.iloc[0] if not mode.empty else None


def clean_enum(x):
    """Convierte -1, NaN, 'non' en None"""
    if x in (-1, "-1", "non", "none", None):
        return None
    if isinstance(x, float) and np.isnan(x):
        return None
    return x

def split_shooter(value):
    """
    '0-1-2' -> [0,1,2]
    '4'     -> [4]
    None    -> []
    """
    if value is None or pd.isna(value):
        return []

    value = str(value).strip()
    if value == "" or value.lower() == "nan":
        return []

    return [int(x) for x in value.split("-") if x.isdigit()]


# -------------------------
# ENUM MAPS (API semantics)
# -------------------------

CHASIS_MAP = {
    0: "tank",
    1: "swerve",
    2: "mecanum",
    3: "custom",
}

INTAKE_MAP = {
    0: "over",
    1: "under",
    2: "none",
}

TRENCH_MAP = {
    0: "trench",
    1: "bump",
    2: "both",
    3: "none",
}

SHOOTER_MAP = {
    0: "turret",
    1: "hood",
    2: "dual",
    3: "fixed",
    4: "none",
}

# -------------------------
# Main Overview
# -------------------------

def team_overview(df: pd.DataFrame, team_num: int):
    team_df = df[df["team_num"] == team_num].copy()

    if team_df.empty:
        return {"error": "Team not found"}

    # ---------------- AUTO ----------------
    team_df["auto_total_pts"] = team_df["auto_pts"] + (team_df["auto_hang"] * 15)

    auto_avg_total_pts = float(team_df["auto_total_pts"].mean())
    auto_success_rate = float(team_df["auto_active"].mean())

    # ---------------- TELEOP ----------------
    team_df["tele_climb_pts"] = team_df["tele_hang"] * 10
    team_df["tele_total_pts"] = team_df["tele_pts"] + team_df["tele_climb_pts"]

    tele_avg_fuel_pts = float(team_df["tele_pts"].mean())
    tele_avg_total_pts = float(team_df["tele_total_pts"].mean())

    tele_mode_climb_level = py_int(
        safe_mode(team_df["tele_hang"])
    ) or 0

    hang_success_rate = float((team_df["tele_hang"] > 0).mean())

    # ---------------- ADVANCED ----------------
    latest_row = team_df.sort_values("match_num").iloc[-1]


    latest = {
        "climber": bool(latest_row.get("adv_climber") == 1),
        "chasis": CHASIS_MAP.get(clean_enum(latest_row.get("adv_chasis"))),
        "intake": INTAKE_MAP.get(clean_enum(latest_row.get("adv_intake"))),
        "hopper_capacity": latest_row["adv_hoppercapacity"],
        "shooter": {
            "raw": latest_row.get("adv_shooter"),
            "levels": split_shooter(latest_row.get("adv_shooter")),
        }
    }

    typical = {
        "role": safe_mode(team_df["adv_role"]),
        "trench": TRENCH_MAP.get(safe_mode(team_df["adv_trench"])),
    }

    # ---------------- RELIABILITY ----------------
    broke_matches = team_df[team_df["adv_broke"] == 1]["match_num"].tolist()
    fixed_matches = team_df[team_df["adv_fixed"] == 1]["match_num"].tolist()

    last_broke = max(broke_matches) if broke_matches else None
    last_fixed = max(fixed_matches) if fixed_matches else None

    currently_broken = (
        last_broke is not None and
        (last_fixed is None or last_fixed < last_broke)
    )

    reliability = {
        "broke": {
            "occurred": bool(broke_matches),
            "matches": broke_matches,
            "last_match": last_broke,
        },
        "fixed": {
            "matches": fixed_matches,
            "last_match": last_fixed,
        },
        "currently_broken": currently_broken,
    }

    # ---------------- OVERALL ----------------
    avg_total_pts = auto_avg_total_pts + tele_avg_total_pts

    return {
        "team_num": int(team_num),
        "matches_played": int(len(team_df)),

        "auto": {
            "avg_total_pts": auto_avg_total_pts,
            "success_rate": auto_success_rate,
        },

        "teleop": {
            "avg_fuel_pts": tele_avg_fuel_pts,
            "mode_climb_level": tele_mode_climb_level,
            "avg_total_pts": tele_avg_total_pts,
            "hang_success_rate": hang_success_rate,
        },

        "overall": {
            "avg_total_pts": avg_total_pts,
        },

        "advanced": {
            "latest": latest,
            "typical": typical,
            "reliability": reliability,
        },
    }
