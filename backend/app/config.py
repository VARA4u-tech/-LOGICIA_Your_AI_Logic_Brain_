from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Auth
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Mongo Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "logicia"

    # CORS (Stored as comma-separated string for .env compatibility)
    FRONTEND_ORIGINS_STR: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"

    @property
    def FRONTEND_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS_STR.split(",") if o.strip()]

    # AI Providers
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "nvidia/nemotron-3-super-120b-a12b:free"
    SITE_URL: str = "https://logicia.ai"
    SITE_NAME: str = "Logicia AI Math Tutor"


settings = Settings()
