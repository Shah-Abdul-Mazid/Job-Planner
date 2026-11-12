import sys
from pathlib import Path

# Explicitly ensure Backend/ and Backend/app/ are on sys.path
BASE_DIR = Path(__file__).resolve().parent
APP_DIR = BASE_DIR / "app"
for p in [str(BASE_DIR), str(APP_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception as exc:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    err_trace = traceback.format_exc()
    print(f"[STARTUP CRASH]\n{err_trace}")

    app = FastAPI(title="CareerTrack BD (Error Mode)")

    @app.api_route(
        "/{path:path}",
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    )
    async def startup_error_fallback(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "startup_failed",
                "error": str(exc),
                "traceback": err_trace,
            },
        )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
