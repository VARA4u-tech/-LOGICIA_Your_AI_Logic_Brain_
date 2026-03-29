from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth, chat

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    from app.models.user import User
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import select

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create global guest user if missing
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        guest_check = await session.execute(select(User).where(User.id == "global-guest-id"))
        if not guest_check.scalars().first():
            guest_user = User(
                id="global-guest-id",
                username="Guest",
                email="guest@logicia.ai",
                hashed_password="not-a-real-password",
                is_active=True
            )
            session.add(guest_user)
            await session.commit()
            
    yield
    await engine.dispose()

app = FastAPI(
    title="Logicia AI Math Brain",
    description="Backend API for solving math problems and managing conversations.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
