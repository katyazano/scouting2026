import pandas as pd
import numpy as np

def event_ranges(df, metric_key):
    # Ya no necesitamos hacer cálculos ni copias pesadas aquí.
    # El loader ya nos dio las columnas listas.

    grouped = df.groupby("team_num")
    series = None
    
    # Mapeo de Frontend Key -> Backend Column
    if metric_key == "match_avg_total_pts":
        series = grouped["match_total_pts"] # Columna calculada en loader
        
    elif metric_key == "auto_total_pts":
        series = grouped["auto_total_pts"]
        
    elif metric_key == "tele_total_pts":
        series = grouped["tele_total_pts"]
        
    elif metric_key == "tele_avg_fuel":
        series = grouped["tele_pts"] # Fuel son los puntos base de teleop
        
    elif metric_key == "auto_success_rate":
        series = grouped["auto_active"]
        
    elif metric_key == "auto_hang_success_rate":
        series = grouped["auto_hang"] # Ojo: esto promediará el valor (0,1). Si quieres %, usa una col booleana.
        
    elif metric_key == "tele_hang_success_rate":
        # Usamos la columna booleana que creamos en el loader
        series = grouped["tele_hang_success"]
        
    elif metric_key == "break_rate":
        series = grouped["adv_broke"]

    # Caso especial: Moda (no es un promedio simple)
    elif metric_key == "tele_mode_hang":
        data = []
        for team, group in grouped:
            modes = group["tele_hang"].mode()
            mode_val = int(modes.iloc[0]) if not modes.empty else 0
            data.append({"team_num": int(team), "mode": mode_val})
        return {"metric": metric_key, "data": data}

    else:
        # Si la key no está mapeada arriba, intentamos buscarla directo en las columnas
        if metric_key in df.columns:
             series = grouped[metric_key]
        else:
             return {"error": f"Unknown metric '{metric_key}'"}

    # Agregación Estándar (Min, Avg, Max)
    # .agg es más rápido que iterar manualmente
    agg_df = series.agg(['min', 'mean', 'max']).reset_index()
    
    data = []
    for _, row in agg_df.iterrows():
        # Validamos que no sean NaNs antes de enviar
        avg_val = row['mean']
        if pd.isna(avg_val): continue 
        
        data.append({
            "team_num": int(row['team_num']),
            "min": float(row['min']),
            "avg": float(avg_val),
            "max": float(row['max'])
        })
        
    # Ordenar por promedio descendente
    data.sort(key=lambda x: x['avg'], reverse=True)

    return {
        "metric": metric_key,
        "data": data
    }