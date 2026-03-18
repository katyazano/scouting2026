import sys
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ==============================================================================
# CORRECCIÓN DE RUTAS PARA EJECUTABLE (.EXE)
# ==============================================================================
if getattr(sys, 'frozen', False):
    # Si estamos corriendo como .exe, usar la ruta del ejecutable
    APPLICATION_PATH = os.path.dirname(sys.executable)
else:
    # Si estamos corriendo como script .py, usar la ruta del archivo
    APPLICATION_PATH = os.path.dirname(os.path.abspath(__file__))

# Ahora construimos la ruta absoluta al CSV
CSV_FILE = os.path.join(APPLICATION_PATH, "local_scouting_data.csv")

print(f"📂 El CSV se guardará en: {CSV_FILE}")

# --- DEFINE TUS COLUMNAS AQUÍ ---
# Estas deben coincidir con las que espera tu Analysis Engine para que no truene
# En bridge.py

DEFAULT_HEADERS = [
    "timestamp",           # 0
    "team_num",            # 1
    "match_num",           # 2
    "match_type",          # 3
    "alliance",            # 4
    "scouter",             # 5
    "start_zone",          # 6
    "auto_active",         # 7
    "auto_hang",           # 8
    "auto_pts",            # 9
    "auto_comm",           # 10
    "tele_pts",            # 11
    "tele_comm",           # 12
    "tele_hang",           # 13
    "adv_role",            # 14
    "adv_broke",           # 15
    "adv_fixed",           # 16
    "adv_chasis",          # 17
    "adv_intake",          # 18
    "adv_shooter",         # 19
    "adv_climber",         # 20
    "adv_hoppercapacity",  # 21
    "adv_trench",          # 22
    "adv_comments"         # 23
]

def init_csv():
    """Crea el archivo con headers si no existe al arrancar"""
    if not os.path.exists(CSV_FILE):
        print(f"⚠️ Archivo no encontrado. Creando {CSV_FILE} vacío...")
        df = pd.DataFrame(columns=DEFAULT_HEADERS)
        df.to_csv(CSV_FILE, index=False)
        print("✅ Archivo creado exitosamente.")

@app.route('/api/scout/upload', methods=['POST'])
def receive_from_scout_app():
    try:
        # Lógica para recibir JSON o CSV crudo
        if request.is_json:
            data = request.json
            if not isinstance(data, list): data = [data]
            df_new = pd.DataFrame(data)
        else:
            csv_data = request.data.decode('utf-8')
            # Si el request viene vacío, ignorar
            if not csv_data.strip():
                return jsonify({"status": "error", "message": "Empty data"}), 400
            df_new = pd.read_csv(io.StringIO(csv_data))

        # Modo Append: Si existe, agregamos sin header
        if os.path.exists(CSV_FILE) and os.path.getsize(CSV_FILE) > 0:
            df_new.to_csv(CSV_FILE, mode='a', header=False, index=False)
        else:
            df_new.to_csv(CSV_FILE, mode='w', header=True, index=False)
            
        print(f"✅ Recibidos {len(df_new)} registros. Total guardado.")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/csv', methods=['GET'])
def serve_to_analysis_app():
    # Aseguramos que el archivo exista antes de enviarlo
    if not os.path.exists(CSV_FILE):
        init_csv()
        
    return send_file(CSV_FILE, mimetype='text/csv')

if __name__ == '__main__':
    # 1. Inicializar el CSV antes de prender el servidor
    init_csv()
    
    print(f"🚀 BRIDGE SERVER en puerto 8000")
    print(f"📂 Guardando datos en: {os.path.abspath(CSV_FILE)}")
    app.run(host='0.0.0.0', port=8000)