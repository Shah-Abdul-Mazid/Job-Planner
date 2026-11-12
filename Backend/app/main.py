from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def read_root():
    return {"status": "ok"}


# --- Add this block to run via Python ---
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
