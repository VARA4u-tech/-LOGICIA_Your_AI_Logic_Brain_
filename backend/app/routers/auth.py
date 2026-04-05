import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from app.limiter import limiter

from app.database import get_db
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.services.auth import get_password_hash, verify_password, create_access_token

from app.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google", response_model=Token)
@limiter.limit("10/minute")
async def google_login(
    token_in: dict,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Any:
    # 1. Verify token
    try:
        id_info = id_token.verify_oauth2_token(
            token_in["credential"],
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        email = id_info.get("email")
        if not email:
            raise ValueError("Token has no email")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )

    # 2. Find or create user
    user = await db["users"].find_one({"email": email})
    
    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "email": email,
            "username": email.split("@")[0],
            "hashed_password": "", # No password for Google users
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "auth_provider": "google"
        }
        await db["users"].insert_one(user)
    else:
        user_id = user["_id"]

    # 3. Create access token
    access_token = create_access_token(data={"sub": user_id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "username": user["username"]
        }
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    user_in: UserCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Any:
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
@limiter.limit("5/minute")
async def login(
    user_in: UserCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Any:
    user = await db["users"].find_one({"email": user_in.email})
    
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["_id"]})
    return {"access_token": access_token, "token_type": "bearer"}
