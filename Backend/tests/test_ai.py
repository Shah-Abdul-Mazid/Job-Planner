"""
AI & ML endpoint integration tests.
Run from Backend/ directory: python -m pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_ok():
    """GET /api/v1/health → 200 with status=ok"""
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "version" in data


def test_chat_endpoint():
    """POST /api/v1/chat → returns a response string"""
    payload = {
        "messages": [{"role": "user", "content": "When is my exam?"}],
        "session_id": "test-session",
    }
    r = client.post("/api/v1/chat", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert len(data["response"]) > 10


def test_rag_query():
    """POST /api/v1/rag/query → returns answer + retrieved documents"""
    payload = {"query": "Bangladesh Bank Senior Officer exam date", "top_k": 3}
    r = client.post("/api/v1/rag/query", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "answer" in data
    assert "retrieved_documents" in data
    assert isinstance(data["retrieved_documents"], list)


def test_predict_admit_card():
    """POST /api/v1/predict → classifies admit card text correctly"""
    payload = {
        "text": (
            "Admit Card for Bangladesh Bank Senior Officer Exam. "
            "Roll No: 116683. Exam Date: 13 November 2026."
        )
    }
    r = client.post("/api/v1/predict", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["label"] == "admit_card"
    assert data["confidence"] > 0.5
    assert "latency_ms" in data
    assert "action" in data
