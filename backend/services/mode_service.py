class ModeService:
    def __init__(self):
        # Default to Demo Mode as requested
        self._demo_mode = True

    def set_mode(self, is_demo: bool):
        self._demo_mode = is_demo

    def get_mode(self) -> bool:
        return self._demo_mode

# Singleton instance
mode_service = ModeService()

def get_mode_service():
    return mode_service
