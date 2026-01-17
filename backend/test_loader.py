# test_loader.py
from analysis.loader import load_csv
from analysis.team import split_shooter

load_csv(force=True)
df = load_csv(force=True)
print(df.columns.tolist())

split_shooter("0-1-2")