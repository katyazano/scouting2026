from flask import Flask, jsonify
from flask_cors import CORS

from analysis.loader import load_csv
from analysis.event import event_ranges
from analysis.team import team_overview
from analysis.anomalies import team_trend


app = Flask(__name__)
CORS(app)

@app.route("/api/event/metrics")
def event_metrics():
    df = load_csv()
    return jsonify(event_ranges(df))

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
