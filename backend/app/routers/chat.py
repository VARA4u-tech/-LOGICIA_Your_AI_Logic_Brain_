import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse, MessageSchema, SolutionData
from app.services.math_engine import solve_math
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_interaction(
    req: ChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # For now, allow guest users without login
    GUEST_USER_ID = "global-guest-id"
    now = datetime.now(timezone.utc)
    
    # 1. Fetch or create conversation
    if req.conversation_id:
        conversation = await db["conversations"].find_one({"_id": req.conversation_id})
        if not conversation:
            # Fallback: Create new if ID not found
            title = req.content[:30] + "..." if len(req.content) > 30 else req.content
            conversation = {
                "_id": str(uuid.uuid4()),
                "user_id": GUEST_USER_ID,
                "title": title,
                "created_at": now,
                "updated_at": now
            }
            await db["conversations"].insert_one(conversation)
        else:
            # Update updated_at
            await db["conversations"].update_one(
                {"_id": conversation["_id"]},
                {"$set": {"updated_at": now}}
            )
    else:
        # Auto-generate title using first few chars of input
        title = req.content[:30] + "..." if len(req.content) > 30 else req.content
        conversation = {
            "_id": str(uuid.uuid4()),
            "user_id": GUEST_USER_ID,
            "title": title,
            "created_at": now,
            "updated_at": now
        }
        await db["conversations"].insert_one(conversation)

    # 2. Save user message
    user_msg_id = str(uuid.uuid4())
    user_msg = {
        "_id": user_msg_id,
        "conversation_id": conversation["_id"],
        "role": "user",
        "content": req.content,
        "mode": "detailed",
        "created_at": now
    }
    await db["messages"].insert_one(user_msg)

    # 3. Generate AI response (call math engine)
    ai_response_dict = solve_math(req.content, req.language)
    
    # 3b. Determine if we need an LLM response (detailed/pedagogical mode ALWAYS)
    use_llm = True
    if use_llm:
        context = ai_response_dict.get("solution")
        llm_response = await llm_service.generate_response(req.content, context, req.language)
        ai_response_dict["content"] = llm_response["content"]
        
    if not ai_response_dict.get("content"):
        ai_response_dict["content"] = "I apologize, but I was unable to generate a response."
    
    # 4. Save AI message
    ai_msg_id = str(uuid.uuid4())
    ai_msg = {
        "_id": ai_msg_id,
        "conversation_id": conversation["_id"],
        "role": "ai",
        "content": ai_response_dict["content"],
        "mode": "detailed",
        "solution": ai_response_dict.get("solution"),
        "created_at": datetime.now(timezone.utc)
    }
    await db["messages"].insert_one(ai_msg)

    # 5. Format return
    sol_data = ai_response_dict.get("solution")
    
    return ChatResponse(
        conversation_id=conversation["_id"],
        message=MessageSchema(
            id=ai_msg_id,
            role="ai",
            content=ai_response_dict["content"],
            solution=SolutionData(**sol_data) if sol_data else None,
            timestamp=ai_msg["created_at"],
        )
    )

@router.get("/conversations", response_model=list[dict])
async def list_conversations(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Note: Using GUEST_USER_ID as primary for now since we removed auth
    GUEST_USER_ID = "global-guest-id"
    cursor = db["conversations"].find({"user_id": GUEST_USER_ID}).sort("updated_at", -1)
    convos = await cursor.to_list(length=50)
    
    return [
        {
            "id": c["_id"],
            "title": c["title"],
            "updated_at": c["updated_at"].isoformat()
        } for c in convos
    ]
