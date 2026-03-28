import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.schemas import ChatRequest, ChatResponse, MessageSchema, SolutionData
from app.services.auth import get_current_user
from app.services.math_engine import solve_math
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_interaction(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch or create conversation
    if req.conversation_id:
        stmt = select(Conversation).where(
            Conversation.id == req.conversation_id, Conversation.user_id == current_user.id
        )
        result = await db.execute(stmt)
        conversation = result.scalars().first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        # Update updated_at
        conversation.updated_at = datetime.now(timezone.utc)
    else:
        # Auto-generate title using first few chars of input
        title = req.content[:30] + "..." if len(req.content) > 30 else req.content
        conversation = Conversation(user_id=current_user.id, title=title)
        db.add(conversation)
        await db.flush() # flush to generate ID

    # 2. Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.content,
        mode=req.mode,
    )
    db.add(user_msg)
    await db.flush()

    # 3. Generate AI response (call math engine)
    # Perform symbolic solve first
    ai_response_dict = solve_math(req.content, req.mode, req.language)
    
    # 3b. Determine if we need an LLM response (either pedagogical mode OR fallback)
    use_llm = (req.mode == "pedagogical") or (ai_response_dict["solution"] is None)
    
    # 3c. If LLM is needed, get enhanced explanation or fallback answer
    if use_llm:
        # Grounding context from symbolic engine if available
        context = ai_response_dict.get("solution")
        llm_response = await llm_service.generate_response(req.content, context, req.language)
        ai_response_dict["content"] = llm_response["content"]
        # If SymPy failed, don't create a dummy solution panel —
        # the LLM's rich explanation in content is sufficient.
    
    # 4. Save AI message
    ai_json_solution = None
    if ai_response_dict.get("solution"):
        ai_json_solution = json.dumps(ai_response_dict["solution"])
        
    ai_msg = Message(
        conversation_id=conversation.id,
        role="ai",
        content=ai_response_dict["content"],
        mode=req.mode,
        solution_json=ai_json_solution
    )
    db.add(ai_msg)
    await db.flush()

    # 5. Format return
    # Parse solution correctly to match Schema
    sol_data = ai_response_dict.get("solution")
    
    return ChatResponse(
        conversation_id=conversation.id,
        message=MessageSchema(
            id=ai_msg.id,
            role="ai",
            content=ai_response_dict["content"],
            solution=SolutionData(**sol_data) if sol_data else None,
            mode=req.mode,
            timestamp=ai_msg.created_at,
        )
    )

@router.get("/conversations", response_model=list[dict])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Conversation).where(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc())
    result = await db.execute(stmt)
    convos = result.scalars().all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "updated_at": c.updated_at.isoformat()
        } for c in convos
    ]
