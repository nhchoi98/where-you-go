from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/whereyougo"
    SESSION_SECRET_KEY: str = "change-me-in-production"
    SESSION_MAX_AGE: int = 60 * 60 * 24  # 24 hours in seconds
    CORS_ORIGINS: str = "http://localhost:5173"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-5"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
