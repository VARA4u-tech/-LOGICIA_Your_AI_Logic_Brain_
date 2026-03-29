import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from app.database import get_db
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.services.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    # Check if username or email exists
    existing = await db["users"].find_one({
        "$or": [{"email": user_in.email}, {"username": user_in.username}]
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists.",
        )

    user_id = str(uuid.uuid4())
    new_user = {
        "_id": user_id,
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": get_password_hash(user_in.password),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db["users"].insert_one(new_user)
    
    return UserResponse(
        id=user_id,
        email=new_user["email"],
        username=new_user["username"],
        is_active=new_user["is_active"]
    )

@router.post("/token", response_model=Token)
async def login(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)) -> Any:
    user = await db["users"].find_one({"email": user_in.email})
    
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["_id"]})
    return {"access_token": access_token, "token_type": "bearer"}
