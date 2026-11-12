import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # Common
    PROJECT_NAME: str = "CareerTrack BD"
    DEBUG: bool = True
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careertrack_bd_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database (MongoDB Atlas primary, SQLite local fallback)
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://ezanshah58_db_user:tcB7vRP4jsbcgyT8@jobappilcationdatabasec.zc4vzys.mongodb.net/?retryWrites=true&w=majority"
    )
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/careertrack.db" if os.environ.get("VERCEL") else f"sqlite:///{BASE_DIR / 'careertrack.db'}"
    )
    TIMEZONE: str = "Asia/Dhaka"

    # AI / GenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = "careertrack-ai-v1"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ML Inference
    ML_MODEL_NAME: str = "bd-recruitment-classifier-v1"
    ML_MODEL_PATH: str = "models/weights.bin"
    DEVICE: str = "cpu"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
