"""
CareerTrack BD — Vercel Serverless Entrypoint
Service root: Backend/api/   (Vercel runs from here)
Parent (Backend/) is added to sys.path so `app.*` imports resolve correctly.
"""
from __future__ import annotations
import os
import sys
import traceback
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# ── Path setup ────────────────────────────────────────────────────────────────
# This file lives at Backend/api/index.py
# Backend/ is the parent — that's where app/, requirements.txt etc. live
BACKEND_DIR = Path(__file__).resolve().parent.parent  # Backend/api/../ = Backend/
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# ── Settings (read inline to avoid pydantic cold-start failures) ──────────────
PROJECT_NAME = "CareerTrack BD"
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://ezanshah58_db_user:tcB7vRP4jsbcgyT8@jobappilcationdatabasec.zc4vzys.mongodb.net/?retryWrites=true&w=majority"
)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bd-careertrack-jobplanner.vercel.app",
]

# ── FastAPI app ────────────────────────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    if MONGODB_URI:
        print("[Lifespan] Connected with MongoDB Atlas configuration.")
    else:
        print("[Lifespan] No MongoDB URI — SQLite fallback.")
    print(f"✅ {PROJECT_NAME} ready — docs at /docs")
    yield
    print(f"🛑 {PROJECT_NAME} shutting down.")


app = FastAPI(
    title=PROJECT_NAME,
    description="AI-Powered Bangladesh Recruitment Intelligence Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Root / health routes (always available) ───────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {"service": PROJECT_NAME, "version": "1.0.0", "docs": "/docs", "status": "running"}

@app.get("/health", tags=["Root"])
async def health():
    return {"status": "ok", "service": PROJECT_NAME, "version": "1.0.0"}

@app.get("/version", tags=["Root"])
async def version_info():
    return {"service": PROJECT_NAME, "version": "1.0.0"}

@app.get("/api/v1", tags=["Root"])
async def api_v1_root():
    return {"service": PROJECT_NAME, "version": "1.0.0", "status": "running"}

# ── Load all app routers (wrapped so a single bad import doesn't kill startup) -
_import_error: str | None = None

try:
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")
    print("[Startup] ✅ All routers loaded.")
except Exception as _exc:
    _import_error = traceback.format_exc()
    print(f"[Startup] ❌ Router import failed:\n{_import_error}")

# Debug endpoint — only active when router import failed
@app.get("/api/v1/debug-startup", tags=["Debug"])
async def debug_startup():
    if _import_error:
        return {"status": "router_import_failed", "error": _import_error}
    return {"status": "ok", "message": "All routers loaded successfully."}
