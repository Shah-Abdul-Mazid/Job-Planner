from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class RAGRequest(BaseModel):
    query: str
    top_k: int = Field(default=3, ge=1, le=10)


class RetrievedDocument(BaseModel):
    id: str
    title: str
    content: str
    score: float
    metadata: dict[str, Any] = {}


class RAGResponse(BaseModel):
    answer: str
    retrieved_documents: list[RetrievedDocument]
    query: str
