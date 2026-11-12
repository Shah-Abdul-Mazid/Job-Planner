"""
ML model wrapper for CareerTrack BD.
Phase 1: rule-based document classifier.
Phase 2: replace with HuggingFace / ONNX model loaded via lifespan.
"""

from __future__ import annotations
import re
import time
from dataclasses import dataclass
from typing import Any


@dataclass
class PredictionResult:
    label: str
    confidence: float
    latency_ms: float
    metadata: dict[str, Any]


class MLModel:
    """
    Document-type classifier.
    Rule-based in Phase 1; replace `_classify` with model.predict() in Phase 2.
    """

    LABELS = [
        "admit_card",
        "application_confirmation",
        "exam_notice",
        "result_notice",
        "recruitment_circular",
        "other",
    ]

    # Keyword → label mapping (order matters — first match wins)
    _RULES: list[tuple[list[str], str]] = [
        (["admit card", "roll no", "roll number", "hall ticket", "pravesh patra"], "admit_card"),
        (["exam notice", "examination schedule", "seat plan", "center list", "bscs notice"], "exam_notice"),
        (["result", "merit list", "selected candidates", "viva voce"], "result_notice"),
        (["application confirmed", "tracking no", "tracking number", "আবেদন সম্পন্ন"], "application_confirmation"),
        (["circular", "recruitment notice", "vacancy", "শূন্য পদ", "বিজ্ঞপ্তি"], "recruitment_circular"),
    ]

    def __init__(self) -> None:
        self.is_loaded = True  # Phase 2: set to False until model loads in lifespan

    def predict(self, text: str) -> PredictionResult:
        """Classify document text and return prediction."""
        t0 = time.perf_counter()
        label, confidence = self._classify(text.lower())
        latency_ms = (time.perf_counter() - t0) * 1000

        # Extract key entities for metadata
        roll = re.search(r"roll\s*(?:no|number)?[:\s]*(\d{4,8})", text, re.IGNORECASE)
        job_id = re.search(r"job\s*id[:\s]*(\d{4,6})", text, re.IGNORECASE)
        tracking = re.search(r"(\d{7}-\d{6})", text)

        return PredictionResult(
            label=label,
            confidence=confidence,
            latency_ms=round(latency_ms, 2),
            metadata={
                "roll_number": roll.group(1) if roll else None,
                "job_id": job_id.group(1) if job_id else None,
                "tracking_number": tracking.group(1) if tracking else None,
                "text_length": len(text),
            },
        )

    def _classify(self, text: str) -> tuple[str, float]:
        for keywords, label in self._RULES:
            matches = sum(1 for kw in keywords if kw in text)
            if matches > 0:
                confidence = min(0.95, 0.60 + matches * 0.10)
                return label, confidence
        return "other", 0.40

    @property
    def device(self) -> str:
        return "cpu"


# Singleton — replaced with actual model in lifespan for Phase 2
ml_model = MLModel()
