import torch
import numpy as np
from app.models.patchtst import PatchTSTModel
from app.data.preprocessing import AsthmaDataPreprocessor

class InferenceEngine:
    def __init__(self, model_path: str, preprocessor: AsthmaDataPreprocessor):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = PatchTSTModel().to(self.device)
        try:
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        except FileNotFoundError:
            print(f"Warning: Model not found at {model_path}. Using initialized weights.")
        self.model.eval()
        self.preprocessor = preprocessor

    def predict(self, physio: np.ndarray, env: np.ndarray, clinical: np.ndarray):
        tensors = self.preprocessor.prepare_tensors(physio, env, clinical)
        
        p = tensors["physio"].unsqueeze(0).to(self.device)
        e = tensors["env"].unsqueeze(0).to(self.device)
        c = tensors["clinical"].unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            hazard_ratios, attn_weights = self.model(p, e, c)
            
        hr = hazard_ratios.squeeze().cpu().numpy()
        # Convert to 0-1 probability risk score
        risk_scores = 1 / (1 + np.exp(-hr))
        if risk_scores.ndim == 0:
            risk_scores = np.array([risk_scores])
            
        avg_attn = attn_weights.squeeze(0).mean(dim=0).cpu().numpy()
        
        factors = []
        if len(avg_attn) >= 5:
            if avg_attn[0] > 0.2: factors.append("Air Quality (AQI)")
            if avg_attn[1] > 0.2: factors.append("PM2.5 Levels")
            if avg_attn[2] > 0.2: factors.append("Temperature Change")
            if avg_attn[3] > 0.2: factors.append("Humidity")
            if avg_attn[4] > 0.2: factors.append("Pollen Count")
        
        if not factors:
            factors.append("No significant environmental triggers identified")
            
        return risk_scores.tolist(), factors
