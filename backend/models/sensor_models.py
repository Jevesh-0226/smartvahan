from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SensorData(BaseModel):
    engine_temperature: float
    oil_pressure: float
    brake_wear: float
    battery_voltage: float
    tire_pressure: float

class DiagnosticAnalysis(BaseModel):
    cause: str
    effect: str
    solution: str
    prevention: str
    diagnosisSource: str = "Gemini Live"

class ComponentAlert(BaseModel):
    component: str
    value: float
    unit: str
    status: str
    timestamp: float
    analysis: Optional[DiagnosticAnalysis] = None

class ComponentState(BaseModel):
    id: str
    name: str
    value: float
    threshold: float
    unit: str
    status: str = "normal"
    flagged: bool = False
    recentlyServiced: bool = False
    serviceCooldownEnd: Optional[float] = None
    diagnosis: Optional[DiagnosticAnalysis] = None
    serviceCount: int = 0

class DiagnosticReport(BaseModel):
    status: str 
    active_alerts: Dict[str, ComponentAlert]
    component_states: Dict[str, ComponentState]
    analysis_timestamp: datetime = datetime.now()

class ServiceRequest(BaseModel):
    component_name: str

class MaintenanceRecord(BaseModel):
    id: Optional[str] = None
    global_id: int
    component_name: str
    service_date: str
    value_at_service: str
    cause: str
    effect: str
    solution: str
    prevention: str
    service_count: int
    diagnosisSource: str = "Gemini Live"

class ModeRequest(BaseModel):
    mode: str
