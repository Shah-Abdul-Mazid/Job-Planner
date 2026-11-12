import os
from typing import List


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "CareerTrack BD")
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

    # Auth / Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careertrack_bd_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://ezanshah58_db_user:tcB7vRP4jsbcgyT8@jobappilcationdatabasec.zc4vzys.mongodb.net/?retryWrites=true&w=majority",
    )
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/careertrack.db" if os.environ.get("VERCEL") else "sqlite:///./careertrack.db",
    )
    TIMEZONE: str = "Asia/Dhaka"

    # AI / GenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "sk-placeholder-for-dev")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    # ML Inference
    ML_MODEL_NAME: str = "bd-recruitment-classifier-v1"
    ML_MODEL_PATH: str = "models/weights.bin"
    DEVICE: str = "cpu"
    MAX_BATCH_SIZE: int = 32

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://bd-career-jobplanner.vercel.app",
        "https://bd-careertrack-jobplanner.vercel.app",
        "https://job-planner-ivory.vercel.app",
        "https://job-planner-psi.vercel.app",
    ]


settings = Settings()
