"""
users.py — User management endpoints.
Uses lazy SQLAlchemy imports so the app starts even if sqlalchemy is unavailable.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()


def _get_db():
    """Lazy dependency — imports sqlalchemy only at request time."""
    try:
        from app.core.database import get_db as _gdb
        yield from _gdb()
    except ImportError:
        yield None


@router.get("", response_model=list[UserResponse], summary="List all users")
def list_users(skip: int = 0, limit: int = 20, db=Depends(_get_db)):
    if db is None:
        return []
    try:
        from app.services.user_service import UserService
        svc = UserService(db)
        return svc.list_users(skip=skip, limit=limit)
    except Exception:
        return []


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register_user(payload: UserCreate, db=Depends(_get_db)):
    if db is None:
        raise HTTPException(
            status_code=503, detail="Database not available on this deployment"
        )
    from app.services.user_service import UserService
    svc = UserService(db)
    return svc.register(payload)


@router.post("/login", summary="Authenticate and get JWT token")
def login(payload: UserLogin, db=Depends(_get_db)):
    if db is None:
        raise HTTPException(
            status_code=503, detail="Database not available on this deployment"
        )
    from app.services.user_service import UserService
    svc = UserService(db)
    result = svc.authenticate(payload)
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }
