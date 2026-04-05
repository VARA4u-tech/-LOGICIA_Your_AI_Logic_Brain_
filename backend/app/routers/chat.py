import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.limiter import limiter

from app.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse, MessageSchema, SolutionData
from app.services.math_engine import solve_math
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["chat"])

GUEST_USER_ID = "global-guest-id"

@router.post("/", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_interaction(
    req: ChatRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # ── 1. Fetch or create conversation (DB optional — fail gracefully) ────────
    conversation_id = req.conversation_id
    try:
        if conversation_id:
            conversation = await db["conversations"].find_one({"_id": conversation_id})
            if not conversation:
                conversation = await _create_conversation(db, conversation_id, req.content, now)
            else:
                await db["conversations"].update_one(
                    {"_id": conversation["_id"]},
                    {"$set": {"updated_at": now}},
                )
        else:
            conversation_id = str(uuid.uuid4())
            conversation = await _create_conversation(db, conversation_id, req.content, now)
    except Exception as db_err:
        # DB unavailable — generate a fallback conversation ID and continue
        print(f"[DB WARNING] Conversation fetch/create failed: {db_err}")
        conversation_id = conversation_id or str(uuid.uuid4())
        conversation = {"_id": conversation_id}

    # ── 2. Save user message (best-effort) ────────────────────────────────────
    user_msg_id = str(uuid.uuid4())
    try:
        await db["messages"].insert_one({
            "_id": user_msg_id,
            "conversation_id": conversation["_id"],
            "role": "user",
            "content": req.content,
            "mode": "detailed",
            "created_at": now,
        })
    except Exception as e:
        print(f"[DB WARNING] Could not save user message: {e}")

    # ── 3. Run math engine (local SymPy — always available) ───────────────────
    ai_response_dict = solve_math(req.content, req.language)

    # ── 4. Call LLM (OpenRouter) for intelligent explanation ──────────────────
    try:
        context = ai_response_dict.get("solution")
        llm_response = await llm_service.generate_response(
            req.content, context, req.language
        )
        ai_response_dict["content"] = llm_response["content"]
    except Exception as llm_err:
        print(f"[LLM ERROR] {llm_err}")
        # Fallback: use math engine content if LLM fails
        if not ai_response_dict.get("content"):
            ai_response_dict["content"] = (
                "I'm having trouble connecting to my AI engine right now. "
                "Please try again in a moment."
            )

    if not ai_response_dict.get("content"):
        ai_response_dict["content"] = "I was unable to generate a response. Please try again."

    # ── 5. Save AI message (best-effort) ──────────────────────────────────────
    ai_msg_id = str(uuid.uuid4())
    try:
        await db["messages"].insert_one({
            "_id": ai_msg_id,
            "conversation_id": conversation["_id"],
            "role": "ai",
            "content": ai_response_dict["content"],
            "mode": "detailed",
            "solution": ai_response_dict.get("solution"),
            "created_at": datetime.now(timezone.utc),
        })
    except Exception as e:
        print(f"[DB WARNING] Could not save AI message: {e}")

    # ── 6. Build and return response ──────────────────────────────────────────
    sol_data = ai_response_dict.get("solution")

    return ChatResponse(
        conversation_id=conversation["_id"],
        message=MessageSchema(
            id=ai_msg_id,
            role="ai",
            content=ai_response_dict["content"],
            solution=SolutionData(**sol_data) if sol_data else None,
            timestamp=datetime.now(timezone.utc),
        ),
    )


async def _create_conversation(db, conv_id: str, content: str, now: datetime) -> dict:
    """Helper: insert and return a new conversation document."""
    title = content[:40] + "..." if len(content) > 40 else content
    doc = {
        "_id": conv_id,
        "user_id": GUEST_USER_ID,
        "title": title,
        "created_at": now,
        "updated_at": now,
    }
    await db["conversations"].insert_one(doc)
    return doc


@router.get("/conversations", response_model=list[dict])
async def list_conversations(db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        cursor = db["conversations"].find({"user_id": GUEST_USER_ID}).sort("updated_at", -1)
        convos = await cursor.to_list(length=50)
        return [
            {
                "id": c["_id"],
                "title": c["title"],
                "updated_at": c["updated_at"].isoformat(),
            }
            for c in convos
        ]
    except Exception as e:
        print(f"[DB WARNING] Could not list conversations: {e}")
        return []
