from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_multi(self, skip: int = 0, limit: int = 20) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def create(self, payload: UserCreate) -> User:
        db_user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
            is_active=payload.is_active
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
