from fastapi import APIRouter, HTTPException
from typing import List
from models.sensor_models import SensorData, DiagnosticReport, ServiceRequest, MaintenanceRecord, ModeRequest
from services.diagnostic_service import analyze_sensor_data, perform_service, get_maintenance_history, delete_maintenance_record
from services.mode_service import get_mode_service

router = APIRouter()

@router.post("/sensor-data", response_model=DiagnosticReport)
async def sensor_data_endpoint(data: SensorData):
    return await analyze_sensor_data(data)

@router.post("/service-complete")
async def service_complete_endpoint(request: ServiceRequest):
    if perform_service(request.component_name):
        return {"message": "Service completed successfully"}
    raise HTTPException(status_code=404, detail="Component not found")

@router.get("/maintenance-history", response_model=List[MaintenanceRecord])
async def maintenance_history_endpoint():
    return get_maintenance_history()

@router.delete("/maintenance/{record_id}")
async def delete_maintenance_endpoint(record_id: str):
    if delete_maintenance_record(record_id):
        return {"message": "Record deleted successfully", "deleted_id": record_id}
    raise HTTPException(status_code=404, detail="Record not found")

@router.post("/set-mode")
async def set_mode_endpoint(request: ModeRequest):
    mode_service = get_mode_service()
    is_demo = request.mode.lower() == "demo"
    mode_service.set_mode(is_demo)
    return {"currentMode": "demo" if is_demo else "real"}

@router.get("/get-mode")
async def get_mode_endpoint():
    mode_service = get_mode_service()
    is_demo = mode_service.get_mode()
    return {"currentMode": "demo" if is_demo else "real"}
