# test_loader.py
from analysis.loader import load_csv

df = load_csv(force=True)
print(df.head())
print(df.dtypes)
print(df[["auto_pts", "tele_pts", "total_fuel"]].head())