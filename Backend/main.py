"""
Vercel entrypoint for CareerTrack BD.
Vercel's Python handler looks for `app` at the top level of this file.
"""
import sys
from pathlib import Path

# Make sure Backend/ is on the path so `app.*` imports work
_BASE = Path(__file__).resolve().parent          # Backend/
_APP  = _BASE / "app"                            # Backend/app/
for _p in [str(_BASE), str(_APP)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from app.main import app  # noqa: E402  — must be at module top level for Vercel AST

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
