from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, diagnostics
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="SmartVahan AI API")

# CORS Configuration for Production
# Add your Vercel deployment URL here
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://smartvahan.vercel.app",  # Replace with your actual Vercel domain
    "https://*.vercel.app",  # Allow all Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with allowed_origins list above
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(diagnostics.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    """Initialize mode service on startup"""
    try:
        from services.mode_service import get_mode_service
        mode_service = get_mode_service()
        current_mode = "demo" if mode_service.get_mode() else "real"
        logging.info(f"[STARTUP] Mode service initialized. Current mode: {current_mode}")
    except Exception as e:
        logging.error(f"[STARTUP ERROR] Failed to initialize mode service: {e}")
        # Don't crash the app, just log the error

@app.get("/")
async def root():
    return {"message": "SmartVahan AI API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
