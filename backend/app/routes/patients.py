from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.patient import PatientCreate, PatientRecord
from app.database import get_patients_collection, get_predictions_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.delete("/admin/clear-all")
async def clear_all_data():
    patients_col = get_patients_collection()
    predictions_col = get_predictions_collection()
    await patients_col.delete_many({})
    await predictions_col.delete_many({})
    return {"message": "All patients and predictions cleared"}

def patient_helper(patient) -> PatientRecord:
    patient["id"] = str(patient["_id"])
    return PatientRecord(**patient)

@router.post("/", response_model=PatientRecord, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientCreate):
    patient_dict = patient.dict()
    patient_dict["created_at"] = datetime.utcnow()
    patient_dict["status"] = "active"
    
    collection = get_patients_collection()
    result = await collection.insert_one(patient_dict)
    
    created_patient = await collection.find_one({"_id": result.inserted_id})
    return patient_helper(created_patient)

@router.get("/", response_model=List[PatientRecord])
async def get_patients():
    collection = get_patients_collection()
    patients = []
    async for p in collection.find():
        patients.append(patient_helper(p))
    return patients

@router.get("/{id}", response_model=PatientRecord)
async def get_patient(id: str):
    collection = get_patients_collection()
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    patient = await collection.find_one({"_id": obj_id})
    if patient:
        return patient_helper(patient)
    raise HTTPException(status_code=404, detail="Patient not found")

@router.delete("/{id}")
async def delete_patient(id: str):
    collection = get_patients_collection()
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    result = await collection.delete_one({"_id": obj_id})
    if result.deleted_count == 1:
        return {"message": "Patient deleted successfully"}
    raise HTTPException(status_code=404, detail="Patient not found")
