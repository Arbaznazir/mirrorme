from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    # Default to SQLite for development
    database_url: str = "sqlite:///./mirrorme.db"

    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # AI Providers (multiple options)
    openai_api_key: str = ""
    gemini_api_key: str = ""
    deepseek_api_key: str = ""
    groq_api_key: str = ""
    together_api_key: str = ""
    ollama_url: str = "http://localhost:11434"

    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,chrome-extension://"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
