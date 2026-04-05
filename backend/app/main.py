from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import auth, chat

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    from app.database import get_mongodb_client
    get_mongodb_client()
    yield

app = FastAPI(
    title="Logicia AI Brain",
    description="Backend API for Logicia — your all-in-one competitive exam AI.",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Rate Limiter Registration ───────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — must be registered FIRST so headers appear even on errors ──────────
ALLOWED_ORIGINS = settings.FRONTEND_ORIGINS or [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Global error handler — ensures CORS headers are present on 500 errors ─────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler — returns CORS-safe JSON error instead of crashing."""
    import traceback
    traceback.print_exc()  # Print full traceback to server console

    # Determine origin for CORS header
    origin = request.headers.get("origin", ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "*")

    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__,
        },
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "version": "2.0.0"}
