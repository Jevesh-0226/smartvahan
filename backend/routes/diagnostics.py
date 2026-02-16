from fastapi import APIRouter, HTTPException
from typing import List
from models.sensor_models import SensorData, DiagnosticReport, ServiceRequest, MaintenanceRecord, PredictionData
from services.diagnostic_service import analyze_sensor_data, perform_service, get_maintenance_history, get_predictions

router = APIRouter()

@router.post("/sensor-data", response_model=DiagnosticReport)
async def sensor_data_endpoint(data: SensorData):
    return await analyze_sensor_data(data)

@router.post("/service-complete")
async def service_complete_endpoint(request: ServiceRequest):
    if perform_service(request.component_name):
        return {"message": "Service completed and logged", "status": "Healthy"}
    raise HTTPException(status_code=404, detail="Service failed or component not found")

@router.get("/maintenance-history", response_model=List[MaintenanceRecord])
async def maintenance_history_endpoint():
    return get_maintenance_history()

@router.get("/next-service-prediction", response_model=List[PredictionData])
async def prediction_endpoint():
    return get_predictions()
