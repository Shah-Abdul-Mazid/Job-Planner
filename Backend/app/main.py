"""
CareerTrack BD — FastAPI application entry point.
Follows fastapi-struct 'all' template with lifespan-based startup.
"""

from __future__ import annotations
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router


# ── Lifespan (replaces @app.on_event) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # ① Create all tables (safe — no-op if already exist)
    Base.metadata.create_all(bind=engine)

    # ② Seed initial data if DB is empty
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        from app.models.item import Item
        if db.query(Item).count() == 0:
            from app.seed_data import seed_database
            seed_database(db)
    finally:
        db.close()

    # ③ Log startup
    print(f"✅ {settings.PROJECT_NAME} started — docs at http://127.0.0.1:8000/docs")

    yield  # ← app runs here

    # ④ Shutdown (cleanup if needed)
    print(f"🛑 {settings.PROJECT_NAME} shutting down.")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI-Powered Bangladesh Recruitment Intelligence Platform. "
        "Tracks government & private bank job applications, exam schedules, "
        "admit cards, and documents."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount all routes under /api/v1 ────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api/v1",
        "status": "running",
    }
