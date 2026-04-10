from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Weighted SWOT Decision Tool"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/swot_analysis"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    resources_dir: Path = Path("../../Resources")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
