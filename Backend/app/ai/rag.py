"""
Vector retriever for CareerTrack BD RAG pipeline.
Uses in-memory knowledge base (no external vector DB required for Phase 1).
Plug in pgvector / ChromaDB / Qdrant for production.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Any

from app.ai.prompt import RAG_SYSTEM_PROMPT


@dataclass
class Document:
    id: str
    title: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


# ── Seeded knowledge base ─────────────────────────────────────────────────────
KNOWLEDGE_BASE: list[Document] = [
    Document(
        id="bb_senior_officer_exam_notice",
        title="Bangladesh Bank Senior Officer Exam Notice (BSCS 357/2026)",
        content=(
            "Bangladesh Bank Senior Officer exam scheduled for 13 November 2026 Thursday. "
            "Exam time 3:00 PM to 4:00 PM (1 hour MCQ). Report by 2:00 PM. "
            "Total candidates 120529 across 31 centers in Dhaka. "
            "Roll 116683 assigned to Center #3: Shamsul Hoque Khan School and College, "
            "Matuail, Demra Road, Jatrabari, Dhaka 1361. "
            "Notice reference: BSCS Notice No 357/2026. "
            "Candidates must bring admit card and national ID."
        ),
        metadata={"org": "Bangladesh Bank", "job_id": "26101", "doc_type": "exam_notice"},
    ),
    Document(
        id="bb_senior_officer_admit_card",
        title="Bangladesh Bank Senior Officer Admit Card — Roll 116683",
        content=(
            "Admit card issued for Bangladesh Bank Senior Officer post. "
            "Roll number 116683. Tracking number 338528. Application ID 2052062-394651 area. "
            "Admit card originally stated exam date to be announced later — "
            "BSCS Notice 357/2026 confirmed the date as 13 November 2026. "
            "Post: Senior Officer. Organization: Bangladesh Bank. "
            "Written exam subject: MCQ type, 100 marks, 1 hour duration."
        ),
        metadata={"org": "Bangladesh Bank", "job_id": "26101", "doc_type": "admit_card"},
    ),
    Document(
        id="sonali_bank_dba_application",
        title="Sonali Bank PLC — Assistant Database Administrator (Grade 9) Application",
        content=(
            "Application submitted for Sonali Bank PLC post of Assistant Database Administrator Grade 9. "
            "Job ID 26109. Application tracking number 2052062-838456. Roll number 338528. "
            "Application confirmed. Exam schedule not yet announced as of November 2026. "
            "Candidates should monitor sonalibank.com.bd for admit card and exam notice."
        ),
        metadata={"org": "Sonali Bank PLC", "job_id": "26109", "doc_type": "application_confirmation"},
    ),
    Document(
        id="combined_10_banks_officer_it",
        title="Combined 10 Banks — Officer IT/MIS and ICT Officer (Grade 10) Application",
        content=(
            "Application submitted for Combined 10 Banks recruitment exam for Officer IT MIS and ICT Officer Grade 10. "
            "Job ID 26105. Application tracking number 2052062-932886. Roll number 338528. "
            "This is a combined recruitment by consortium of 10 Bangladeshi banks. "
            "Exam date and admit card not yet announced."
        ),
        metadata={"org": "Combined 10 Banks", "job_id": "26105", "doc_type": "application_confirmation"},
    ),
    Document(
        id="combined_8_banks_senior_officer_it",
        title="Combined 8 Banks — Senior Officer IT (Grade 9) Application",
        content=(
            "Application submitted for Combined 8 Banks recruitment exam for Senior Officer IT Grade 9. "
            "Job ID 26104. Application tracking number 2052062-394651. Roll number 338528. "
            "Combined recruitment for 8 Bangladeshi government and state-owned banks. "
            "Exam date and admit card not yet announced."
        ),
        metadata={"org": "Combined 8 Banks", "job_id": "26104", "doc_type": "application_confirmation"},
    ),
]


class VectorRetriever:
    """
    Simple keyword-based retriever (no embeddings required for Phase 1).
    Replace `_score` with cosine similarity over pgvector in production.
    """

    def __init__(self, documents: list[Document] | None = None) -> None:
        self.documents = documents or KNOWLEDGE_BASE

    def _score(self, doc: Document, query: str) -> float:
        """Score a document against a query using simple term frequency."""
        query_terms = set(re.findall(r"\w+", query.lower()))
        doc_text = (doc.title + " " + doc.content).lower()
        doc_terms = set(re.findall(r"\w+", doc_text))
        overlap = query_terms & doc_terms
        if not query_terms:
            return 0.0
        return len(overlap) / len(query_terms)

    def query(self, query: str, top_k: int = 3) -> list[dict[str, Any]]:
        """Return top_k most relevant documents for the query."""
        scored = [(doc, self._score(doc, query)) for doc in self.documents]
        scored.sort(key=lambda x: x[1], reverse=True)
        results = []
        for doc, score in scored[:top_k]:
            if score > 0.05:
                results.append(
                    {
                        "id": doc.id,
                        "title": doc.title,
                        "content": doc.content[:500],
                        "metadata": doc.metadata,
                        "score": round(score, 4),
                    }
                )
        return results

    def build_context(self, query: str, top_k: int = 3) -> str:
        """Build a context string from retrieved documents."""
        docs = self.query(query, top_k)
        if not docs:
            return "No relevant documents found in knowledge base."
        parts = []
        for i, doc in enumerate(docs, 1):
            parts.append(f"[{i}] **{doc['title']}**\n{doc['content']}")
        return "\n\n".join(parts)


# Singleton
vector_retriever = VectorRetriever()
