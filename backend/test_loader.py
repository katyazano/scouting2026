# test_loader.py
from analysis.loader import load_csv

load_csv(force=True)
df = load_csv(force=True)
print(df.columns.tolist())

