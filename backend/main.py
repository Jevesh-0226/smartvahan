from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, diagnostics
import uvicorn
import logging
import os

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="SmartVahan AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(diagnostics.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "SmartVahan AI API is running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # We use uvicorn run but ensure the factory/app string is correct for Render
    uvicorn.run("main:app", host="0.0.0.0", port=port)
