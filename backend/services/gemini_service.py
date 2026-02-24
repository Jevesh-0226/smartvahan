import google.generativeai as genai
import os
import time
from dotenv import load_dotenv
from typing import List, Optional, Dict
from models.chat_models import Message
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("CRITICAL: GEMINI_API_KEY environment variable is not set. Server cannot start.")
        
        self.api_key = self.api_key.strip()
        self.model = None
        self.current_model_name = "gemini-1.5-flash"
        self.last_call_time = {}  # Track last call time per component for rate limiting
        self.cooldown_seconds = 60  # Cooldown between AI calls per component

        # Eager initialization — model is ready before first request arrives
        # Avoids visible latency spike on the first chat message
        try:
            self._initialize_model()
            logger.info("[STARTUP] Gemini model pre-initialized successfully")
        except Exception as e:
            logger.warning(f"[STARTUP] Gemini model pre-init failed (will retry on first use): {e}")

    def _initialize_model(self):
        """Initialize Gemini model with proper error handling"""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing.")
        
        genai.configure(api_key=self.api_key)
        
        # Use the official stable model name with models/ prefix
        model_name = "models/gemini-flash-latest"
        logger.info(f"[OK] Gemini model used: {model_name}")
        print(f"[OK] Gemini model used: {model_name}", flush=True)
        
        try:
            self.model = genai.GenerativeModel(model_name)
            self.current_model_name = model_name
        except Exception as e:
            logger.error(f"[ERROR] Failed to initialize Gemini model: {e}")
            print(f"[ERROR] Failed to initialize Gemini model: {e}", flush=True)
            raise

    def can_make_request(self, component_name: str) -> bool:
        """Check if enough time has passed since last request for this component"""
        if component_name not in self.last_call_time:
            return True
        
        time_since_last = time.time() - self.last_call_time[component_name]
        return time_since_last >= self.cooldown_seconds

    def record_request(self, component_name: str):
        """Record the time of this request"""
        self.last_call_time[component_name] = time.time()

    async def get_diagnostic_analysis(self, component_name: str, prompt: str) -> Dict[str, str]:
        """
        Get diagnostic analysis from Gemini with proper error handling and rate limiting.
        Returns a structured response with fallback on errors.
        """
        if not self.model:
            try:
                self._initialize_model()
            except Exception as e:
                logger.error(f"[ERROR] Model initialization failed: {e}")
                print(f"[ERROR] Model initialization failed: {e}", flush=True)
                return self._get_fallback_response("initialization_error")

        # Check rate limiting
        if not self.can_make_request(component_name):
            logger.warning(f"[RATE LIMIT] Skipping AI call for {component_name} (cooldown active)")
            print(f"[RATE LIMIT] Skipping AI call for {component_name} (cooldown active)", flush=True)
            return self._get_fallback_response("rate_limited")

        logger.info(f"[REQUEST] Gemini request triggered for: {component_name}")
        print(f"[REQUEST] Gemini request triggered for: {component_name}", flush=True)
        
        # Try to get response with retry logic
        for attempt in range(2):  # Try twice
            try:
                # Use generate_content directly (SDK handles sync/async internally if called from sync/async context correctly)
                # But for safety in FastAPI, we can just call it.
                response = self.model.generate_content(prompt)
                
                # Record successful request
                self.record_request(component_name)
                
                logger.info(f"[SUCCESS] Gemini response received for: {component_name}")
                print(f"[SUCCESS] Gemini response received for: {component_name}", flush=True)
                return {
                    "text": response.text,
                    "source": "Gemini AI",
                    "success": True
                }
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"[API ERROR] Gemini API Error (attempt {attempt + 1}/2): {error_msg}")
                print(f"[API ERROR] Gemini API Error (attempt {attempt + 1}/2): {error_msg}", flush=True)
                
                # Check for quota/rate limit errors (429)
                if "429" in error_msg or "quota" in error_msg.lower() or "resource_exhausted" in error_msg.lower():
                    if attempt == 0:
                        # Wait 2 seconds before retry
                        logger.info("[WAIT] Waiting 2 seconds before retry...")
                        print("[WAIT] Waiting 2 seconds before retry...", flush=True)
                        time.sleep(2)
                        continue
                    else:
                        # Second attempt failed, return fallback
                        logger.error("[QUOTA] Quota exceeded after retry, using fallback response")
                        print("[QUOTA] Quota exceeded after retry, using fallback response", flush=True)
                        return self._get_fallback_response("quota_exceeded")
                
                # For other errors, return fallback immediately
                logger.error(f"[FALLBACK] API error, using fallback response: {error_msg}")
                print(f"[FALLBACK] API error, using fallback response: {error_msg}", flush=True)
                return self._get_fallback_response("api_error")
        
        # Should not reach here, but return fallback just in case
        return self._get_fallback_response("unknown_error")

    def _get_fallback_response(self, reason: str) -> Dict[str, str]:
        """
        Return a structured fallback response when AI is unavailable.
        This ensures the frontend always gets clean, structured data.
        """
        fallback_responses = {
            "quota_exceeded": {
                "text": """CAUSE:
AI diagnostic quota has been temporarily exceeded. This is a service limitation, not a vehicle issue.

EFFECT:
Live AI diagnostics are currently unavailable. Vehicle monitoring continues normally.

SOLUTION:
1. Manual inspection recommended for critical alerts.
2. Diagnostic service will resume automatically when quota resets.
3. Consider upgrading API plan for higher request limits.

PREVENTION:
Optimize diagnostic request frequency. Implement request batching for multiple components.""",
                "source": "Fallback System",
                "success": False
            },
            "rate_limited": {
                "text": """CAUSE:
Request cooldown active to prevent excessive API usage. This component was recently analyzed.

EFFECT:
Temporary delay in AI analysis. Previous diagnostic results remain valid.

SOLUTION:
1. Review previous diagnostic report for this component.
2. Wait 60 seconds for cooldown to expire.
3. Retry analysis if component status changes significantly.

PREVENTION:
Avoid rapid repeated requests for the same component. Use cached diagnostic results.""",
                "source": "Fallback System",
                "success": False
            },
            "api_error": {
                "text": """CAUSE:
Unable to connect to AI diagnostic service. Network or API configuration issue detected.

EFFECT:
Live diagnostics temporarily unavailable. Manual inspection recommended.

SOLUTION:
1. Verify network connectivity and API key configuration.
2. Check server logs for detailed error information.
3. Restart backend service if issue persists.

PREVENTION:
Ensure stable network connection and valid API credentials.""",
                "source": "Fallback System",
                "success": False
            },
            "initialization_error": {
                "text": """CAUSE:
AI service failed to initialize. API key or model configuration issue.

EFFECT:
Diagnostic AI unavailable. System operates in manual mode.

SOLUTION:
1. Verify GEMINI_API_KEY is set in environment variables.
2. Check API key validity and permissions.
3. Restart backend service after fixing configuration.

PREVENTION:
Validate API configuration during server startup.""",
                "source": "Fallback System",
                "success": False
            },
            "unknown_error": {
                "text": """CAUSE:
Unexpected error in AI diagnostic service.

EFFECT:
Live diagnostics temporarily unavailable.

SOLUTION:
1. Review server logs for error details.
2. Perform manual vehicle inspection.
3. Contact system administrator if issue persists.

PREVENTION:
Regular system health monitoring and log review.""",
                "source": "Fallback System",
                "success": False
            }
        }
        
        return fallback_responses.get(reason, fallback_responses["unknown_error"])

    async def get_chat_response(self, user_message: str, history: List[Message]) -> str:
        """Chat endpoint with basic error handling"""
        if not self.model:
            self._initialize_model()
            
        chat_history = []
        for msg in history:
            chat_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        try:
            chat = self.model.start_chat(history=chat_history)
            response = chat.send_message(user_message)
            return response.text
        except Exception as e:
            error_msg = str(e)
            logger.error(f"[CHAT ERROR] {error_msg}")
            print(f"[CHAT ERROR] {error_msg}", flush=True)
            
            if "429" in error_msg or "quota" in error_msg.lower():
                return "I apologize, but the AI service quota has been temporarily exceeded. Please try again in a few moments."
            
            return f"I apologize, but I encountered an error: {error_msg}"

# ── Singleton (initialized ONCE at module import / server startup) ─────────
# By initializing here (not inside the endpoint), the model is warm and
# ready to serve the first request without any noticeable delay.
try:
    gemini_service = GeminiService()
    logger.info("[STARTUP] GeminiService singleton created successfully")
except Exception as e:
    gemini_service = None
    logger.error(f"[STARTUP] GeminiService singleton creation failed: {e}")


def get_gemini_service() -> GeminiService:
    """Return the singleton GeminiService. Lazily creates if startup failed."""
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service
