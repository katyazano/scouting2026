from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

from analysis.loader import load_csv
from analysis.event import event_ranges
from analysis.team import team_overview
from analysis.anomalies import team_trend


app = Flask(__name__)
CORS(app)
# app.py (Backend)
@app.route('/api/teams', methods=['GET'])
def get_all_teams():
    df = load_csv()
    # Obtiene lista única de equipos del DataFrame
    teams = df['team_num'].dropna().unique().tolist()
    teams.sort()
    
    # Devuelve una lista de objetos simple
    # Nota: Si tienes los nombres (nicknames) en el CSV, inclúyelos aquí
    return jsonify([{"team_num": int(t)} for t in teams])

@app.route("/api/event/metrics/<metric_key>")
def event_metrics(metric_key):
    df = load_csv()
    return jsonify(event_ranges(df, metric_key))

@app.route("/api/team/<int:team_num>/overview")
def team_overview_api(team_num):
    df = load_csv()
    return jsonify(team_overview(df, team_num))

@app.route("/api/team/<int:team_num>/trend")
def team_trend_api(team_num):
    df = load_csv()
    return jsonify(team_trend(df, team_num))

@app.route("/api/health")
def health():
    return {"status": "ok"}

@app.route("/api/scout/upload", methods=["POST"])
def upload_csv():
    """
    Receives CSV data from the PWA and appends it to the scouting data file.
    """
    # Use the existing full_test_scouting_data.csv file
    csv_filename = os.path.join(os.path.dirname(__file__), "data", "full_test_scouting_data.csv")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(csv_filename), exist_ok=True)
    
    csv_data = request.data.decode('utf-8')
    
    try:
        file_exists = os.path.exists(csv_filename)
        
        lines = csv_data.strip().split('\n')
        if len(lines) < 2:
            return jsonify({"status": "error", "message": "CSV must have header and at least one data row"}), 400
            
        incoming_header = lines[0]
        incoming_data = lines[1:]
        
        with open(csv_filename, 'a', encoding='utf-8') as f:
            if not file_exists:
                # First time: write header + data
                f.write(incoming_header + '\n')
                f.write('\n'.join(incoming_data) + '\n')
            else:
                # File exists: append only data rows (skip header)
                # Ensure a newline if the file doesn't end with one
                if os.path.getsize(csv_filename) > 0:
                    with open(csv_filename, 'rb+') as f_check:
                        f_check.seek(-1, os.SEEK_END)
                        if f_check.read(1) != b'\n':
                            f.write('\n')
                f.write('\n'.join(incoming_data) + '\n')
        
        # Count total rows for response (ignoring header)
        with open(csv_filename, 'r', encoding='utf-8') as f:
            total_rows = sum(1 for line in f) - 1
            
        print(f"✅ Ingested {len(incoming_data)} rows. Total now: {total_rows}")
        
        return jsonify({
            'status': 'success',
            'rows_added': len(incoming_data),
            'total_rows': total_rows
        })
        
    except Exception as e:
        print(f"❌ Error during CSV upload: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
