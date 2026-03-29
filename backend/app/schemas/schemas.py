import json
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Literal, Optional, Any

# ==========================================
# AUTH SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str


# ==========================================
# CHAT SCHEMAS
# ==========================================
class Step(BaseModel):
    label: str
    math: str
    explanation: Optional[str] = None
    note: Optional[str] = None
    subSteps: Optional[List[str]] = None

class PlotData(BaseModel):
    x: float
    y: float

class SolutionData(BaseModel):
    method: Optional[str] = None
    steps: List[Step]
    finalAnswer: str
    graphData: Optional[List[PlotData]] = None

class ChatRequest(BaseModel):
    content: str
    language: str = "en"
    conversation_id: Optional[str] = None

class MessageSchema(BaseModel):
    id: str
    role: Literal["user", "ai"]
    content: str
    solution: Optional[SolutionData] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
    
class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageSchema
    
class ConversationSchema(BaseModel):
    id: str
    title: str
    messages: List[MessageSchema]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
