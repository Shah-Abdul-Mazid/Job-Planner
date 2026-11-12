"""
CareerTrack BD — FastAPI application entry point.
AI-Powered Bangladesh Recruitment Intelligence Platform.
"""

from __future__ import annotations
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Ensure Backend/ and Backend/app/ are on sys.path
_CURRENT_DIR = Path(__file__).resolve().parent      # Backend/app/
_PARENT_DIR  = _CURRENT_DIR.parent                  # Backend/
for _p in [str(_PARENT_DIR), str(_CURRENT_DIR)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown — skipped on Vercel to avoid cold-start timeouts."""
    try:
        mongodb_uri = os.getenv("MONGODB_URI") or getattr(settings, "MONGODB_URI", "")
        if mongodb_uri:
            print("[Lifespan] MongoDB Atlas URI detected.")
        else:
            # Local SQLite fallback
            try:
                from app.core.database import engine, Base
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
    except Exception as e:
        print(f"[Lifespan] Startup notice: {e}")

    print(f"✅ {settings.PROJECT_NAME} ready — docs at /docs")
    yield
    print(f"🛑 {settings.PROJECT_NAME} shutting down.")


# Skip lifespan on Vercel serverless to avoid cold-start timeouts
_app_lifespan = None if os.getenv("VERCEL") else lifespan

# ── App factory ────────────────────────────────────────────────────────────────
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
    lifespan=_app_lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
_extra_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
_all_origins = list(settings.BACKEND_CORS_ORIGINS) + [
    "https://job-planner-ivory.vercel.app",
    "https://bd-careertrack-jobplanner.vercel.app",
    "https://bd-career-jobplanner.vercel.app",
    "https://job-planner-psi.vercel.app",
] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_all_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount all v1 routes ────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Root / utility endpoints ───────────────────────────────────────────────────
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
