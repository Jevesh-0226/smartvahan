from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, diagnostics
import uvicorn
import logging

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
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
