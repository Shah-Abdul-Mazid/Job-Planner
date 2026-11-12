from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=list[UserResponse], summary="List all users")
def list_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    svc = UserService(db)
    return svc.list_users(skip=skip, limit=limit)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    svc = UserService(db)
    return svc.register(payload)


@router.post("/login", summary="Authenticate and get JWT token")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    svc = UserService(db)
    result = svc.authenticate(payload)
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }
