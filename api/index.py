import os
from pathlib import Path

# Vercel entrypoint imports the FastAPI app from Backend/app/main.py
import sys
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir / "Backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
