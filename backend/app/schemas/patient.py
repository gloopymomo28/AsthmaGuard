from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PatientCreate(BaseModel):
    name: str
    age: int
    sex: str
    weight_kg: float
    height_cm: float
    asthma_severity: str = Field(..., description="mild, moderate, or severe")
    baseline_fev1_percent: float
    fvc: float = 0.0
    fev1_fvc_ratio: float = 0.0
    feno_level: float = 0.0
    blood_eosinophils: float = 0.0
    methacholine_pc20: float = 0.0
    personal_best_pefr: float = 0.0
    baseline_fev1_liters: float = 0.0
    act_score: int = 25
    exacerbations_last_year: int = 0
    comorbidities: List[str] = []
    smoking_status: str
    allergies: List[str] = []

class PatientRecord(PatientCreate):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"

class FeatureContribution(BaseModel):
    feature: str
    impact: str # e.g. "+15%"
    value: float # Raw SHAP value or percentage for sorting/charting

class PredictionResult(BaseModel):
    patient_id: str
    timestamps: List[str]
    risk_scores: List[float]
    contributing_factors: List[FeatureContribution]
    alert_level: str
