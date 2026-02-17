import time
import re
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models.sensor_models import (
    SensorData, DiagnosticReport, ComponentAlert, DiagnosticAnalysis, 
    MaintenanceRecord, ComponentState
)
from services.gemini_service import get_gemini_service
from services.mode_service import get_mode_service
from services.demo_response_service import get_demo_service

# Persistence paths
STATE_FILE = "vehicle_state.json"
HISTORY_FILE = "service_history.json"

def save_data(states, history):
    try:
        # Convert Pydantic models to dict for JSON serialization
        state_data = {k: v.dict() for k, v in states.items()}
        history_data = [h.dict() for h in history]
        
        with open(STATE_FILE, 'w') as f:
            json.dump(state_data, f, indent=2)
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history_data, f, indent=2)
    except Exception as e:
        print(f"CRITICAL STATE SAVE ERROR: {e}")

def load_data():
    default_states = {
        "engine_temperature": ComponentState(id="engine_temperature", name="Engine Thermal", value=90.0, threshold=105.0, unit="°C"),
        "oil_pressure": ComponentState(id="oil_pressure", name="Liquid Pressure", value=45.0, threshold=25.0, unit="PSI"),
        "brake_wear": ComponentState(id="brake_wear", name="Friction Material", value=30.0, threshold=85.0, unit="%"),
        "battery_voltage": ComponentState(id="battery_voltage", name="Energy Storage", value=13.5, threshold=11.5, unit="V"),
        "tire_pressure": ComponentState(id="tire_pressure", name="Pneumatic Load", value=32.0, threshold=28.0, unit="PSI")
    }
    
    states = default_states
    history = []
    
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                data = json.load(f)
                states = {k: ComponentState(**v) for k, v in data.items()}
        except Exception as e: print(f"Load State Error: {e}")
        
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                data = json.load(f)
                # Ensure compatibility with existing records
                for h in data:
                    if 'id' not in h:
                        h['id'] = str(uuid.uuid4())
                        
                history = [MaintenanceRecord(**h) for h in data]
                
                # Persist ID updates immediately if needed
                if any('id' not in h for h in data): # Note: This check logic is subtle as we modified data in place
                    pass # We will save on next update, or could save now. 
                    
        except Exception as e: print(f"Load History Error: {e}")
            
    return states, history

# Global in-memory containers synced with files
component_states, maintenance_history = load_data()

async def analyze_sensor_data(data: SensorData) -> DiagnosticReport:
    global component_states
    current_time = time.time()
    persist_needed = False
    
    sensor_map = {
        "engine_temperature": data.engine_temperature,
        "oil_pressure": data.oil_pressure,
        "brake_wear": data.brake_wear,
        "battery_voltage": data.battery_voltage,
        "tire_pressure": data.tire_pressure
    }

    gemini = get_gemini_service()
    mode_service = get_mode_service()
    demo_service = get_demo_service()
    
    is_demo_mode = mode_service.get_mode()
    print(f"[DIAGNOSTIC SERVICE] Processing with mode: {'DEMO' if is_demo_mode else 'REAL'}")

    for key, val in sensor_map.items():
        state = component_states[key]
        state.value = val
        
        # Handle Cooldown
        if state.recentlyServiced and state.serviceCooldownEnd:
            if current_time > state.serviceCooldownEnd:
                state.recentlyServiced = False
                state.serviceCooldownEnd = None
                persist_needed = True
        
        # Skip logic if in cooldown
        if state.recentlyServiced:
            continue

        # Threshold Logic
        is_triggered = False
        threshold = state.threshold
        if key == "engine_temperature" and val > threshold: is_triggered = True
        elif key == "oil_pressure" and val < threshold: is_triggered = True
        elif key == "brake_wear" and val > threshold: is_triggered = True
        elif key == "battery_voltage" and val < threshold: is_triggered = True
        elif key == "tire_pressure" and (val < (threshold - 4) or val > (threshold + 10)): is_triggered = True
        
        if is_triggered:
            # Trigger AI ONCE per breach - only if not already flagged
            if not state.flagged:
                state.flagged = True
                state.status = "critical"
                persist_needed = True
                
                if is_demo_mode:
                    # DEMO MODE LOGIC
                    print(f"[DEMO] Generating DEMO response for: {state.name}")
                    state.diagnosis = demo_service.get_demo_diagnosis(state.name, val, state.unit, threshold)
                
                else:
                    # REAL MODE (GEMINI) LOGIC
                    prompt = f"""You are an advanced automotive diagnostic AI.

A vehicle component has exceeded its safe threshold.

Component Name: {state.name}
Current Value: {val} {state.unit}
Safe Threshold: {state.threshold} {state.unit}

Provide a detailed technical automotive diagnosis.

Response MUST follow this exact format:

CAUSE:
Provide a 3–4 sentence technical explanation of the likely mechanical or electrical cause.

EFFECT:
Provide a 3–4 sentence explanation of potential mechanical damage, system impact, and risk escalation.

SOLUTION:
Provide step-by-step professional corrective actions (minimum 3 steps).

PREVENTION:
Provide 2–3 professional maintenance recommendations to avoid recurrence.

Rules:
- Be specific to the component.
- Do NOT provide generic answers.
- Do NOT repeat the same text for different components.
- No markdown.
- No bullet symbols.
- No introductory sentence."""

                    # Call Gemini with proper error handling
                    response = await gemini.get_diagnostic_analysis(key, prompt)
                    
                    if response["success"]:
                        # Successful AI response
                        response_text = response["text"]
                        
                        # LOG RAW RESPONSE FOR VALIDATION
                        print(f"\n[AI DEBUG] GEMINI RAW RESPONSE FOR {state.name}:", flush=True)
                        print("-" * 50, flush=True)
                        print(response_text, flush=True)
                        print("-" * 50, flush=True)

                        # ROBUST PARSING
                        def parse_section(section_name, text):
                            pattern = rf"{section_name}:\s*(.*?)(?=\n[A-Z]+:|$)"
                            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
                            return match.group(1).strip() if match else "Analysis failed - Check ECU connection."

                        state.diagnosis = DiagnosticAnalysis(
                            cause=parse_section("CAUSE", response_text),
                            effect=parse_section("EFFECT", response_text),
                            solution=parse_section("SOLUTION", response_text),
                            prevention=parse_section("PREVENTION", response_text),
                            diagnosisSource=response["source"]
                        )
                    else:
                        # Fallback response (quota exceeded, rate limited, etc.)
                        response_text = response["text"]
                        
                        print(f"\n[FALLBACK] Using fallback response for {state.name}")
                        print(f"Source: {response['source']}")
                        
                        # Parse fallback response (already in correct format)
                        def parse_section(section_name, text):
                            pattern = rf"{section_name}:\s*(.*?)(?=\n[A-Z]+:|$)"
                            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
                            return match.group(1).strip() if match else "Service temporarily unavailable."

                        state.diagnosis = DiagnosticAnalysis(
                            cause=parse_section("CAUSE", response_text),
                            effect=parse_section("EFFECT", response_text),
                            solution=parse_section("SOLUTION", response_text),
                            prevention=parse_section("PREVENTION", response_text),
                            diagnosisSource=response["source"]
                        )
            # If already flagged, do NOT call AI again (prevents repeated calls)

        else:
            # Reset only on manual Service Now click
            pass

    if persist_needed:
        save_data(component_states, maintenance_history)

    # Status Indicator Logic
    has_critical = any(s.status == "critical" for s in component_states.values())
    status_text = "Action Required" if has_critical else "System Healthy"

    return DiagnosticReport(
        status=status_text, 
        active_alerts={}, 
        component_states=component_states
    )

def perform_service(component_name: str) -> bool:
    global component_states, maintenance_history
    if component_name in component_states:
        state = component_states[component_name]
        
        # PART 4 - SERVICE COUNT INCREMENT
        state.serviceCount += 1
        
        global_id = len(maintenance_history) + 1
        
        # Get AI Data or raise Error (No hardcoded myths)
        if not state.flagged or state.diagnosis is None:
            # Maybe it was manual service or error state
            diag = DiagnosticAnalysis(
                cause="Scheduled or manual maintenance event.",
                effect="Preventative measure.",
                solution="Manual inspection performed.",
                prevention="Routine checkup.",
                diagnosisSource="Manual Entry"
            )
        else:
            diag = state.diagnosis

        # PART 5 - MAINTENANCE HISTORY PERSISTENCE
        maintenance_history.insert(0, MaintenanceRecord(
            id=str(uuid.uuid4()),
            global_id=global_id,
            component_name=state.name,
            service_date=datetime.now().strftime("%d %b %Y %H:%M"),
            value_at_service=f"{state.value:.1f}{state.unit}",
            cause=diag.cause,
            effect=diag.effect,
            solution=diag.solution,
            prevention=diag.prevention,
            service_count=state.serviceCount,
            diagnosisSource=diag.diagnosisSource
        ))
        
        # PART 6 - COMPONENT RESET
        state.status = "normal"
        state.flagged = False
        state.recentlyServiced = True
        state.serviceCooldownEnd = time.time() + 60.0
        state.diagnosis = None
        
        save_data(component_states, maintenance_history)
        return True
    return False

def get_maintenance_history() -> List[MaintenanceRecord]:
    return maintenance_history

def delete_maintenance_record(record_id: str) -> bool:
    global maintenance_history
    initial_count = len(maintenance_history)
    maintenance_history = [r for r in maintenance_history if r.id != record_id]
    
    if len(maintenance_history) < initial_count:
        save_data(component_states, maintenance_history)
        return True
    return False
