"""
health.py — Health & readiness probe endpoint.
GET /api/v1/health
"""
import platform
import sys
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get("", summary="Health & readiness probe")
async def health():
    return {
        "status": "ok",
        "service": "CareerTrack BD API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "python": sys.version,
        "platform": platform.system(),
        "device": "cpu",
    }
