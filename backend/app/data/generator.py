import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any

class SyntheticAsthmaDataGenerator:
    def __init__(self, n_steps: int = 720):
        self.n_steps = n_steps # e.g., 30 days of hourly data

    def generate_physiological(self) -> np.ndarray:
        # HR 60-100bpm, RR 12-20, SpO2 95-100%, PEF 60-110%, Activity 0-10, Symptom Score 0-100
        time = np.linspace(0, 30*2*np.pi, self.n_steps)
        diurnal = np.sin(time)
        
        hr = 80 + 10 * diurnal + np.random.normal(0, 2, self.n_steps)
        rr = 16 + 2 * diurnal + np.random.normal(0, 1, self.n_steps)
        spo2 = 98 + np.random.normal(0, 0.5, self.n_steps)
        spo2 = np.clip(spo2, 90, 100)
        pef = 85 + 10 * diurnal + np.random.normal(0, 5, self.n_steps)
        
        activity = 5 + 3 * diurnal + np.random.normal(0, 1, self.n_steps)
        activity = np.clip(activity, 0, 10)
        
        symptoms = 10 - 5 * diurnal + np.random.normal(0, 2, self.n_steps) # worse at night
        symptoms = np.clip(symptoms, 0, 100)
        
        return np.stack([hr, rr, spo2, pef, activity, symptoms], axis=1)

    def generate_environmental(self) -> np.ndarray:
        # AQI 0-300, PM2.5 0-150, Temp -5 to 40, Hum 20-90, Pollen 0-12, dust 0-100, mold 0-100, dander 0-100, infection 0-10
        time = np.linspace(0, 30*2*np.pi, self.n_steps)
        seasonal = np.sin(time / 30)
        diurnal = np.sin(time)
        
        aqi = 50 + 20 * seasonal + np.random.normal(0, 10, self.n_steps)
        aqi = np.clip(aqi, 0, 300)
        
        pm25 = aqi * 0.4 + np.random.normal(0, 5, self.n_steps)
        pm25 = np.clip(pm25, 0, 150)
        
        temp = 20 + 5 * diurnal + 10 * seasonal + np.random.normal(0, 2, self.n_steps)
        hum = 50 + 10 * np.sin(time + np.pi) + np.random.normal(0, 5, self.n_steps)
        hum = np.clip(hum, 20, 90)
        
        pollen = 3 + 2 * seasonal + np.random.normal(0, 1, self.n_steps)
        pollen = np.clip(pollen, 0, 12)
        
        dust = 30 + np.random.normal(0, 10, self.n_steps)
        dust = np.clip(dust, 0, 100)
        
        mold = 20 + 5 * seasonal + np.random.normal(0, 5, self.n_steps)
        mold = np.clip(mold, 0, 100)
        
        dander = 10 + np.random.normal(0, 3, self.n_steps)
        dander = np.clip(dander, 0, 100)
        
        infection = np.zeros(self.n_steps)
        if np.random.random() > 0.8: # 20% chance of an infection period
            start = np.random.randint(0, self.n_steps - 72)
            infection[start:start+72] = 8 + np.random.normal(0, 1, 72)
        infection = np.clip(infection, 0, 10)
        
        return np.stack([aqi, pm25, temp, hum, pollen, dust, mold, dander, infection], axis=1)

    def generate_clinical(self) -> np.ndarray:
        # rescue_puffs, adherence, awakenings, feno, eos, act_score, exacerbations, fev1_fvc
        rescue = np.random.poisson(0.5, self.n_steps)
        rescue = np.clip(rescue, 0, 12)
        
        adherence = np.random.choice([0, 1], size=self.n_steps, p=[0.2, 0.8])
        
        awakenings = np.random.poisson(0.1, self.n_steps)
        awakenings = np.clip(awakenings, 0, 5)
        
        feno = 20 + np.random.normal(0, 5, self.n_steps)
        feno = np.clip(feno, 5, 100)
        
        eos = 150 + np.random.normal(0, 20, self.n_steps)
        eos = np.clip(eos, 0, 500)
        
        act = 20 - np.random.normal(0, 2, self.n_steps)
        act = np.clip(act, 5, 25)
        
        exac = np.zeros(self.n_steps)
        
        fev1_fvc = 0.75 + np.random.normal(0, 0.05, self.n_steps)
        fev1_fvc = np.clip(fev1_fvc, 0.4, 1.0)
        
        return np.stack([rescue, adherence, awakenings, feno, eos, act, exac, fev1_fvc], axis=1)

    def generate_patient_dataset(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        physio = self.generate_physiological()
        env = self.generate_environmental()
        clinical = self.generate_clinical()
        
        # GINA Guidelines for Poor Control:
        gina_penalty = np.zeros(self.n_steps)
        gina_penalty += (clinical[:, 2] > 0).astype(float) * 15  # Any night waking
        gina_penalty += (clinical[:, 0] > 2).astype(float) * 20  # High SABA reliever use
        gina_penalty += (clinical[:, 1] == 0).astype(float) * 25 # Non-adherence to controller
        gina_penalty += (physio[:, 4] < 4).astype(float) * 10    # Activity limitation
        
        risk_score = (
            (100 - physio[:, 3]) * 0.1 + # low PEF
            (98 - physio[:, 2]) * 0.5 +  # low SpO2
            physio[:, 5] * 0.2 +         # high symptoms
            env[:, 0] * 0.02 +           # high AQI
            env[:, 4] * 0.5 +            # high pollen
            env[:, 8] * 1.5 +            # infection presence
            (clinical[:, 3] - 25) * 0.1 +# elevated FeNO
            gina_penalty                 # GINA Poor Control penalties
        )
        
        threshold = np.percentile(risk_score, 95)
        events = (risk_score > threshold).astype(int)
        
        time_to_event = np.full(self.n_steps, self.n_steps, dtype=float)
        last_event_idx = -1
        for i in range(self.n_steps - 1, -1, -1):
            if events[i] == 1:
                last_event_idx = i
            
            if last_event_idx != -1:
                time_to_event[i] = last_event_idx - i
                
        return physio, env, clinical, events, time_to_event

    def generate_n_patients(self, n: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        physio_list, env_list, clinical_list, events_list, tte_list = [], [], [], [], []
        
        for _ in range(n):
            p, e, c, ev, tte = self.generate_patient_dataset()
            physio_list.append(p)
            env_list.append(e)
            clinical_list.append(c)
            events_list.append(ev)
            tte_list.append(tte)
            
        return (
            np.array(physio_list), 
            np.array(env_list), 
            np.array(clinical_list), 
            np.array(events_list), 
            np.array(tte_list)
        )
