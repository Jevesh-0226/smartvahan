import json
import os
from pathlib import Path

# File-based state persistence (Railway-compatible)
MODE_STATE_FILE = "mode_state.json"

class ModeService:
    def __init__(self):
        """Initialize mode service with file-based persistence"""
        self._ensure_state_file_exists()
    
    def _ensure_state_file_exists(self):
        """Create mode_state.json with default 'demo' if it doesn't exist"""
        if not os.path.exists(MODE_STATE_FILE):
            default_state = {"mode": "demo"}
            try:
                with open(MODE_STATE_FILE, 'w') as f:
                    json.dump(default_state, f, indent=2)
                print(f"[MODE SERVICE] Created {MODE_STATE_FILE} with default mode: demo")
            except Exception as e:
                print(f"[MODE SERVICE ERROR] Failed to create state file: {e}")
    
    def set_mode(self, is_demo: bool):
        """
        Set the current mode and persist to file
        
        Args:
            is_demo (bool): True for demo mode, False for real mode
        """
        mode_value = "demo" if is_demo else "real"
        
        try:
            with open(MODE_STATE_FILE, 'w') as f:
                json.dump({"mode": mode_value}, f, indent=2)
            print(f"[MODE SERVICE] Mode updated to: {mode_value}")
            return True
        except Exception as e:
            print(f"[MODE SERVICE ERROR] Failed to save mode: {e}")
            return False
    
    def get_mode(self) -> bool:
        """
        Get the current mode from file
        
        Returns:
            bool: True if demo mode, False if real mode
        """
        try:
            # Ensure file exists
            self._ensure_state_file_exists()
            
            with open(MODE_STATE_FILE, 'r') as f:
                data = json.load(f)
                mode_value = data.get("mode", "demo")
                is_demo = mode_value == "demo"
                
                print(f"[MODE SERVICE] Current mode read from file: {mode_value}")
                return is_demo
                
        except Exception as e:
            print(f"[MODE SERVICE ERROR] Failed to read mode, defaulting to demo: {e}")
            # Default to demo mode on error
            return True

# Singleton instance
mode_service = ModeService()

def get_mode_service():
    """Get the singleton mode service instance"""
    return mode_service
