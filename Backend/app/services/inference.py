"""
Inference Service — wraps MLModel + RecruitmentPipeline.
"""

from __future__ import annotations

from app.ml.model import ml_model
from app.ml.pipeline import pipeline
from app.schemas.predict import PredictRequest, PredictResponse


class InferenceService:
    def run_prediction(self, request: PredictRequest) -> PredictResponse:
        # Pre-process
        clean_text = pipeline.preprocess(request.text)

        # Predict
        result = ml_model.predict(clean_text)

        # Post-process
        enriched = pipeline.postprocess(
            label=result.label,
            confidence=result.confidence,
            metadata=result.metadata,
        )

        return PredictResponse(
            label=enriched["label"],
            label_human=enriched["label_human"],
            confidence=enriched["confidence"],
            confidence_tier=enriched["confidence_tier"],
            action=enriched["action"],
            extracted=enriched["extracted"],
            latency_ms=result.latency_ms,
            model_device=ml_model.device,
        )


inference_service = InferenceService()
