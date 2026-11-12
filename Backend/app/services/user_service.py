from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin
from app.models.user import User
from app.core.security import verify_password, create_access_token

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, payload: UserCreate) -> User:
        existing = self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        return self.repo.create(payload)

    def authenticate(self, payload: UserLogin) -> dict:
        user = self.repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials."
            )
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return {"access_token": token, "token_type": "bearer", "user": user}

    def list_users(self, skip: int = 0, limit: int = 20) -> List[User]:
        return self.repo.get_multi(skip=skip, limit=limit)
