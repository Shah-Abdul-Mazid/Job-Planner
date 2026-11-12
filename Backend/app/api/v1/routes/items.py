"""
items.py — Job Application routes for CareerTrack BD.
Maps to Frontend/src/services/api.ts API client.

Route order matters: named routes MUST come before /{item_id}.
"""

from __future__ import annotations
import math
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

router = APIRouter()

# ── In-memory store (Vercel is stateless — resets per cold-start) ─────────────
_applications: list[dict] = []
_next_id = 1


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build(id: int, data: dict) -> dict:
    return {
        "id": id,
        "organization_name": data.get("organization_name", ""),
        "post_name": data.get("post_name", ""),
        "job_id": data.get("job_id", ""),
        "grade": data.get("grade"),
        "tracking_id": data.get("tracking_id"),
        "roll_number": data.get("roll_number"),
        "application_date": data.get("application_date"),
        "deadline": data.get("deadline"),
        "status": data.get("status", "Applied"),
        "admit_card_available": bool(data.get("admit_card_available", False)),
        "admit_card_url": data.get("admit_card_url"),
        "notes": data.get("notes"),
        "choices": data.get("choices", []),
        "examinations": data.get("examinations", []),
        "created_at": _now(),
        "updated_at": _now(),
    }


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    organization_name: str
    post_name: str
    job_id: str
    grade: Optional[str] = None
    tracking_id: Optional[str] = None
    roll_number: Optional[str] = None
    application_date: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = "Applied"
    admit_card_available: Optional[bool] = False
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None
    choices: Optional[list[Any]] = []


class ApplicationUpdate(BaseModel):
    organization_name: Optional[str] = None
    post_name: Optional[str] = None
    job_id: Optional[str] = None
    grade: Optional[str] = None
    tracking_id: Optional[str] = None
    roll_number: Optional[str] = None
    application_date: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    admit_card_available: Optional[bool] = None
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None
    choices: Optional[list[Any]] = None


# ─────────────────────────────────────────────────────────────────────────────
# Named sub-routes — ALL must be declared BEFORE /{item_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/stats", summary="Dashboard statistics")
async def get_stats():
    """
    Returns dashboard statistics used by App.tsx health-check and Dashboard page.
    Matches the DashboardStats TypeScript interface:
      total_applications, submitted_count, upcoming_exams_count, shortlisted_count,
      rejected_count, pending_admit_cards, upcoming_deadlines_count,
      status_distribution, recent_activities
    """
    apps = _applications
    total = len(apps)
    submitted   = sum(1 for a in apps if a["status"] in ("Submitted", "Applied", "Draft"))
    shortlisted = sum(1 for a in apps if a["status"] == "Shortlisted")
    rejected    = sum(1 for a in apps if a["status"] == "Rejected")
    pending_admit = sum(
        1 for a in apps
        if not a["admit_card_available"] and a["status"] not in ("Draft", "Rejected")
    )
    exam_scheduled = sum(
        1 for a in apps
        if a["status"] in ("Exam Scheduled", "Written Examination", "Admit Card Available")
    )

    # Count per status for chart
    status_counts: dict[str, int] = {}
    for a in apps:
        s = a["status"]
        status_counts[s] = status_counts.get(s, 0) + 1
    status_distribution = [{"status": s, "count": c} for s, c in status_counts.items()]

    # Last 5 updated
    recent_activities = []
    for a in sorted(apps, key=lambda x: x["updated_at"], reverse=True)[:5]:
        recent_activities.append({
            "id": a["id"],
            "title": f"{a['post_name']} @ {a['organization_name']}",
            "job_id": a["job_id"],
            "status": a["status"],
            "date": a["updated_at"][:10],
            "action": "Updated",
        })

    return {
        "total_applications":    total,
        "submitted_count":       submitted,
        "upcoming_exams_count":  exam_scheduled,
        "shortlisted_count":     shortlisted,
        "rejected_count":        rejected,
        "pending_admit_cards":   pending_admit,
        "upcoming_deadlines_count": 0,
        "status_distribution":   status_distribution,
        "recent_activities":     recent_activities,
    }


@router.get("/meta/organizations", summary="Distinct organizations for filter dropdown")
async def get_organizations():
    orgs = sorted({a["organization_name"] for a in _applications if a["organization_name"]})
    return {"organizations": orgs}


@router.get("/seat-plan", summary="Exam seat plan stub")
async def get_seat_plan(roll: Optional[int] = Query(None)):
    return {
        "exam_date": None,
        "exam_time": None,
        "report_by": None,
        "total_candidates": 0,
        "total_centres": 0,
        "notice": None,
        "centres": [],
        "centers": [],
        "roll": roll,
        "matched": False,
        "centre": None,
        "matched_center": None,
        "message": "No seat plan data available yet",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Collection endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", summary="List applications with pagination and filtering")
async def list_applications(
    search:       Optional[str] = Query(None),
    status:       Optional[str] = Query(None),
    organization: Optional[str] = Query(None),
    page:         int           = Query(1,  ge=1),
    page_size:    int           = Query(20, ge=1, le=100),
    sort_by:      Optional[str] = Query(None),
    sort_order:   str           = Query("desc"),
):
    apps = list(_applications)

    if search:
        q = search.lower()
        apps = [
            a for a in apps
            if q in a["organization_name"].lower()
            or q in a["post_name"].lower()
            or q in (a["job_id"] or "").lower()
        ]
    if status and status != "All":
        apps = [a for a in apps if a["status"] == status]
    if organization and organization != "All":
        apps = [a for a in apps if a["organization_name"] == organization]

    key     = sort_by or "updated_at"
    reverse = sort_order != "asc"
    try:
        apps.sort(key=lambda a: a.get(key) or "", reverse=reverse)
    except Exception:
        pass

    total       = len(apps)
    total_pages = max(1, math.ceil(total / page_size))
    start       = (page - 1) * page_size
    page_items  = apps[start: start + page_size]

    return {
        "items":       page_items,
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": total_pages,
    }


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Create application")
async def create_application(payload: ApplicationCreate):
    global _next_id
    app = _build(_next_id, payload.model_dump())
    _applications.append(app)
    _next_id += 1
    return app


# ─────────────────────────────────────────────────────────────────────────────
# Item-level endpoints — MUST come after all named routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{item_id}", summary="Get single application")
async def get_application(item_id: int):
    for a in _applications:
        if a["id"] == item_id:
            return a
    raise HTTPException(status_code=404, detail="Application not found")


@router.patch("/{item_id}", summary="Update application")
async def update_application(item_id: int, payload: ApplicationUpdate):
    for a in _applications:
        if a["id"] == item_id:
            updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
            a.update(updates)
            a["updated_at"] = _now()
            return a
    raise HTTPException(status_code=404, detail="Application not found")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete application")
async def delete_application(item_id: int):
    global _applications
    before = len(_applications)
    _applications = [a for a in _applications if a["id"] != item_id]
    if len(_applications) == before:
        raise HTTPException(status_code=404, detail="Application not found")
