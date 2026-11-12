"""
CareerTrack BD — FastAPI application entry point for Vercel Serverless.
"""
import sys
import os
from pathlib import Path

_BASE = Path(__file__).resolve().parent
_APP  = _BASE / "app"

# 1. Search and add any installed site-packages (.venv or bundled packages)
for _search_root in [_BASE, Path("/var/task"), _BASE.parent]:
    try:
        if _search_root.exists():
            for _sp in _search_root.glob("**/site-packages"):
                _sp_str = str(_sp)
                if _sp_str not in sys.path:
                    sys.path.insert(0, _sp_str)
    except Exception as _e:
        print(f"[Warning] Site-packages search notice: {_e}")

# 2. Add Backend/ and Backend/app/ to sys.path
for _p in [str(_BASE), str(_APP)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Top-level ASGI callable for Vercel
from app.main import app  # noqa: E402

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
