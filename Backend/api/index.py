"""
CareerTrack BD — Vercel serverless entrypoint.
This file is at Backend/api/index.py and is the target for @vercel/python.
Vercel sets cwd to Backend/ so all imports from app.* work correctly.
"""
import sys
import os
from pathlib import Path

# Backend/ directory = parent of api/
BACKEND_DIR = Path(__file__).resolve().parent.parent  # → Backend/
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Now import the FastAPI app from Backend/app/main.py
from app.main import app  # noqa: F401 — Vercel needs `app` exported from this module

# Vercel's @vercel/python runtime uses the `app` variable directly (ASGI)
# No need for Mangum — Vercel handles ASGI natively since 2023
