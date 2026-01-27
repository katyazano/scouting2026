import pandas as pd
import numpy as np

# --- MAPAS DE VALORES ---
CHASSIS_MAP = {0: "TANK", 1: "SWERVE", 2: "MECANUM", 3: "CUSTOM"}
INTAKE_MAP = {0: "OVER BUMPER", 1: "UNDER BUMPER", 2: "NONE"}
HOPPER_MAP = {0: "0-20", 1: "21-40", 2: "41-60", 3: "61+"}
ROLE_MAP = {0: "SCORER", 1: "FEEDER", 2: "DEFENSE", 3: "NONE"}
TRENCH_MAP = {0: "TRENCH", 1: "BUMP", 2: "BOTH", 3: "NONE"}
SHOOTER_MAP = {0: "TURRET", 1: "HOOD", 2: "DUAL", 3: "FIXED"}

def get_mapped_value(val, mapping, default="N/A"):
    try:
        if pd.isna(val) or val is None or val == "": return default
        if isinstance(val, str) and len(val) > 1 and not val.isdigit(): return val
        return mapping.get(int(val), default)
    except: return default

def team_overview(df, team_num):
    # Filtrar y ordenar
    team_df = df[df['team_num'] == team_num].copy()
    team_df = team_df.sort_values('match_num')
    
    if team_df.empty: return {"error": "Team not found"}

    matches_played = int(len(team_df))
    
    # --- CÁLCULOS ESTADÍSTICOS ---
    avg_auto_pts = float(team_df['auto_pts'].mean()) if not team_df['auto_pts'].isnull().all() else 0.0
    auto_success = float(team_df['auto_active'].mean()) if not team_df['auto_active'].isnull().all() else 0.0
    avg_tele_pts = float(team_df['tele_pts'].mean()) if not team_df['tele_pts'].isnull().all() else 0.0
    
    hang_success_val = (team_df['tele_hang'] > 0).mean()
    hang_success = float(hang_success_val) if not pd.isna(hang_success_val) else 0.0
    
    if not team_df['tele_hang'].mode().empty:
        mode_climb = int(team_df['tele_hang'].mode().max())
    else:
        mode_climb = 0
    
    total_pts_series = team_df['auto_pts'].fillna(0) + team_df['tele_pts'].fillna(0)
    avg_total_pts_val = total_pts_series.mean()
    avg_total_pts = float(avg_total_pts_val) if not pd.isna(avg_total_pts_val) else 0.0

    # --- LÓGICA DE ÚLTIMO ESTADO ---
    latest = team_df.iloc[-1]
    
    broke_val = latest.get('adv_broke')
    if pd.isna(broke_val): broke_val = 0
    
    fixed_val = latest.get('adv_fixed')
    if pd.isna(fixed_val): fixed_val = 0

    is_broken_now = bool(broke_val == 1 and fixed_val != 1)

    broken_matches = [int(x) for x in team_df[team_df['adv_broke'] == 1]['match_num'].dropna().tolist()]
    fixed_matches = [int(x) for x in team_df[team_df['adv_fixed'] == 1]['match_num'].dropna().tolist()]

    shooter_list = latest.get('adv_shooter', []) if isinstance(latest.get('adv_shooter'), list) else []
    shooter_labels = [SHOOTER_MAP.get(x, "UNKNOWN") for x in shooter_list if x in SHOOTER_MAP]
    
    raw_hopper = latest.get('adv_hoppercapacity')
    hopper_val = "N/A"
    if raw_hopper and str(raw_hopper) != "-1":
        hopper_val = get_mapped_value(raw_hopper, HOPPER_MAP)

    # --- COMENTARIOS (ACTUALIZADO) ---
    comments_list = []
    
    def is_valid(txt):
        return pd.notna(txt) and str(txt).lower() != "nan" and str(txt).strip() != ""

    for _, row in team_df.iterrows():
        scouter_name = str(row.get('scouter', 'Anon'))
        match_n = int(row['match_num'])
        
        # 1. Comentarios de Autónomo
        auto_c = row.get('auto_comm')
        if is_valid(auto_c):
            comments_list.append({
                "match_num": match_n,
                "scouter": scouter_name,
                "text": f"[Auto] {str(auto_c)}"
            })
            
        # 2. Comentarios de Teleop
        tele_c = row.get('tele_comm')
        if is_valid(tele_c):
            comments_list.append({
                "match_num": match_n,
                "scouter": scouter_name,
                "text": f"[Tele] {str(tele_c)}"
            })

        # 3. Notas Generales
        adv_c = row.get('adv_comments')
        if is_valid(adv_c):
            comments_list.append({
                "match_num": match_n,
                "scouter": scouter_name,
                "text": str(adv_c)
            })

    comments_list.reverse() # Los más recientes primero

    return {
        "team_num": int(team_num),
        "matches_played": matches_played,
        "comments": comments_list,
        "overall": { "avg_total_pts": round(avg_total_pts, 2) },
        "auto": { 
            "avg_total_pts": round(avg_auto_pts, 2),
            "success_rate": round(auto_success, 2)
        },
        "teleop": {
            "avg_fuel_pts": round(avg_tele_pts, 2),
            "avg_total_pts": round(avg_tele_pts, 2),
            "hang_success_rate": round(hang_success, 2),
            "mode_climb_level": mode_climb
        },
        "advanced": {
            "latest": {
                "chasis": get_mapped_value(latest.get('adv_chasis'), CHASSIS_MAP),
                "intake": get_mapped_value(latest.get('adv_intake'), INTAKE_MAP),
                "hopper_capacity": hopper_val,
                "climber": bool(latest.get('adv_climber') == 1),
                "shooter": { "labels": shooter_labels, "raw": " + ".join(shooter_labels) if shooter_labels else "NONE" }
            },
            "reliability": {
                "currently_broken": is_broken_now,
                "broke": { "occurred": len(broken_matches) > 0, "matches": broken_matches, "last_match": broken_matches[-1] if broken_matches else None },
                "fixed": { "matches": fixed_matches, "last_match": fixed_matches[-1] if fixed_matches else None }
            },
            "typical": {
                "role": get_mapped_value(latest.get('adv_role'), ROLE_MAP),
                "trench": get_mapped_value(latest.get('adv_trench'), TRENCH_MAP)
            }
        }
    }