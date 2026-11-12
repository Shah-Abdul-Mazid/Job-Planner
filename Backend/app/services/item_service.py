from typing import Optional, List, Tuple, Dict, Any
from datetime import date
from fastapi import HTTPException, status
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate
from app.models.item import Item

class ItemService:
    def __init__(self, db):
        # Support both SQLAlchemy Session and MongoItemRepository
        if hasattr(db, "get_multi") and not hasattr(db, "query"):
            self.repo = db
        else:
            self.repo = ItemRepository(db)

    def list_items(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        organization: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        page: int = 1,
        page_size: int = 15,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Any], int]:
        if page < 1:
            page = 1
        skip = (page - 1) * page_size
        return self.repo.get_multi(
            search=search,
            status=status,
            organization=organization,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=page_size,
            sort_by=sort_by,
            sort_order=sort_order
        )

    def get_item(self, item_id: int) -> Any:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item/Application with ID {item_id} not found."
            )
        return item

    def create_item(self, payload: ItemCreate) -> Any:
        data = payload.model_dump(exclude={"choices"})
        return self.repo.create(data, payload.choices)

    def update_item(self, item_id: int, payload: ItemUpdate) -> Any:
        db_item = self.get_item(item_id)
        update_data = payload.model_dump(exclude_unset=True, exclude={"choices"})
        choices = payload.choices if payload.choices is not None else None
        return self.repo.update(db_item, update_data, choices)

    def delete_item(self, item_id: int) -> None:
        db_item = self.get_item(item_id)
        self.repo.delete(db_item)

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        return self.repo.get_dashboard_metrics()
