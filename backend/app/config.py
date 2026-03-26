from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Auth
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./logicia.db"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # AI (optional)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""


settings = Settings()
