from app.main import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="",
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
    )
    