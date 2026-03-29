from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, chat

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    from app.database import get_mongodb_client
    get_mongodb_client()
    yield

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
