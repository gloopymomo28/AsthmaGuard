import pandas as pd
import numpy as np

df = pd.read_csv("C:/Users/Hp/OneDrive/Desktop/Asthma/backend/data/camp_teaching/CAMP_csv/camp_teach.csv")

print("=== FULL COLUMN INFO ===")
print(df.dtypes)
print("\n=== DESCRIPTIVE STATS ===")
print(df.describe())
print("\n=== UNIQUE VALUES FOR CATEGORICAL COLS ===")
for col in ['TX', 'TG', 'GENDER', 'ETHNIC']:
    print(f"{col}: {df[col].unique()}")

print("\n=== MISSING VALUES ===")
print(df.isnull().sum())

print("\n=== VISITS PER PATIENT ===")
visits = df.groupby('id').size()
print(f"Min visits: {visits.min()}, Max visits: {visits.max()}, Mean visits: {visits.mean():.1f}, Median: {visits.median()}")
print(f"Total unique patients: {df['id'].nunique()}")

print("\n=== FDAYS (Follow-up Days) STATS ===")
print(f"Min: {df['fdays'].min()}, Max: {df['fdays'].max()}")
print(f"Sample patient timeline:")
sample_patient = df[df['id'] == df['id'].iloc[0]]
print(sample_patient[['id', 'visitc', 'fdays', 'PREFEV', 'PREFVC', 'PREFF', 'POSFEV']].to_string())
