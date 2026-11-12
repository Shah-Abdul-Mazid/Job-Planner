"""
Web API (CRUD) integration tests.
Run from Backend/ directory: python -m pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_dashboard_stats():
    """GET /api/v1/items/stats → returns dashboard metrics"""
    r = client.get("/api/v1/items/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_applications" in data
    assert "submitted_count" in data
    assert data["total_applications"] >= 4   # seeded 4


def test_list_items():
    """GET /api/v1/items → returns paginated list with seeded data"""
    r = client.get("/api/v1/items")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 4
    assert len(data["items"]) >= 4


def test_seat_plan_roll_lookup():
    """GET /api/v1/items/seat-plan?roll=116683 → Centre #3"""
    r = client.get("/api/v1/items/seat-plan?roll=116683")
    assert r.status_code == 200
    data = r.json()
    assert data["matched"] is True
    assert data["centre"]["centre_no"] == 3
    assert "Shamsul Hoque Khan" in data["centre"]["name"]
    assert data["exam_date"] == "2026-11-13"


def test_create_and_delete_item():
    """POST /api/v1/items → create; DELETE /api/v1/items/{id} → 204"""
    payload = {
        "organization_name": "Test Bank",
        "post_name": "Test Officer",
        "job_id": "99999",
        "grade": "Grade 10",
        "tracking_id": "TEST-001",
        "roll_number": "000001",
        "status": "Submitted",
        "admit_card_available": False,
        "choices": [],
    }
    # Create
    r = client.post("/api/v1/items", json=payload)
    assert r.status_code == 201
    created = r.json()
    assert created["job_id"] == "99999"
    item_id = created["id"]

    # Delete
    r = client.delete(f"/api/v1/items/{item_id}")
    assert r.status_code == 204

    # Confirm gone
    r = client.get(f"/api/v1/items/{item_id}")
    assert r.status_code == 404
