import os
import sys
from pathlib import Path

# Ensure Backend/ directory is at the root of sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app
