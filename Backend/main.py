"""
CareerTrack BD — FastAPI application entry point.
Single main file for Backend service (used by Vercel entrypoint 'main:app' and local development).
"""

from __future__ import annotations
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Ensure Backend directory is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router


# ── Lifespan (Defensive for serverless) ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    try:
        mongodb_uri = os.getenv("MONGODB_URI") or getattr(settings, "MONGODB_URI", "")
        if not mongodb_uri:
            # Create SQLite tables only if not in read-only environment
            try:
                Base.metadata.create_all(bind=engine)
            except Exception as e:
                print(f"[Lifespan] SQLite table creation skipped: {e}")

            try:
                from app.core.database import SessionLocal
                db = SessionLocal()
                try:
                    from app.models.item import Item
                    if db.query(Item).count() == 0:
                        from app.seed_data import seed_database
                        seed_database(db)
                finally:
                    db.close()
            except Exception as e:
                print(f"[Lifespan] SQLite seed skipped: {e}")
        else:
            print("[Lifespan] Connected with MongoDB Atlas configuration.")
    except Exception as e:
        print(f"[Lifespan] Startup notice: {e}")

    print(f"✅ {settings.PROJECT_NAME} ready — docs at /docs")
    yield
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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount all routes under /api/v1 ────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Root endpoints ────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api/v1",
        "status": "running",
    }


@app.get("/api", tags=["Root"])
async def api_root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "api": "/api/v1",
        "status": "running",
    }


@app.get("/api/v1", tags=["Root"])
async def api_v1_root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health", tags=["Root"])
async def health():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
    }


@app.get("/version", tags=["Root"])
async def version():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
    }


# Mangum handler for serverless compatibility
try:
    from mangum import Mangum
    handler = Mangum(app)
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
