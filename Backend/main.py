import sys
from pathlib import Path

# Ensure Backend/ and Backend/app/ are on sys.path
BASE_DIR = Path(__file__).resolve().parent
for p in [str(BASE_DIR), str(BASE_DIR / "app")]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Top-level import for Vercel AST static handler detection
from app.main import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
