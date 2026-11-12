"""
CareerTrack BD — Database layer.
  • If MONGODB_URI is set  → yields a MongoItemRepository (production / Vercel)
  • Otherwise              → yields a SQLAlchemy Session  (local dev / SQLite)
"""

from __future__ import annotations
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# ── SQLAlchemy (SQLite / local dev) ──────────────────────────────────────────
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
except Exception:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Shared dependency ─────────────────────────────────────────────────────────
def get_db():
    """
    FastAPI dependency that returns either:
      • A MongoItemRepository  (when MONGODB_URI is configured)
      • A SQLAlchemy Session   (SQLite fallback for local dev)
    Routes use duck-typing — both objects expose the same interface.
    """
    mongodb_uri = os.getenv("MONGODB_URI") or getattr(settings, "MONGODB_URI", "")
    if mongodb_uri:
        from app.core.mongo import get_mongodb_database
        mongo_db = get_mongodb_database()
        if mongo_db is not None:
            from app.repositories.mongo_item_repository import MongoItemRepository
            yield MongoItemRepository(mongo_db)
            return

    # Fallback: SQLAlchemy / SQLite
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
