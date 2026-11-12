"""
schemas/user.py — Uses plain str for email to avoid email-validator dependency.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: str           # plain str — no email-validator needed on Vercel
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
