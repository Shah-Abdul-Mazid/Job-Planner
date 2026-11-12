import sys
from pathlib import Path

# Ensure Backend/ directory is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Import the FastAPI application from app/main.py
from app.main import app

# Export Mangum handler for serverless runtime compatibility
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except Exception:
    handler = app

__all__ = ["app", "handler"]
