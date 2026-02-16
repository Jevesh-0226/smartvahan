import requests
import json

url = "http://127.0.0.1:8000/api/sensor-data"
data = {
    "engine_temperature": 110,
    "oil_pressure": 45,
    "brake_wear": 30,
    "battery_voltage": 13.5,
    "tire_pressure": 32
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
