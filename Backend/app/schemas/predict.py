from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    label: str
    label_human: str
    confidence: float
    confidence_tier: str          # "high" | "medium" | "low"
    action: str
    extracted: dict[str, Any] = {}
    latency_ms: float
    model_device: str = "cpu"
