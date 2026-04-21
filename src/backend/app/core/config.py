from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve DB path relative to this file so it works regardless of cwd
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_DB_URL = f"sqlite:///{_BACKEND_DIR / 'swot_analysis.db'}"


class Settings(BaseSettings):
    app_name: str = "Weighted SWOT Decision Tool"
    database_url: str = _DEFAULT_DB_URL
    # Accepts JSON array OR comma-separated string from env, e.g.:
    #   CORS_ORIGINS='["https://my-app.vercel.app"]'
    #   CORS_ORIGINS=https://my-app.vercel.app,http://localhost:5173
    # Union type allows pydantic-settings to pass either a pre-decoded list or raw string.
    cors_origins: list[str] | str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
    resources_dir: Path = Path("../../Resources")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> object:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            return v  # kept as comma-separated str; callers must split
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, list):
            return self.cors_origins
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

