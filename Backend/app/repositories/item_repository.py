from typing import Optional, List, Tuple, Dict, Any
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from app.models.item import Item, ItemChoice, ItemExamination

class ItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, item_id: int) -> Optional[Item]:
        return self.db.query(Item).filter(Item.id == item_id).first()

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
        sort_order: str = "desc"
    ) -> Tuple[List[Item], int]:
        query = self.db.query(Item)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Item.organization_name.ilike(search_term),
                    Item.post_name.ilike(search_term),
                    Item.job_id.ilike(search_term),
                    Item.tracking_id.ilike(search_term),
                    Item.roll_number.ilike(search_term),
                )
            )

        if status and status != "All":
            query = query.filter(Item.status == status)

        if organization and organization != "All":
            query = query.filter(Item.organization_name == organization)

        if start_date:
            query = query.filter(Item.application_date >= start_date)

        if end_date:
            query = query.filter(Item.application_date <= end_date)

        total = query.count()

        sort_col = getattr(Item, sort_by, Item.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, item_data: dict, choices: List[str]) -> Item:
        db_item = Item(**item_data)
        self.db.add(db_item)
        self.db.flush()

        for idx, choice_org in enumerate(choices, start=1):
            choice = ItemChoice(
                item_id=db_item.id,
                preference_order=idx,
                choice_organization=choice_org
            )
            self.db.add(choice)

        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def update(self, db_item: Item, update_data: dict, choices: Optional[List[str]] = None) -> Item:
        for field, value in update_data.items():
            setattr(db_item, field, value)

        if choices is not None:
            self.db.query(ItemChoice).filter(ItemChoice.item_id == db_item.id).delete()
            for idx, choice_org in enumerate(choices, start=1):
                choice = ItemChoice(
                    item_id=db_item.id,
                    preference_order=idx,
                    choice_organization=choice_org
                )
                self.db.add(choice)

        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete(self, db_item: Item) -> None:
        self.db.delete(db_item)
        self.db.commit()

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        total_applications = self.db.query(Item).count()
        submitted_count = self.db.query(Item).filter(Item.status.in_(["Submitted", "Applied"])).count()
        shortlisted_count = self.db.query(Item).filter(Item.status == "Shortlisted").count()
        rejected_count = self.db.query(Item).filter(Item.status == "Rejected").count()
        pending_admit_cards = self.db.query(Item).filter(Item.admit_card_available == False).count()

        today = date.today()
        upcoming_deadlines_count = self.db.query(Item).filter(
            Item.deadline >= today,
            Item.deadline <= today + timedelta(days=30)
        ).count()

        now = datetime.utcnow()
        upcoming_exams_count = self.db.query(ItemExamination).filter(
            ItemExamination.exam_date >= now
        ).count()

        status_counts_raw = (
            self.db.query(Item.status, func.count(Item.id))
            .group_by(Item.status)
            .all()
        )
        status_distribution = [{"status": s, "count": c} for s, c in status_counts_raw]

        recent_items = (
            self.db.query(Item)
            .order_by(desc(Item.updated_at))
            .limit(5)
            .all()
        )
        recent_activities = [
            {
                "id": a.id,
                "title": f"{a.organization_name} — {a.post_name}",
                "job_id": a.job_id,
                "status": a.status,
                "date": a.updated_at.isoformat() if a.updated_at else datetime.utcnow().isoformat(),
                "action": "Updated status" if a.updated_at != a.created_at else "Created application"
            }
            for a in recent_items
        ]

        return {
            "total_applications": total_applications,
            "submitted_count": submitted_count,
            "upcoming_exams_count": upcoming_exams_count,
            "shortlisted_count": shortlisted_count,
            "rejected_count": rejected_count,
            "pending_admit_cards": pending_admit_cards,
            "upcoming_deadlines_count": upcoming_deadlines_count,
            "status_distribution": status_distribution,
            "recent_activities": recent_activities
        }
