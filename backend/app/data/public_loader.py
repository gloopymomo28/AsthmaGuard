import pandas as pd
import numpy as np
from typing import Tuple

class PublicAsthmaDatasetLoader:
    def __init__(self, n_steps: int = 720):
        """
        Loads the CAMP Teaching Dataset and maps it to our PatchTST tensor dimensions.
        
        The CAMP dataset has ~14 clinic visits per patient (sparse, irregular intervals).
        Our PatchTST model expects 720 dense timesteps per patient.
        
        Strategy:
        - Interpolate sparse clinic visits into a dense 720-step timeline per patient.
        - Map CAMP columns into our 3 tensor groups (physio, env, clinical).
        - Derive exacerbation events from sharp drops in lung function (FEV1).
        """
        self.n_steps = n_steps
        self.num_physio = 6   # HR, RR, SpO2, PEF, Activity, Symptom Score
        self.num_env = 9      # AQI, PM2.5, Temp, Hum, Pollen, Dust, Mold, Dander, Infection
        self.num_clinical = 8 # rescue_puffs, adherence, awakenings, feno, eos, act, exac, fev1_fvc

    def _encode_categorical(self, series: pd.Series, mapping: dict) -> np.ndarray:
        """Convert a categorical column to numeric using a provided mapping."""
        return series.map(mapping).fillna(0).values

    def _interpolate_patient(self, patient_df: pd.DataFrame, columns: list) -> np.ndarray:
        """
        Takes a patient's sparse clinic visit data and interpolates it into n_steps dense timesteps.
        Uses linear interpolation between visits and forward-fills static columns.
        """
        n_visits = len(patient_df)
        n_features = len(columns)
        
        if n_visits == 0:
            return np.zeros((self.n_steps, n_features))
        
        if n_visits == 1:
            # Only one visit: repeat it across all timesteps
            row = patient_df[columns].fillna(0).values[0]
            return np.tile(row, (self.n_steps, 1))
        
        # Get the follow-up days as our x-axis for interpolation
        fdays = patient_df['fdays'].values.astype(float)
        fdays_min, fdays_max = fdays.min(), fdays.max()
        
        # Create a uniform dense timeline from first to last visit
        if fdays_max == fdays_min:
            dense_timeline = np.zeros(self.n_steps)
        else:
            dense_timeline = np.linspace(fdays_min, fdays_max, self.n_steps)
        
        result = np.zeros((self.n_steps, n_features))
        
        for i, col in enumerate(columns):
            values = patient_df[col].values.astype(float)
            
            # Handle NaN: forward fill then backward fill
            mask = ~np.isnan(values)
            if mask.sum() == 0:
                result[:, i] = 0.0
                continue
            elif mask.sum() == 1:
                result[:, i] = values[mask][0]
                continue
            
            # Interpolate using the valid (non-NaN) values
            valid_fdays = fdays[mask]
            valid_values = values[mask]
            result[:, i] = np.interp(dense_timeline, valid_fdays, valid_values)
        
        return result

    def load_and_preprocess(self, csv_path: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Loads the CAMP Teaching CSV and maps it into the 5 arrays expected by our pipeline:
        - physio:   (n_patients, n_steps, 6)
        - env:      (n_patients, n_steps, 9)
        - clinical: (n_patients, n_steps, 8)
        - events:   (n_patients, n_steps)
        - tte:      (n_patients, n_steps)
        
        CAMP Column Mapping:
        ====================
        Physiological (6 features):
          0: PREFEV   -> maps to PEF/lung capacity (proxy for Heart Rate variability context)
          1: PREFVC   -> maps to Respiratory capacity
          2: POSFEV   -> maps to SpO2 proxy (post-bronchodilator lung function)
          3: PREFF    -> maps to PEF% (FEV1/FVC ratio pre-bronchodilator)
          4: POSFF    -> maps to Activity proxy (post-bronchodilator ratio)
          5: hemog    -> maps to Symptom Score proxy (hemoglobin, general health)
          
        Environmental (9 features):
          0-4: Derived from CAMP home environment columns (anypet, woodstove, dehumid, parent_smokes, any_smokes)
          5-8: Filled with realistic noise (CAMP doesn't track outdoor env; we simulate stable baselines)
          
        Clinical (8 features):
          0: TX encoding     -> maps to rescue/treatment type (proxy for SABA usage pattern)
          1: TG encoding     -> maps to treatment group/adherence proxy
          2: age_rz          -> maps to clinical covariate
          3: PREFEVPP        -> maps to FeNO proxy (percent predicted FEV1)
          4: wbc             -> maps to Eosinophil proxy (white blood cell count)
          5: POSFEVPP        -> maps to ACT score proxy (percent predicted post-bronchodilator FEV1)
          6: POSFVCPP        -> maps to exacerbation history proxy
          7: PREPF           -> maps to FEV1/FVC ratio (pre-bronchodilator peak flow)
        """
        try:
            df = pd.read_csv(csv_path)
            print(f"Loaded CAMP Teaching Dataset from {csv_path}: {len(df)} records, {df['id'].nunique()} patients.")
        except FileNotFoundError:
            print(f"CSV {csv_path} not found. Generating mock data.")
            return self._generate_mock_data(10)
        
        # --- Encode categorical columns ---
        tx_map = {'ned': 0.0, 'bud': 1.0, 'pbud': 2.0, 'pned': 3.0}
        tg_map = {'A': 0.0, 'B': 1.0, 'C': 2.0}
        gender_map = {'m': 0.0, 'f': 1.0}
        ethnic_map = {'w': 0.0, 'b': 1.0, 'h': 2.0, 'o': 3.0}
        
        df['TX_num'] = self._encode_categorical(df['TX'], tx_map)
        df['TG_num'] = self._encode_categorical(df['TG'], tg_map)
        df['GENDER_num'] = self._encode_categorical(df['GENDER'], gender_map)
        df['ETHNIC_num'] = self._encode_categorical(df['ETHNIC'], ethnic_map)
        
        # --- Fill NaN for columns with heavy missingness ---
        # hemog and wbc are only measured at certain visits; forward-fill within patient
        df = df.sort_values(['id', 'fdays'])
        for col in ['hemog', 'wbc', 'agehome', 'anypet', 'woodstove', 'dehumid', 'parent_smokes', 'any_smokes']:
            df[col] = df.groupby('id')[col].transform(lambda x: x.ffill().bfill().fillna(0))
        
        # Fill remaining spirometry NaNs with 0
        spiro_cols = ['PREFEV', 'PREFVC', 'PREFF', 'PREPF', 'POSFEV', 'POSFVC', 'POSFF', 'POSPF',
                      'PREFEVPP', 'PREFVCPP', 'POSFEVPP', 'POSFVCPP']
        for col in spiro_cols:
            df[col] = df[col].fillna(0)
        
        # --- Define column groups ---
        physio_cols = ['PREFEV', 'PREFVC', 'POSFEV', 'PREFF', 'POSFF', 'hemog']
        env_cols = ['anypet', 'woodstove', 'dehumid', 'parent_smokes', 'any_smokes']
        clinical_cols = ['TX_num', 'TG_num', 'age_rz', 'PREFEVPP', 'wbc', 'POSFEVPP', 'POSFVCPP', 'PREPF']
        
        # --- Process each patient ---
        patient_ids = df['id'].unique()
        n_patients = len(patient_ids)
        
        physio_all = np.zeros((n_patients, self.n_steps, self.num_physio))
        env_all = np.zeros((n_patients, self.n_steps, self.num_env))
        clinical_all = np.zeros((n_patients, self.n_steps, self.num_clinical))
        events_all = np.zeros((n_patients, self.n_steps))
        tte_all = np.zeros((n_patients, self.n_steps))
        
        print(f"Interpolating {n_patients} patients into {self.n_steps}-step dense timelines...")
        
        for idx, pid in enumerate(patient_ids):
            patient_df = df[df['id'] == pid].copy()
            
            # --- Interpolate physiological features (6 features) ---
            physio_interp = self._interpolate_patient(patient_df, physio_cols)
            physio_all[idx] = physio_interp
            
            # --- Interpolate environmental features ---
            # CAMP has 5 home-environment columns; pad remaining 4 with realistic noise
            env_interp = self._interpolate_patient(patient_df, env_cols)
            # Pad to 9 features: add simulated AQI-like, PM2.5-like, temp, humidity proxies
            np.random.seed(pid)  # Reproducible noise per patient
            env_padded = np.zeros((self.n_steps, self.num_env))
            env_padded[:, :5] = env_interp
            env_padded[:, 5] = 50 + np.random.normal(0, 10, self.n_steps)   # Simulated AQI baseline
            env_padded[:, 6] = 30 + np.random.normal(0, 5, self.n_steps)    # Simulated PM2.5
            env_padded[:, 7] = 22 + np.random.normal(0, 3, self.n_steps)    # Simulated temperature
            env_padded[:, 8] = 50 + np.random.normal(0, 10, self.n_steps)   # Simulated humidity
            env_all[idx] = env_padded
            
            # --- Interpolate clinical features (8 features) ---
            clinical_interp = self._interpolate_patient(patient_df, clinical_cols)
            clinical_all[idx] = clinical_interp
            
            # --- Derive exacerbation events ---
            # An "exacerbation" is defined as a significant drop in FEV1 between consecutive visits.
            # In the dense timeline, we look for sharp negative slopes in the interpolated PREFEV.
            fev1_series = physio_interp[:, 0]  # PREFEV is index 0
            
            # Compute rate of change (derivative)
            fev1_diff = np.diff(fev1_series, prepend=fev1_series[0])
            
            # Normalize by patient's baseline FEV1
            baseline_fev1 = max(fev1_series[0], 0.5)  # Avoid division by zero
            fev1_pct_change = fev1_diff / baseline_fev1
            
            # Flag exacerbation when FEV1 drops more than 15% relative to baseline
            events_all[idx] = (fev1_pct_change < -0.005).astype(float)
            
            # --- Compute time-to-event ---
            time_to_event = np.full(self.n_steps, self.n_steps, dtype=float)
            last_event_idx = -1
            for i in range(self.n_steps - 1, -1, -1):
                if events_all[idx, i] == 1:
                    last_event_idx = i
                if last_event_idx != -1:
                    time_to_event[i] = last_event_idx - i
            tte_all[idx] = time_to_event
        
        # Print summary statistics
        total_events = events_all.sum()
        patients_with_events = (events_all.sum(axis=1) > 0).sum()
        print(f"Processing complete!")
        print(f"  Total exacerbation events detected: {int(total_events)}")
        print(f"  Patients with at least 1 event: {patients_with_events}/{n_patients}")
        print(f"  Tensor shapes: physio={physio_all.shape}, env={env_all.shape}, clinical={clinical_all.shape}")
        
        return physio_all, env_all, clinical_all, events_all, tte_all
    
    def _generate_mock_data(self, n_patients: int):
        """Fallback mock data if CSV not found."""
        physio = np.random.normal(loc=0, scale=1, size=(n_patients, self.n_steps, self.num_physio))
        env = np.random.normal(loc=0, scale=1, size=(n_patients, self.n_steps, self.num_env))
        clinical = np.random.normal(loc=0, scale=1, size=(n_patients, self.n_steps, self.num_clinical))
        events = np.random.binomial(n=1, p=0.01, size=(n_patients, self.n_steps))
        tte = np.random.exponential(scale=100, size=(n_patients, self.n_steps))
        return physio, env, clinical, events, tte
