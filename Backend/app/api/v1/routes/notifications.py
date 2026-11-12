"""
Notifications routes — in-memory stub for CareerTrack BD.
Frontend calls GET /api/v1/notifications (with .catch(() => []) guard).
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_notifications: list[dict] = [
    {
        "id": 1,
        "notification_type": "exam_reminder",
        "title": "Exam Today — Combined 9 Banks Senior Officer",
        "message": "Your exam is today (13 Nov 2026). Report by 2:30 PM at Shamsul Hoque Khan School & College.",
        "target_date": "2026-11-13",
        "is_read": False,
        "created_at": "2026-11-13T08:00:00+06:00",
    },
    {
        "id": 2,
        "notification_type": "admit_card",
        "title": "Admit Card Available",
        "message": "Your admit card for BHTPA Assistant Programmer is now available.",
        "target_date": None,
        "is_read": False,
        "created_at": "2026-11-12T10:00:00+06:00",
    },
]
_notif_next_id = 3


@router.get("", summary="List notifications")
async def list_notifications():
    return sorted(_notifications, key=lambda n: n["created_at"], reverse=True)


@router.patch("/{notif_id}/read", summary="Mark notification as read")
async def mark_read(notif_id: int):
    for n in _notifications:
        if n["id"] == notif_id:
            n["is_read"] = True
            return n
    return {"id": notif_id, "is_read": True}
