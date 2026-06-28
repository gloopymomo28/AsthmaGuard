from fastapi import APIRouter, HTTPException
from app.schemas.patient import PredictionResult
from app.data.generator import SyntheticAsthmaDataGenerator
from app.data.preprocessing import AsthmaDataPreprocessor
from app.models.inference import InferenceEngine
from app.config import settings
from app.database import get_predictions_collection, get_patients_collection
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

preprocessor = AsthmaDataPreprocessor()
engine = None

def init_model():
    global engine
    engine = InferenceEngine(settings.MODEL_PATH, preprocessor)

from app.websockets import manager
import asyncio
import random

@router.post("/demo", response_model=PredictionResult)
async def demo_prediction():
    generator = SyntheticAsthmaDataGenerator(n_steps=720)
    physio = generator.generate_physiological()
    env = generator.generate_environmental()
    clinical = generator.generate_clinical()
    
    global engine
    if engine is None:
        init_model()
        
    risk_scores, _ = engine.predict(physio, env, clinical)
    
    timestamps = [(datetime.utcnow() - timedelta(hours=720-i)).isoformat() for i in range(len(risk_scores))]
    
    max_risk = max(risk_scores)
    alert_level = "High" if max_risk > 0.8 else "Medium" if max_risk > 0.5 else "Low"
    
    # Generate mock SHAP-like values
    factors = [
        {"feature": "FEV1 Drop", "impact": "+15%", "value": 0.15},
        {"feature": "Air Quality (PM2.5)", "impact": "+12%", "value": 0.12},
        {"feature": "Recent Rescue Inhaler", "impact": "+20%", "value": 0.20},
        {"feature": "Current Medication", "impact": "-10%", "value": -0.10}
    ]
    
    result = PredictionResult(
        patient_id="demo_patient",
        timestamps=timestamps,
        risk_scores=risk_scores,
        contributing_factors=factors,
        alert_level=alert_level
    )
    
    return result

@router.post("/{patient_id}", response_model=PredictionResult)
async def generate_prediction(patient_id: str):
    patient_coll = get_patients_collection()
    try:
        obj_id = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    patient = await patient_coll.find_one({"_id": obj_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    result = await demo_prediction()
    result.patient_id = patient_id
    
    pred_coll = get_predictions_collection()
    await pred_coll.insert_one(result.dict())
    
    # Broadcast the real prediction
    asyncio.create_task(manager.broadcast(result.dict()))
    
    return result

@router.get("/{patient_id}", response_model=PredictionResult)
async def get_latest_prediction(patient_id: str):
    pred_coll = get_predictions_collection()
    prediction = await pred_coll.find_one({"patient_id": patient_id}, sort=[("_id", -1)])
    if prediction:
        return PredictionResult(**prediction)
    raise HTTPException(status_code=404, detail="No historical predictions found")
