"""Quick smoke test: load CAMP data and verify tensor shapes match PatchTST expectations."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.data.public_loader import PublicAsthmaDatasetLoader
import numpy as np

loader = PublicAsthmaDatasetLoader()
physio, env, clinical, events, tte = loader.load_and_preprocess(
    "data/camp_teaching/CAMP_csv/camp_teach.csv"
)

print(f"\n=== TENSOR SHAPES (must match PatchTST) ===")
print(f"  physio:   {physio.shape}  (expect: (695, 720, 6))")
print(f"  env:      {env.shape}  (expect: (695, 720, 9))")
print(f"  clinical: {clinical.shape}  (expect: (695, 720, 8))")
print(f"  events:   {events.shape}  (expect: (695, 720))")
print(f"  tte:      {tte.shape}  (expect: (695, 720))")

print(f"\n=== NaN CHECK ===")
for name, arr in [("physio", physio), ("env", env), ("clinical", clinical), ("events", events), ("tte", tte)]:
    nan_count = np.isnan(arr).sum()
    status = "OK" if nan_count == 0 else "PROBLEM!"
    print(f"  {name}: {nan_count} NaNs - {status}")

print(f"\n=== SAMPLE VALUES (Patient 0, first 5 timesteps) ===")
print(f"  physio[0,:5,:] = {physio[0,:5,:]}")
print(f"  events[0,:20] = {events[0,:20]}")

all_clean = all(np.isnan(a).sum() == 0 for a in [physio, env, clinical, events, tte])
print(f"\nAll checks passed!" if all_clean else "\nWARNING: NaN values detected!")
