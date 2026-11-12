from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Full-Stack AI & ML Service"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Auth / Security
    SECRET_KEY: str = "change_this_to_a_super_secret_key_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # GenAI / LLM Settings
    OPENAI_API_KEY: str = "sk-placeholder-for-dev"
    LLM_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ML / Model Settings
    ML_MODEL_NAME: str = "classifier-v1"
    ML_MODEL_PATH: str = "models/weights.bin"
    DEVICE: str = "cpu"  # "cpu" or "cuda"
    MAX_BATCH_SIZE: int = 32

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
