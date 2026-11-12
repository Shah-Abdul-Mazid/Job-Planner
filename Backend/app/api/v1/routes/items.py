"""
Full CRUD routes for Job Applications (Items).
Endpoints mirror fastapi-struct 'all' template naming: /items
The frontend proxy maps /api → http://localhost:8000
"""

from __future__ import annotations
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.item import (
    ItemCreate, ItemUpdate, ItemResponse,
    ItemListResponse, DashboardStatsResponse,
)
from app.services.item_service import ItemService

router = APIRouter()

# ── Seat plan data (BSCS Notice No. 348/2026 — 31 centres) ───────────────────
SEAT_PLAN_CENTRES = [
    {"centre_no": 1,  "name": "Milestone College",                                   "area": "Diabari, Turag-Dhaka",         "roll_from": 100001, "roll_to": 108416, "total": 7200},
    {"centre_no": 2,  "name": "Ideal School & College",                              "area": "Motijheel, Dhaka",             "roll_from": 108417, "roll_to": 112000, "total": 3584},
    {"centre_no": 3,  "name": "Shamsul Hoque Khan School & College",                 "area": "Matuail, Demra Road, Jatrabari, Dhaka", "roll_from": 112001, "roll_to": 118000, "total": 6000},
    {"centre_no": 4,  "name": "Dhaka College",                                       "area": "Mirpur Road, New Market, Dhaka","roll_from": 118001, "roll_to": 123000, "total": 5000},
    {"centre_no": 5,  "name": "BIAM Foundation",                                     "area": "Dhanmondi, Dhaka",             "roll_from": 123001, "roll_to": 128000, "total": 5000},
    {"centre_no": 6,  "name": "Govt. Bangla College",                                "area": "Mirpur, Dhaka",                "roll_from": 128001, "roll_to": 133000, "total": 5000},
    {"centre_no": 7,  "name": "Tejgaon College",                                     "area": "Tejgaon, Dhaka",               "roll_from": 133001, "roll_to": 137000, "total": 4000},
    {"centre_no": 8,  "name": "Dhaka City College",                                  "area": "Science Laboratory, Dhaka",    "roll_from": 137001, "roll_to": 141000, "total": 4000},
    {"centre_no": 9,  "name": "Eden Mohila College",                                 "area": "Azimpur, Dhaka",               "roll_from": 141001, "roll_to": 145000, "total": 4000},
    {"centre_no": 10, "name": "Dhaka Commerce College",                              "area": "Mirpur, Dhaka",                "roll_from": 145001, "roll_to": 148500, "total": 3500},
    {"centre_no": 11, "name": "Viqarunnisa Noon School & College",                   "area": "Bailey Road, Dhaka",           "roll_from": 148501, "roll_to": 151500, "total": 3000},
    {"centre_no": 12, "name": "Motijheel Govt. Boys' High School",                   "area": "Motijheel, Dhaka",             "roll_from": 151501, "roll_to": 154000, "total": 2500},
    {"centre_no": 13, "name": "Govt. Laboratory High School",                        "area": "Dhanmondi, Dhaka",             "roll_from": 154001, "roll_to": 156500, "total": 2500},
    {"centre_no": 14, "name": "Rajuk Uttara Model College",                          "area": "Uttara, Dhaka",                "roll_from": 156501, "roll_to": 159000, "total": 2500},
    {"centre_no": 15, "name": "Adamjee Cantonment College",                          "area": "Dhaka Cantonment, Dhaka",      "roll_from": 159001, "roll_to": 161500, "total": 2500},
    {"centre_no": 16, "name": "Govt. Science College",                               "area": "Tejgaon, Dhaka",               "roll_from": 161501, "roll_to": 163500, "total": 2000},
    {"centre_no": 17, "name": "BAF Shaheen College Dhaka",                           "area": "Tejgaon, Dhaka",               "roll_from": 163501, "roll_to": 165500, "total": 2000},
    {"centre_no": 18, "name": "Shaheed Police Smrity College",                       "area": "Mirpur, Dhaka",                "roll_from": 165501, "roll_to": 167500, "total": 2000},
    {"centre_no": 19, "name": "Mohammadpur Kendriya Uchcha Bidyalaya & College",     "area": "Mohammadpur, Dhaka",           "roll_from": 167501, "roll_to": 169500, "total": 2000},
    {"centre_no": 20, "name": "Dhanmondi Govt. Boys High School",                    "area": "Dhanmondi, Dhaka",             "roll_from": 169501, "roll_to": 171500, "total": 2000},
    {"centre_no": 21, "name": "Govt. Mohila College, Dhaka",                         "area": "Azimpur, Dhaka",               "roll_from": 171501, "roll_to": 173000, "total": 1500},
    {"centre_no": 22, "name": "Dhaka Residential Model College",                     "area": "Mohammadpur, Dhaka",           "roll_from": 173001, "roll_to": 174500, "total": 1500},
    {"centre_no": 23, "name": "Siddhirganj Model College",                           "area": "Narayanganj",                  "roll_from": 174501, "roll_to": 176000, "total": 1500},
    {"centre_no": 24, "name": "Narsingdi Govt. College",                             "area": "Narsingdi",                    "roll_from": 176001, "roll_to": 177500, "total": 1500},
    {"centre_no": 25, "name": "Gazipur Cantonment College",                          "area": "Gazipur",                      "roll_from": 177501, "roll_to": 179000, "total": 1500},
    {"centre_no": 26, "name": "Gazipur City Corporation College",                    "area": "Gazipur",                      "roll_from": 179001, "roll_to": 180500, "total": 1500},
    {"centre_no": 27, "name": "Manikganj Govt. High School",                         "area": "Manikganj",                    "roll_from": 180501, "roll_to": 181500, "total": 1000},
    {"centre_no": 28, "name": "Munshiganj Govt. High School",                        "area": "Munshiganj",                   "roll_from": 181501, "roll_to": 182500, "total": 1000},
    {"centre_no": 29, "name": "Narayanganj Govt. High School",                       "area": "Narayanganj",                  "roll_from": 182501, "roll_to": 183500, "total": 1000},
    {"centre_no": 30, "name": "Chittagong Collegiate School & College",              "area": "Chittagong",                   "roll_from": 183501, "roll_to": 185000, "total": 1500},
    {"centre_no": 31, "name": "Khulna Govt. Collegiate School",                      "area": "Khulna",                       "roll_from": 185001, "roll_to": 186529, "total": 1529},
]


# ── Dashboard ─────────────────────────────────────────────────────────────────
@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Dashboard statistics",
)
def get_stats(db: Session = Depends(get_db)):
    svc = ItemService(db)
    return svc.get_dashboard_metrics()


# ── Seat plan ─────────────────────────────────────────────────────────────────
@router.get(
    "/seat-plan",
    summary="Get Combined 9 Banks Senior Officer 2026 exam centre list (BSCS Notice 348/2026)",
)
def get_seat_plan(roll: Optional[int] = Query(None, description="Roll number to look up your centre")):
    matched_centre = None
    if roll is not None:
        for centre in SEAT_PLAN_CENTRES:
            if centre["roll_from"] <= roll <= centre["roll_to"]:
                matched_centre = centre
                break

    return {
        "roll": roll,
        "matched": matched_centre is not None,
        "centre": matched_centre,
        "message": None if matched_centre else (f"No centre found matching roll number {roll}." if roll is not None else None),
        "exam_date": "2026-11-13",
        "exam_time": "15:00 – 16:00",
        "report_by": "14:00",
        "total_candidates": 120529,
        "total_centres": len(SEAT_PLAN_CENTRES),
        "notice": "BSCS Notice No. 348/2026",
        "centres": SEAT_PLAN_CENTRES,
    }


# ── Meta: distinct organisations ──────────────────────────────────────────────
@router.get(
    "/meta/organizations",
    summary="Get distinct organisation names (for filter dropdowns)",
)
def get_organizations(db: Session = Depends(get_db)):
    svc = ItemService(db)
    items, _ = svc.list_items(page=1, page_size=200)
    orgs = sorted({i.organization_name for i in items})
    return {"organizations": orgs}


# ── List / Create ─────────────────────────────────────────────────────────────
@router.get("", response_model=ItemListResponse, summary="List all job applications")
def list_items(
    search: Optional[str] = None,
    status: Optional[str] = None,
    organization: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    svc = ItemService(db)
    items, total = svc.list_items(
        search=search, status=status, organization=organization,
        start_date=start_date, end_date=end_date,
        page=page, page_size=page_size,
        sort_by=sort_by, sort_order=sort_order,
    )
    total_pages = max(1, -(-total // page_size))  # ceiling division
    return ItemListResponse(
        items=items, total=total, page=page,
        page_size=page_size, total_pages=total_pages,
    )


@router.post(
    "",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job application",
)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    svc = ItemService(db)
    return svc.create_item(payload)


# ── Get / Update / Delete single item ────────────────────────────────────────
@router.get("/{item_id}", response_model=ItemResponse, summary="Get a single application by ID")
def get_item(item_id: int, db: Session = Depends(get_db)):
    svc = ItemService(db)
    return svc.get_item(item_id)


@router.patch("/{item_id}", response_model=ItemResponse, summary="Partially update an application")
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    svc = ItemService(db)
    return svc.update_item(item_id, payload)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an application")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    svc = ItemService(db)
    svc.delete_item(item_id)
