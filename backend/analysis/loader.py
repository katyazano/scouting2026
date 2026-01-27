import pandas as pd
import os
import numpy as np
import glob

# Busca el archivo más reciente automáticamente
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def get_latest_csv():
    files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    return max(files, key=os.path.getctime) if files else os.path.join(DATA_DIR, "full_test_scouting_data.csv")

CSV_PATH = get_latest_csv()
_last_mtime = None
_cached_df = None

NUMERIC_FIELDS = [
    "team_num", "match_num",
    "auto_pts", "tele_pts", "auto_hang", "tele_hang", "auto_active",
    "adv_broke", "adv_fixed", "adv_climber", "adv_role", "adv_trench"
]

LIST_FIELDS = ["adv_shooter"]
STRING_FIELDS = ["adv_hoppercapacity", "adv_comments"]

def parse_list_field(value):
    if pd.isna(value) or value == "" or value == -1: return []
    if isinstance(value, (int, float)): return [int(value)]
    return [int(x) for x in str(value).split("-") if x.isdigit()]

def load_csv(force=False):
    global _last_mtime, _cached_df, CSV_PATH
    
    # Actualizar path si hay archivo nuevo
    newest_file = get_latest_csv()
    if newest_file != CSV_PATH: CSV_PATH = newest_file

    if not os.path.exists(CSV_PATH): return pd.DataFrame()
    mtime = os.path.getmtime(CSV_PATH)

    if force or _last_mtime != mtime or _cached_df is None:
        print(f"📂 Loading: {os.path.basename(CSV_PATH)}")
        df = pd.read_csv(CSV_PATH)

        # 1. Normalización Numérica
        for col in NUMERIC_FIELDS:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df[col] = df[col].replace(-1, np.nan)

        # 2. Listas y Strings
        for col in LIST_FIELDS:
            if col in df.columns: df[col] = df[col].apply(parse_list_field)
        for col in STRING_FIELDS:
            if col in df.columns: df[col] = df[col].fillna("").astype(str)

        # 3. Ordenamiento por Match
        sort_cols = ["match_num"]
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            sort_cols = ["timestamp", "match_num"]
        
        df = df.sort_values(by=sort_cols, na_position='first')
        df = df.drop_duplicates(subset=["team_num", "match_num"], keep="last")

        # --- 4. LÓGICA DE NEGOCIO (CÁLCULOS GLOBALES) ---
        # Aquí aplicamos las fórmulas que tenías en event.py
        
        # Rellenamos con 0 temporalmente para las sumas, para que NaN + 10 no de NaN
        df["auto_pts_fill"] = df["auto_pts"].fillna(0)
        df["tele_pts_fill"] = df["tele_pts"].fillna(0)
        df["auto_hang_fill"] = df["auto_hang"].fillna(0)
        df["tele_hang_fill"] = df["tele_hang"].fillna(0)

        # Fórmulas de Puntos
        df["auto_total_pts"] = df["auto_pts_fill"] + (df["auto_hang_fill"] * 15)
        df["tele_climb_pts"] = df["tele_hang_fill"] * 10
        df["tele_total_pts"] = df["tele_pts_fill"] + df["tele_climb_pts"]
        df["match_total_pts"] = df["auto_total_pts"] + df["tele_total_pts"]

        # Booleanos útiles para tasas de éxito
        df["tele_hang_success"] = df["tele_hang"] > 0
        df["auto_hang_success"] = df["auto_hang"] > 0

        # Limpieza de columnas temporales
        df = df.drop(columns=["auto_pts_fill", "tele_pts_fill", "auto_hang_fill", "tele_hang_fill"])

        # 5. Castings finales seguros (Int64 permite nulos)
        safe_int_cols = ["team_num", "match_num", "auto_active", "auto_hang", "tele_hang", "adv_broke", "adv_fixed"]
        for col in safe_int_cols:
            if col in df.columns:
                df[col] = df[col].round().astype("Int64")

        _cached_df = df
        _last_mtime = mtime

    return _cached_df.copy()