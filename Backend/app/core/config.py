"""
config.py — Application settings.
Uses plain os.getenv() — NO pydantic-settings dependency (not available on Vercel).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    # Project
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "CareerTrack BD")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careertrack_bd_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    MONGODB_USERNAME: str = os.getenv("MONGODB_USERNAME", "")
    MONGODB_PASSWORD: str = os.getenv("MONGODB_PASSWORD", "")

    @property
    def MONGODB_URI(self) -> str:
        env_uri = os.getenv("MONGODB_URI", "")
        if env_uri:
            return env_uri
        u = os.getenv("MONGODB_USERNAME", "")
        p = os.getenv("MONGODB_PASSWORD", "")
        if u and p:
            return (
                f"mongodb+srv://{u}:{p}@jobappilcationdatabasec.zc4vzys.mongodb.net/"
                "?retryWrites=true&w=majority"
            )
        # Hardcoded fallback (read-only Atlas cluster)
        return (
            "mongodb+srv://ezanshah58_db_user:tcB7vRP4jsbcgyT8"
            "@jobappilcationdatabasec.zc4vzys.mongodb.net/"
            "?retryWrites=true&w=majority"
        )

    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL", "")
        if env_url:
            return env_url
        if os.environ.get("VERCEL"):
            return "sqlite:////tmp/careertrack.db"
        return f"sqlite:///{BASE_DIR / 'careertrack.db'}"

    TIMEZONE: str = "Asia/Dhaka"

    # AI / GenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ML
    ML_MODEL_NAME: str = "bd-recruitment-classifier-v1"
    ML_MODEL_PATH: str = "models/weights.bin"
    DEVICE: str = "cpu"

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
