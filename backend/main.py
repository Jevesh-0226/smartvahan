from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, diagnostics
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SmartVahan AI API")

# CORS Configuration for Production
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://smartvahan.vercel.app",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with allowed_origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Eagerly initialize singletons at startup ──────────────────────────────
# This ensures services are warm before the first request arrives.
# No lazy initialization inside endpoints.
try:
    logger.info("[STARTUP] Pre-loading ModeService singleton...")
    from services.mode_service import get_mode_service
    _mode_svc = get_mode_service()
    logger.info(f"[STARTUP] ModeService ready — current mode: {'demo' if _mode_svc.get_mode() else 'real'}")
except Exception as e:
    logger.error(f"[STARTUP] ModeService pre-load failed: {e}")

try:
    logger.info("[STARTUP] Pre-loading GeminiService singleton...")
    from services.gemini_service import get_gemini_service
    _gemini_svc = get_gemini_service()
    logger.info("[STARTUP] GeminiService ready")
except Exception as e:
    logger.error(f"[STARTUP] GeminiService pre-load failed (non-fatal): {e}")

# ── Include routers ────────────────────────────────────────────────────────
try:
    logger.info("[STARTUP] Including chat router...")
    app.include_router(chat.router, prefix="/api")
    logger.info("[STARTUP] Chat router included successfully")
except Exception as e:
    logger.error(f"[STARTUP ERROR] Failed to include chat router: {e}")
    import traceback
    traceback.print_exc()

try:
    logger.info("[STARTUP] Including diagnostics router...")
    app.include_router(diagnostics.router, prefix="/api")
    logger.info("[STARTUP] Diagnostics router included successfully")
except Exception as e:
    logger.error(f"[STARTUP ERROR] Failed to include diagnostics router: {e}")
    import traceback
    traceback.print_exc()

logger.info("[STARTUP] Application initialized successfully ✓")


@app.get("/ping")
async def ping():
    """Simple ping endpoint for Railway health checks"""
    return {"status": "ok", "message": "pong"}


@app.get("/")
async def root():
    return {"message": "SmartVahan AI API is running"}


@app.get("/health")
async def health_check():
    """Detailed health check — singletons already initialized, just read cached state"""
    try:
        from services.mode_service import get_mode_service
        mode_svc = get_mode_service()
        # get_mode() is O(1) in-memory read after our optimization
        current_mode = "demo" if mode_svc.get_mode() else "real"
        return {
            "status": "healthy",
            "mode_service": "initialized",
            "current_mode": current_mode,
        }
    except Exception as e:
        return {
            "status": "degraded",
            "mode_service": "error",
            "error": str(e),
        }


if __name__ == "__main__":
    import os

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))

    logger.info(f"[LOCAL] Starting server on {host}:{port}")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
    )
