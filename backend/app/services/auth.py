from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

from app.config import settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str | None = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)) -> dict:
    GUEST_USER_ID = "global-guest-id"
    
    # ── Dev mode bypass: If no token, auto-assign the guest/test user ──
    if not token:
        user = await db["users"].find_one({"_id": GUEST_USER_ID})
        if not user:
            user = {
                "_id": GUEST_USER_ID,
                "email": "guest@logicia.app",
                "username": "Guest",
                "hashed_password": get_password_hash("password"),
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            await db["users"].insert_one(user)
        return user
    # ───────────────────────────────────────────────────────────

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db["users"].find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
        
    return user
