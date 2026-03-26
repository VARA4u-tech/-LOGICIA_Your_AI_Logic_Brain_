from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Auth
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./logicia.db"

    # CORS (Stored as comma-separated string for .env compatibility)
    _FRONTEND_ORIGINS_STR: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"

    @property
    def FRONTEND_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self._FRONTEND_ORIGINS_STR.split(",") if o.strip()]

    # AI (optional)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""


settings = Settings()
