"""
Re-export FastAPI app from main for backward compatibility with 'uvicorn app.main:app'.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app

__all__ = ["app"]
