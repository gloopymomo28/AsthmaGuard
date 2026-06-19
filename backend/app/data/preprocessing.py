import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Optional
import torch

class AsthmaDataPreprocessor:
    def __init__(self, patch_size: int = 24):
        self.patch_size = patch_size
        self.physio_scaler = StandardScaler()
        self.env_scaler = StandardScaler()
        self.clinical_scaler = StandardScaler()
        
    def fit(self, physio: np.ndarray, env: np.ndarray, clinical: np.ndarray):
        self.physio_scaler.fit(physio.reshape(-1, physio.shape[-1]))
        self.env_scaler.fit(env.reshape(-1, env.shape[-1]))
        self.clinical_scaler.fit(clinical.reshape(-1, clinical.shape[-1]))
        return self

    def transform(self, physio: np.ndarray, env: np.ndarray, clinical: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        shape_p, shape_e, shape_c = physio.shape, env.shape, clinical.shape
        
        p_scaled = self.physio_scaler.transform(physio.reshape(-1, shape_p[-1])).reshape(shape_p)
        e_scaled = self.env_scaler.transform(env.reshape(-1, shape_e[-1])).reshape(shape_e)
        c_scaled = self.clinical_scaler.transform(clinical.reshape(-1, shape_c[-1])).reshape(shape_c)
        
        return p_scaled, e_scaled, c_scaled

    def create_patches(self, series: np.ndarray) -> np.ndarray:
        batch, n_steps, n_features = series.shape
        
        num_patches = n_steps // self.patch_size
        valid_steps = num_patches * self.patch_size
        series = series[:, -valid_steps:, :]
        
        patched = series.reshape(batch, num_patches, self.patch_size, n_features)
        return patched

    def create_attention_mask(self, missing_ratios: float = 0.1, shape: Tuple = None) -> np.ndarray:
        if shape is None:
            return None
        mask = np.random.rand(*shape) > missing_ratios
        return mask.astype(np.float32)

    def prepare_tensors(self, physio: np.ndarray, env: np.ndarray, clinical: np.ndarray, 
                       events: Optional[np.ndarray] = None, tte: Optional[np.ndarray] = None):
        p_scaled, e_scaled, c_scaled = self.transform(physio, env, clinical)
        
        p_patched = self.create_patches(p_scaled)
        e_patched = self.create_patches(e_scaled)
        c_patched = self.create_patches(c_scaled)
        
        p_tensor = torch.tensor(p_patched, dtype=torch.float32)
        e_tensor = torch.tensor(e_patched, dtype=torch.float32)
        c_tensor = torch.tensor(c_patched, dtype=torch.float32)
        
        result = {"physio": p_tensor, "env": e_tensor, "clinical": c_tensor}
        
        if events is not None and tte is not None:
            batch, n_steps = events.shape
            num_patches = n_steps // self.patch_size
            valid_steps = num_patches * self.patch_size
            
            ev_valid = events[:, -valid_steps:].reshape(batch, num_patches, self.patch_size)
            tte_valid = tte[:, -valid_steps:].reshape(batch, num_patches, self.patch_size)
            
            ev_patch = ev_valid.max(axis=2)
            tte_patch = tte_valid.min(axis=2)
            
            result["events"] = torch.tensor(ev_patch, dtype=torch.float32)
            result["tte"] = torch.tensor(tte_patch, dtype=torch.float32)
            
        return result
