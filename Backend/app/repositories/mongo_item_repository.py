"""
CareerTrack BD — MongoDB Item Repository.
Mirrors ItemRepository interface but reads/writes to MongoDB Atlas.
Used when MONGODB_URI is set (i.e. in production on Vercel).
"""

from __future__ import annotations
from typing import Optional, List, Tuple, Dict, Any
from datetime import date, datetime, timedelta
from bson import ObjectId
import re


def _to_dict(doc: dict) -> dict:
    """Normalize a MongoDB document to a plain dict (convert _id, dates, etc.)."""
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
    return d


def _item_matches_search(doc: dict, search: str) -> bool:
    s = search.lower()
    for field in ("organization_name", "post_name", "job_id", "tracking_id", "roll_number"):
        val = str(doc.get(field, "")).lower()
        if s in val:
            return True
    return False


class MongoItemRepository:
    """
    Repository that talks directly to MongoDB Atlas.
    Returns plain dicts (not SQLAlchemy ORM objects) — the route layer
    converts them to Pydantic schemas just the same.
    """

    def __init__(self, db):
        self.db = db
        self.col = db["items"]
        self.exam_col = db["examinations"]

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _next_id(self) -> int:
        """Generate next integer id (max existing + 1)."""
        docs = list(self.col.find({}, {"id": 1}))
        if not docs:
            return 1
        return max(d.get("id", 0) for d in docs) + 1

    def _get_examinations_for_item(self, item_id: int) -> list:
        exams = list(self.exam_col.find({"item_id": item_id}))
        result = []
        for e in exams:
            ed = _to_dict(e)
            # Convert datetime fields to ISO strings for JSON
            for f in ("exam_date", "created_at", "updated_at"):
                if isinstance(ed.get(f), datetime):
                    ed[f] = ed[f].isoformat()
            result.append(ed)
        return result

    def _doc_to_item_like(self, doc: dict) -> dict:
        """
        Convert a raw MongoDB doc to an object-like dict that the
        Pydantic ItemResponse schema can consume.
        Adds `choices` and `examinations` sub-lists.
        """
        d = _to_dict(doc)
        # Normalize date fields (may be stored as string or datetime)
        for f in ("application_date", "deadline"):
            v = d.get(f)
            if isinstance(v, datetime):
                d[f] = v.date().isoformat()
            elif v is not None:
                d[f] = str(v)
        for f in ("created_at", "updated_at"):
            v = d.get(f)
            if isinstance(v, datetime):
                d[f] = v.isoformat()
        # Attach related data
        d["choices"] = d.get("choices", [])
        d["examinations"] = self._get_examinations_for_item(d.get("id", 0))
        return d

    # ── Public API (mirrors ItemRepository) ──────────────────────────────────

    def get_by_id(self, item_id: int) -> Optional[dict]:
        doc = self.col.find_one({"id": item_id})
        if doc is None:
            return None
        return self._doc_to_item_like(doc)

    def get_multi(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        organization: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 15,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[dict], int]:
        mongo_filter: Dict[str, Any] = {}

        if status and status != "All":
            mongo_filter["status"] = status

        if organization and organization != "All":
            mongo_filter["organization_name"] = organization

        if search:
            mongo_filter["$or"] = [
                {"organization_name": {"$regex": search, "$options": "i"}},
                {"post_name": {"$regex": search, "$options": "i"}},
                {"job_id": {"$regex": search, "$options": "i"}},
                {"tracking_id": {"$regex": search, "$options": "i"}},
                {"roll_number": {"$regex": search, "$options": "i"}},
            ]

        # Date range filters
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date.isoformat()
        if end_date:
            date_filter["$lte"] = end_date.isoformat()
        if date_filter:
            mongo_filter["application_date"] = date_filter

        try:
            total = self.col.count_documents(mongo_filter)
            direction = -1 if sort_order.lower() == "desc" else 1
            cursor = (
                self.col.find(mongo_filter)
                .sort(sort_by, direction)
                .skip(skip)
                .limit(limit)
            )
            items = [self._doc_to_item_like(doc) for doc in cursor]
            return items, total
        except Exception as e:
            print(f"[MongoItemRepository] List items error: {e}")
            return [], 0

    def create(self, item_data: dict, choices: List[str]) -> dict:
        new_id = self._next_id()
        now = datetime.utcnow()
        doc = {
            **item_data,
            "id": new_id,
            "choices": [
                {"preference_order": i + 1, "choice_organization": c}
                for i, c in enumerate(choices)
            ],
            "created_at": now,
            "updated_at": now,
        }
        self.col.insert_one(doc)
        return self._doc_to_item_like(doc)

    def update(self, db_item: dict, update_data: dict, choices: Optional[List[str]] = None) -> dict:
        item_id = db_item["id"]
        update_doc: Dict[str, Any] = {**update_data, "updated_at": datetime.utcnow()}
        if choices is not None:
            update_doc["choices"] = [
                {"preference_order": i + 1, "choice_organization": c}
                for i, c in enumerate(choices)
            ]
        self.col.update_one({"id": item_id}, {"$set": update_doc})
        updated = self.col.find_one({"id": item_id})
        return self._doc_to_item_like(updated)

    def delete(self, db_item: dict) -> None:
        self.col.delete_one({"id": db_item["id"]})

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        try:
            total_applications = self.col.count_documents({})
            submitted_count = self.col.count_documents({"status": {"$in": ["Submitted", "Applied"]}})
            shortlisted_count = self.col.count_documents({"status": "Shortlisted"})
            rejected_count = self.col.count_documents({"status": "Rejected"})
            pending_admit_cards = self.col.count_documents({"admit_card_available": {"$in": [False, None]}})

            today = date.today().isoformat()
            thirty_days = (date.today() + timedelta(days=30)).isoformat()
            upcoming_deadlines_count = self.col.count_documents({
                "deadline": {"$gte": today, "$lte": thirty_days}
            })

            now = datetime.utcnow()
            upcoming_exams_count = self.exam_col.count_documents({"exam_date": {"$gte": now}})

            # Status distribution
            pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
            status_distribution = [
                {"status": r["_id"], "count": r["count"]}
                for r in self.col.aggregate(pipeline)
            ]

            # Recent activities
            recent_docs = list(
                self.col.find({}).sort("updated_at", -1).limit(5)
            )
            recent_activities = []
            for a in recent_docs:
                updated_at = a.get("updated_at")
                created_at = a.get("created_at")
                if isinstance(updated_at, datetime):
                    date_str = updated_at.isoformat()
                else:
                    date_str = datetime.utcnow().isoformat()
                action = "Updated status" if updated_at != created_at else "Created application"
                recent_activities.append({
                    "id": a.get("id"),
                    "title": f"{a.get('organization_name', '')} — {a.get('post_name', '')}",
                    "job_id": a.get("job_id"),
                    "status": a.get("status"),
                    "date": date_str,
                    "action": action,
                })
        except Exception as e:
            print(f"[MongoItemRepository] Metrics error: {e}")
            total_applications = 0
            submitted_count = 0
            shortlisted_count = 0
            rejected_count = 0
            pending_admit_cards = 0
            upcoming_deadlines_count = 0
            upcoming_exams_count = 0
            status_distribution = []
            recent_activities = []

        return {
            "total_applications": total_applications,
            "submitted_count": submitted_count,
            "upcoming_exams_count": upcoming_exams_count,
            "shortlisted_count": shortlisted_count,
            "rejected_count": rejected_count,
            "pending_admit_cards": pending_admit_cards,
            "upcoming_deadlines_count": upcoming_deadlines_count,
            "status_distribution": status_distribution,
            "recent_activities": recent_activities,
        }
