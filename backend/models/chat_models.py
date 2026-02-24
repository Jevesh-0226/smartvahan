from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # 'user' or 'model'
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    mode: Optional[str] = "demo"  # Added to support zero-lag mode switching

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
