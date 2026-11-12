from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: str = ""


class ChatResponse(BaseModel):
    response: str
    session_id: str = "local"
    model: str = "rule-based"
    tokens_used: Optional[int] = None
