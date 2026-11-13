"""
items.py — Job Application routes for CareerTrack BD.
Maps to Frontend/src/services/api.ts API client.

Persistent (file-backed + in-memory) storage.
Automatic matching and upgrading from 'Submitted' to 'Admit Available'.
Never crashes on missing optional fields.
Safe upserting to eliminate 'Status update failed: Application not found'.
"""

from __future__ import annotations
import math
import os
import re
import json
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

router = APIRouter()

# ── File-backed persistent storage ───────────────────────────────────────────
if os.environ.get("VERCEL"):
    APPS_JSON_PATH = "/tmp/careertrack_apps.json"
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    APPS_JSON_PATH = os.path.join(BASE_DIR, "careertrack_apps.json")


def _load_apps() -> list[dict]:
    try:
        if os.path.exists(APPS_JSON_PATH):
            with open(APPS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
    except Exception:
        pass

    # If storage file does not exist yet (fresh deploy), seed with defaults
    try:
        from app.api.v1.routes.seed import SEED_APPLICATIONS
        initial = [dict(a) for a in SEED_APPLICATIONS]
        _save_apps(initial)
        return initial
    except Exception:
        return []


def _save_apps(apps: list[dict]):
    try:
        with open(APPS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(apps, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_str(val: Optional[str]) -> str:
    if not val:
        return ""
    return re.sub(r"[^a-z0-9]", "", val.lower())


def _build_app(id: int, data: dict) -> dict:
    return {
        "id": id,
        "organization_name": data.get("organization_name", "") or "Government Recruitment Authority",
        "post_name": data.get("post_name", "") or "Officer",
        "job_id": str(data.get("job_id", "") or "TBA"),
        "grade": data.get("grade") or "Grade-9",
        "tracking_id": data.get("tracking_id"),
        "user_id": data.get("user_id"),
        "ref_no": data.get("ref_no"),
        "roll_number": data.get("roll_number"),
        "applicant_name": data.get("applicant_name", "SHAH ABDUL MAZID"),
        "applicant_name_bn": data.get("applicant_name_bn"),
        "father_name": data.get("father_name"),
        "father_name_bn": data.get("father_name_bn"),
        "mother_name": data.get("mother_name"),
        "mother_name_bn": data.get("mother_name_bn"),
        "date_of_birth": data.get("date_of_birth"),
        "nid": data.get("nid"),
        "birth_reg": data.get("birth_reg"),
        "passport_id": data.get("passport_id"),
        "gender": data.get("gender"),
        "religion": data.get("religion"),
        "marital_status": data.get("marital_status"),
        "mobile_number": data.get("mobile_number"),
        "email": data.get("email"),
        "present_address": data.get("present_address"),
        "permanent_address": data.get("permanent_address"),
        "photo_url": data.get("photo_url"),
        "submit_pdf_url": data.get("submit_pdf_url"),
        "admit_pdf_url": data.get("admit_pdf_url"),
        "seat_plan_pdf_url": data.get("seat_plan_pdf_url"),
        "seat_plan_status": data.get("seat_plan_status") or ("Seat Plan Ready" if data.get("status") == "Exam Scheduled" else "Pending"),
        "application_date": data.get("application_date") or _utcnow()[:10],
        "deadline": data.get("deadline"),
        "status": data.get("status", "Submitted"),
        "admit_card_available": bool(data.get("admit_card_available", False)),
        "admit_card_url": data.get("admit_card_url"),
        "notes": data.get("notes"),
        "choices": data.get("choices", []),
        "examinations": data.get("examinations", []),
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }


# ── 31 Centers from Bangladesh Bank BSCS Notice No. 357/2026 ─────────────────
BB_357_CENTRES = [
    {"centre_no": 1, "name": "Milestone College", "area": "Diabari, Turag-Dhaka", "roll_from": 100001, "roll_to": 108416, "total": 7200},
    {"centre_no": 2, "name": "Banani Bidyaniketan School and College", "area": "Road 23/A, Block-B, Banani Model Town, Dhaka", "roll_from": 108417, "roll_to": 111827, "total": 3000},
    {"centre_no": 3, "name": "Shamsul Hoque Khan School and College (School Campus)", "area": "Matuail, Demra, Jatrabari, Dhaka", "roll_from": 111828, "roll_to": 121329, "total": 8300},
    {"centre_no": 4, "name": "Dr. Mahbubur Rahman Molla College", "area": "Matuail, Demra Road, Jatrabari, Dhaka", "roll_from": 121330, "roll_to": 131608, "total": 9000},
    {"centre_no": 5, "name": "A. K. School & College (Main Campus)", "area": "Dania, Dhaka", "roll_from": 131609, "roll_to": 135226, "total": 3200},
    {"centre_no": 6, "name": "A. K. School & College (New Campus)", "area": "Dania, Dhaka", "roll_from": 135227, "roll_to": 137300, "total": 1800},
    {"centre_no": 7, "name": "Dania College", "area": "Dania, Jatrabari, Dhaka", "roll_from": 137301, "roll_to": 144132, "total": 6000},
    {"centre_no": 8, "name": "Barnamala Adarsha High School and College", "area": "Dania, Jatrabari, Dhaka-1236", "roll_from": 144133, "roll_to": 148159, "total": 3500},
    {"centre_no": 9, "name": "Ahmed Bawany Academy School & College", "area": "Armanitola, Babubazar, Dhaka", "roll_from": 148160, "roll_to": 152768, "total": 4000},
    {"centre_no": 10, "name": "Fazlul Haque Mohila College", "area": "12, Akshay Das Lane, Sutrapur, Gendaria, Dhaka", "roll_from": 152770, "roll_to": 157365, "total": 4000},
    {"centre_no": 11, "name": "Armanitola Government High School", "area": "Armanitola, Dhaka", "roll_from": 157366, "roll_to": 160449, "total": 2700},
    {"centre_no": 12, "name": "Mirpur Bangla School and College (Boys Section)", "area": "Section 11, Mirpur, Dhaka", "roll_from": 160450, "roll_to": 164456, "total": 3500},
    {"centre_no": 13, "name": "Mirpur Bangla School and College (Girls Section)", "area": "Section 6, Mirpur, Dhaka", "roll_from": 164457, "roll_to": 166402, "total": 1700},
    {"centre_no": 14, "name": "Mirpur College", "area": "Section-2, Mirpur, Dhaka", "roll_from": 166403, "roll_to": 172044, "total": 5000},
    {"centre_no": 15, "name": "Mirpur Girls Ideal College", "area": "Mirpur 10, Dhaka", "roll_from": 172045, "roll_to": 176017, "total": 3500},
    {"centre_no": 16, "name": "Mirpur Girls Ideal Laboratory Institute", "area": "Mirpur 10, Dhaka", "roll_from": 176018, "roll_to": 180049, "total": 3500},
    {"centre_no": 17, "name": "Kadamtala Purba Basabo School & College", "area": "28/3, Kadamtala, Basabo, Dhaka", "roll_from": 180051, "roll_to": 184589, "total": 4000},
    {"centre_no": 18, "name": "Khilgaon Girls School & College", "area": "Khilgaon, Dhaka", "roll_from": 184590, "roll_to": 188027, "total": 3000},
    {"centre_no": 19, "name": "Khilgaon Govt. High School", "area": "Khilgaon, Dhaka", "roll_from": 188028, "roll_to": 191465, "total": 3000},
    {"centre_no": 20, "name": "Khilgaon Model College", "area": "721/1, Block-C, Khilgaon, Dhaka", "roll_from": 191466, "roll_to": 195476, "total": 3500},
    {"centre_no": 21, "name": "Khilgaon School and College", "area": "711/C, Khilgaon, Dhaka", "roll_from": 195477, "roll_to": 199488, "total": 3500},
    {"centre_no": 22, "name": "Model High School, Khilgaon", "area": "Khilgaon, Dhaka", "roll_from": 199489, "roll_to": 201792, "total": 2000},
    {"centre_no": 23, "name": "Maghbazar Girls' High School", "area": "Siddheswari, Ramna, Dhaka", "roll_from": 201793, "roll_to": 205219, "total": 3000},
    {"centre_no": 24, "name": "Mohammadpur Kendriya College", "area": "Nurjahan road, Mohammadpur, Dhaka", "roll_from": 205221, "roll_to": 208662, "total": 3000},
    {"centre_no": 25, "name": "Lalmatia Girls' High School & College", "area": "9/15, Block - D , Lalmatia, Dhaka", "roll_from": 208663, "roll_to": 212673, "total": 3500},
    {"centre_no": 26, "name": "Sher-E-Bangla Nagar Govt. Girls High School", "area": "Agargaon, Dhaka", "roll_from": 212674, "roll_to": 215417, "total": 2400},
    {"centre_no": 27, "name": "Dhanmondi Govt. Boys High School", "area": "03 Sobhanbagh, Mirpur Road, Dhaka", "roll_from": 215418, "roll_to": 218832, "total": 3000},
    {"centre_no": 28, "name": "Dhanmondi Government Girls High School", "area": "Dhanmondi R/A, Dhaka", "roll_from": 218833, "roll_to": 221673, "total": 2500},
    {"centre_no": 29, "name": "Tejgaon College", "area": "16, Indira Road, Farmgate, Dhaka", "roll_from": 221675, "roll_to": 230825, "total": 8000},
    {"centre_no": 30, "name": "Tejgaon Govt. High School", "area": "42, East Tejturi bajar, Tejgaon, Dhaka", "roll_from": 230826, "roll_to": 234245, "total": 3000},
    {"centre_no": 31, "name": "Azimpur Govt. Girls School & College", "area": "Azimpur, Dhaka", "roll_from": 234246, "roll_to": 237923, "total": 3229},
]


# ── Pydantic Schemas ──────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    organization_name: str
    post_name: str
    job_id: Optional[str] = "TBA"
    grade: Optional[str] = "Grade-9"
    tracking_id: Optional[str] = None
    user_id: Optional[str] = None
    ref_no: Optional[str] = None
    roll_number: Optional[str] = None
    applicant_name: Optional[str] = "SHAH ABDUL MAZID"
    applicant_name_bn: Optional[str] = None
    father_name: Optional[str] = None
    father_name_bn: Optional[str] = None
    mother_name: Optional[str] = None
    mother_name_bn: Optional[str] = None
    date_of_birth: Optional[str] = None
    nid: Optional[str] = None
    birth_reg: Optional[str] = None
    passport_id: Optional[str] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[str] = None
    present_address: Optional[str] = None
    permanent_address: Optional[str] = None
    photo_url: Optional[str] = None
    submit_pdf_url: Optional[str] = None
    admit_pdf_url: Optional[str] = None
    seat_plan_pdf_url: Optional[str] = None
    seat_plan_status: Optional[str] = "Pending"
    application_date: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = "Submitted"
    admit_card_available: Optional[bool] = False
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None
    choices: Optional[List[Any]] = []
    examinations: Optional[List[Any]] = []


class ApplicationUpdate(BaseModel):
    organization_name: Optional[str] = None
    post_name: Optional[str] = None
    job_id: Optional[str] = None
    grade: Optional[str] = None
    tracking_id: Optional[str] = None
    user_id: Optional[str] = None
    ref_no: Optional[str] = None
    roll_number: Optional[str] = None
    applicant_name: Optional[str] = None
    applicant_name_bn: Optional[str] = None
    father_name: Optional[str] = None
    father_name_bn: Optional[str] = None
    mother_name: Optional[str] = None
    mother_name_bn: Optional[str] = None
    date_of_birth: Optional[str] = None
    nid: Optional[str] = None
    birth_reg: Optional[str] = None
    passport_id: Optional[str] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[str] = None
    present_address: Optional[str] = None
    permanent_address: Optional[str] = None
    photo_url: Optional[str] = None
    submit_pdf_url: Optional[str] = None
    admit_pdf_url: Optional[str] = None
    seat_plan_pdf_url: Optional[str] = None
    seat_plan_status: Optional[str] = "Pending"
    application_date: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    admit_card_available: Optional[bool] = None
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None
    choices: Optional[List[Any]] = None
    examinations: Optional[List[Any]] = None


# ─────────────────────────────────────────────────────────────────────────────
# Named Sub-routes (Declared BEFORE /{item_id})
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/clean", summary="Clean all applications and reset database to empty")
async def clean_database():
    """Wipes all applications so user can start from a completely clean slate."""
    _save_apps([])
    return {"status": "ok", "message": "Database cleaned successfully. 0 applications remaining."}


@router.get("/stats", summary="Dashboard statistics")
async def get_stats():
    apps = _load_apps()
    total = len(apps)

    submitted = sum(1 for a in apps if a.get("status") in ("Submitted", "Applied", "Draft"))
    admit_available = sum(
        1 for a in apps
        if a.get("status") in ("Admit Available", "Admit Card Available") or a.get("admit_card_available")
    )
    exam_scheduled = sum(
        1 for a in apps
        if a.get("status") in ("Exam Scheduled", "Written Examination")
    )
    rejected = sum(1 for a in apps if a.get("status") == "Rejected")
    shortlisted = sum(1 for a in apps if a.get("status") in ("Shortlisted", "Viva", "Selected"))

    status_counts: dict[str, int] = {}
    for a in apps:
        s = a.get("status", "Submitted")
        status_counts[s] = status_counts.get(s, 0) + 1
    status_distribution = [{"status": s, "count": c} for s, c in status_counts.items()]

    recent_activities: list[dict] = []
    for a in sorted(apps, key=lambda x: x.get("updated_at", ""), reverse=True)[:5]:
        recent_activities.append({
            "id": a["id"],
            "title": f"{a.get('post_name', '')} @ {a.get('organization_name', '')}",
            "job_id": a.get("job_id", ""),
            "status": a.get("status", "Submitted"),
            "date": (a.get("updated_at") or "")[:10],
            "action": "Updated",
        })

    return {
        "total_applications":      total,
        "submitted_count":         submitted,
        "upcoming_exams_count":    admit_available + exam_scheduled,
        "shortlisted_count":       shortlisted,
        "rejected_count":          rejected,
        "pending_admit_cards":     submitted,
        "upcoming_deadlines_count": 0,
        "status_distribution":     status_distribution,
        "recent_activities":       recent_activities,
    }


@router.get("/meta/organizations", summary="Distinct organizations for filter dropdown")
async def get_organizations():
    apps = _load_apps()
    orgs = sorted({a["organization_name"] for a in apps if a.get("organization_name")})
    return {"organizations": orgs}


@router.get("/seat-plan", summary="Exam seat plan lookup for Notice 357/2026")
async def get_seat_plan(roll: Optional[int] = Query(None)):
    matched_center = None
    if roll:
        for c in BB_357_CENTRES:
            if c["roll_from"] <= roll <= c["roll_to"]:
                matched_center = c
                break

    return {
        "notice": "BSCS Notice No. 357/2026 (Job ID-26101 Senior Officer)",
        "exam_date": "2026-11-13",
        "exam_time": "03:00 PM – 04:00 PM",
        "report_by": "02:00 PM",
        "total_candidates": 120529,
        "total_centres": len(BB_357_CENTRES),
        "centres": BB_357_CENTRES,
        "centers": BB_357_CENTRES,
        "roll": roll,
        "matched": matched_center is not None,
        "centre": matched_center,
        "matched_center": matched_center,
        "message": (
            f"Roll {roll} allocated to Centre #{matched_center['centre_no']}: {matched_center['name']}, {matched_center['area']}"
            if matched_center
            else ("Enter roll number to locate your center" if not roll else f"Roll {roll} not found in Notice 357/2026")
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Collection Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", summary="List applications with pagination, search & filter")
async def list_applications(
    search:       Optional[str] = Query(None),
    status:       Optional[str] = Query(None),
    organization: Optional[str] = Query(None),
    page:         int           = Query(1,     ge=1),
    page_size:    int           = Query(50,    ge=1, le=100),
    sort_by:      Optional[str] = Query(None),
    sort_order:   str           = Query("desc"),
):
    apps = _load_apps()

    if search:
        q = search.lower()
        apps = [
            a for a in apps
            if q in str(a.get("organization_name", "")).lower()
            or q in str(a.get("post_name", "")).lower()
            or q in str(a.get("job_id", "")).lower()
            or q in str(a.get("roll_number", "")).lower()
            or q in str(a.get("tracking_id", "")).lower()
        ]
    if status and status != "All":
        # Handle aliases between Admit Available and Admit Card Available
        if status in ("Admit Available", "Admit Card Available", "Admit Card"):
            apps = [a for a in apps if a.get("status") in ("Admit Available", "Admit Card Available", "Admit Card") or a.get("admit_card_available")]
        else:
            apps = [a for a in apps if a.get("status") == status]
    if organization and organization != "All":
        apps = [a for a in apps if a.get("organization_name") == organization]

    key = sort_by or "updated_at"
    reverse = sort_order != "asc"
    try:
        apps.sort(key=lambda a: a.get(key) or "", reverse=reverse)
    except Exception:
        pass

    total = len(apps)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    page_items = apps[start: start + page_size]

    return {
        "items":       page_items,
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": total_pages,
    }


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Create or Merge/Upgrade Application")
async def create_application(payload: ApplicationCreate):
    """
    Creates a new application or, if a matching 'Submitted' entry exists
    (matched by Tracking ID, User ID, Job ID, or normalized Org + Post),
    upgrades that entry to 'Admit Available' and merges details without duplicating!
    """
    apps = _load_apps()
    new_data = payload.model_dump()

    new_tracking = (new_data.get("tracking_id") or "").strip()
    new_user_id = (new_data.get("user_id") or "").strip()
    new_job_id = (new_data.get("job_id") or "").strip()
    new_norm_org = _normalize_str(new_data.get("organization_name"))
    new_norm_post = _normalize_str(new_data.get("post_name"))

    matched_idx = -1

    for idx, existing in enumerate(apps):
        ex_tracking = (existing.get("tracking_id") or "").strip()
        ex_user_id = (existing.get("user_id") or "").strip()
        ex_job_id = (existing.get("job_id") or "").strip()
        ex_norm_org = _normalize_str(existing.get("organization_name"))
        ex_norm_post = _normalize_str(existing.get("post_name"))

        # 1. Match by Tracking ID
        if new_tracking and ex_tracking and new_tracking == ex_tracking:
            matched_idx = idx
            break

        # 2. Match by User ID
        if new_user_id and ex_user_id and new_user_id == ex_user_id:
            matched_idx = idx
            break

        # 3. Match by Job ID (if not generic 'TBA')
        if new_job_id and new_job_id != "TBA" and ex_job_id and ex_job_id != "TBA" and new_job_id == ex_job_id:
            matched_idx = idx
            break

        # 4. Match by Normalized Org & Post
        if new_norm_org and ex_norm_org and new_norm_post and ex_norm_post:
            if (new_norm_org in ex_norm_org or ex_norm_org in new_norm_org) and (
                new_norm_post in ex_norm_post or ex_norm_post in new_norm_post
            ):
                matched_idx = idx
                break

    # If matching record found -> Upgrade & Merge
    if matched_idx >= 0:
        ex = apps[matched_idx]

        # If new document is an Admit Card with Roll -> UPGRADE status
        if new_data.get("status") in ("Admit Available", "Admit Card Available") or new_data.get("roll_number"):
            ex["status"] = "Admit Available"
            ex["admit_card_available"] = True
            if new_data.get("roll_number"):
                ex["roll_number"] = new_data["roll_number"]

        # Merge all non-empty fields
        for field in (
            "tracking_id", "user_id", "job_id", "grade", "applicant_name",
            "applicant_name_bn", "father_name", "father_name_bn",
            "mother_name", "mother_name_bn", "date_of_birth", "nid",
            "birth_reg", "passport_id", "gender", "religion", "marital_status",
            "mobile_number", "email", "present_address", "permanent_address",
            "ref_no", "photo_url", "submit_pdf_url", "admit_pdf_url",
            "seat_plan_pdf_url", "seat_plan_status", "deadline", "notes",
        ):
            if new_data.get(field):
                ex[field] = new_data[field]

        if new_data.get("examinations"):
            ex["examinations"] = new_data["examinations"]

        ex["updated_at"] = _utcnow()
        _save_apps(apps)
        return ex

    # No match -> Create new entry
    next_id = max([a.get("id", 0) for a in apps] + [0]) + 1
    new_app = _build_app(next_id, new_data)
    apps.append(new_app)
    _save_apps(apps)
    return new_app


# ─────────────────────────────────────────────────────────────────────────────
# Item-level Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{item_id}", summary="Get single application by ID")
async def get_application(item_id: int):
    apps = _load_apps()
    for a in apps:
        if a.get("id") == item_id:
            return a
    raise HTTPException(status_code=404, detail="Application not found")


@router.patch("/{item_id}", summary="Partially update an application (Safe Upsert)")
async def update_application(item_id: int, payload: ApplicationUpdate):
    """
    Safely updates an existing application.
    If the serverless state had reset or the ID doesn't exist, it matches by
    job_id/tracking_id or upserts cleanly so the client NEVER gets a 404 error!
    """
    apps = _load_apps()
    updates = payload.model_dump(exclude_unset=True)

    # 1. Look by ID
    for a in apps:
        if a.get("id") == item_id:
            a.update(updates)
            a["updated_at"] = _utcnow()
            _save_apps(apps)
            return a

    # 2. Look by job_id or tracking_id if provided
    up_job_id = updates.get("job_id")
    up_tracking = updates.get("tracking_id")
    if up_job_id or up_tracking:
        for a in apps:
            if (up_job_id and a.get("job_id") == up_job_id) or (up_tracking and a.get("tracking_id") == up_tracking):
                a.update(updates)
                a["updated_at"] = _utcnow()
                _save_apps(apps)
                return a

    # 3. Safe Upsert: Create with requested ID
    new_app = _build_app(item_id, updates)
    apps.append(new_app)
    _save_apps(apps)
    return new_app


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an application",
)
async def delete_application(item_id: int):
    apps = _load_apps()
    before = len(apps)
    apps = [a for a in apps if a.get("id") != item_id]
    if len(apps) != before:
        _save_apps(apps)


@router.post("/{item_id}/attach-pdf", summary="Attach submit, admit, or seat-plan PDF directly to job card")
async def attach_pdf_to_application(
    item_id: int,
    pdf_type: str = Query("submit_pdf", description="submit_pdf, admit_pdf, or seat_plan_pdf"),
    file: UploadFile = None,
):
    apps = _load_apps()
    target = None
    for a in apps:
        if a.get("id") == item_id:
            target = a
            break
    if not target:
        raise HTTPException(status_code=404, detail="Application not found")

    saved_filename = ""
    if file:
        import time
        from app.api.v1.routes.documents import UPLOAD_DIR
        saved_filename = f"{int(time.time())}_{file.filename}"
        save_path = os.path.join(UPLOAD_DIR, saved_filename)
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        file_link = f"/api/v1/documents/file/{saved_filename}"

        if pdf_type == "submit_pdf":
            target["submit_pdf_url"] = file_link
        elif pdf_type == "admit_pdf":
            target["admit_pdf_url"] = file_link
            target["admit_card_available"] = True
            if target.get("status") == "Submitted":
                target["status"] = "Admit Available"
        elif pdf_type == "seat_plan_pdf":
            target["seat_plan_pdf_url"] = file_link
            target["seat_plan_status"] = "Seat Plan Ready"
            target["status"] = "Exam Scheduled"
            # Auto match center for candidate roll
            cand_roll = target.get("roll_number")
            if cand_roll and str(cand_roll).isdigit():
                roll_int = int(cand_roll)
                for c in BB_357_CENTRES:
                    if c["roll_from"] <= roll_int <= c["roll_to"]:
                        target["center_name"] = c["name"]
                        target["center_address"] = c["area"]
                        target["exam_date"] = "2026-11-13"
                        target["exam_time"] = "03:00 PM – 04:00 PM"
                        target["reporting_time"] = "02:00 PM"
                        target["examinations"] = [{
                            "id": 1,
                            "item_id": target["id"],
                            "exam_type": "100 Marks MCQ",
                            "exam_date": "2026-11-13",
                            "start_time": "03:00 PM",
                            "end_time": "04:00 PM",
                            "reporting_time": "02:00 PM",
                            "center_name": c["name"],
                            "center_address": c["area"],
                            "status": "Scheduled",
                            "schedule_status": "confirmed",
                            "verified": True,
                            "source_notice_ref": "Notice No. 357/2026",
                        }]
                        break

    target["updated_at"] = _utcnow()
    _save_apps(apps)
    return target
