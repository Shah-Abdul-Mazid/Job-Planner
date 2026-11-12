"""
Pre/post-processing pipeline for CareerTrack BD ML inference.
"""

from __future__ import annotations
import re
import unicodedata


class RecruitmentPipeline:
    """Text preprocessing and postprocessing for recruitment documents."""

    # Bengali Unicode ranges
    _BANGLA_RANGE = re.compile(r"[\u0980-\u09FF]+")

    def preprocess(self, raw_text: str) -> str:
        """
        Clean and normalize raw document text before classification.
        Steps: unicode normalize → remove excessive whitespace → lowercase.
        """
        # Normalize unicode (NFC handles Bangla composed chars)
        text = unicodedata.normalize("NFC", raw_text)
        # Collapse multiple spaces/newlines
        text = re.sub(r"\s+", " ", text)
        # Remove zero-width chars
        text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)
        return text.strip()

    def postprocess(self, label: str, confidence: float, metadata: dict) -> dict:
        """
        Enrich prediction output with human-readable labels and action hints.
        """
        label_map = {
            "admit_card": "Admit Card",
            "application_confirmation": "Application Confirmation",
            "exam_notice": "Exam Notice / Schedule",
            "result_notice": "Result Notice",
            "recruitment_circular": "Recruitment Circular",
            "other": "Unknown Document",
        }

        action_map = {
            "admit_card": "Save to Documents; note roll number and exam center.",
            "application_confirmation": "Save tracking number; monitor for admit card.",
            "exam_notice": "Update exam schedule in calendar; check seat plan.",
            "result_notice": "Check if selected; prepare for viva if applicable.",
            "recruitment_circular": "Review eligibility; apply before deadline.",
            "other": "Review document manually.",
        }

        confidence_tier = (
            "high" if confidence >= 0.85
            else "medium" if confidence >= 0.65
            else "low"
        )

        return {
            "label": label,
            "label_human": label_map.get(label, label),
            "confidence": confidence,
            "confidence_tier": confidence_tier,
            "action": action_map.get(label, "Review manually."),
            "extracted": metadata,
        }


# Singleton
pipeline = RecruitmentPipeline()
