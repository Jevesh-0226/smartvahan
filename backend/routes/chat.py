from fastapi import APIRouter, HTTPException, Depends
from models.chat_models import ChatRequest, ChatResponse
from services.gemini_service import get_gemini_service, GeminiService
from services.demo_response_service import get_demo_service
from datetime import datetime
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, service: GeminiService = Depends(get_gemini_service)):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Zero-lag mode switching: use mode from request payload
        if request.mode == "demo":
            response_text = get_demo_service().get_demo_chat_response(request.message)
        else:
            response_text = await service.get_chat_response(request.message, request.history)
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now()
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in chat endpoint: {error_msg}")
        # Check for common Gemini errors
        if "API_KEY_INVALID" in error_msg:
            error_msg = "Invalid API Key. Please check your Render environment variables."
        elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
            # Providing more detail to the user
            error_msg = f"API Quota exceeded or limit reached. Detail: {error_msg}. Please try again in 1 minute."
        else:
            error_msg = f"Backend Error: {error_msg}"
        
        raise HTTPException(status_code=500, detail=error_msg)
