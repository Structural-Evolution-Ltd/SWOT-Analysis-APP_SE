from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, StaticPool

from app.core.config import settings


def _normalized_database_url(url: str) -> str:
    # Strip any accidentally embedded whitespace/newlines
    url = url.strip()
    # Normalise postgres:// → postgresql+psycopg2://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    # Remove channel_binding — not supported by psycopg2
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
    parsed = urlparse(url)
    params = {k: v for k, v in parse_qs(parsed.query, keep_blank_values=True).items() if k != "channel_binding"}
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    return urlunparse(parsed._replace(query=clean_query))


_database_url = _normalized_database_url(settings.database_url)
_is_sqlite = _database_url.startswith("sqlite")

# Serverless environments (Vercel) require NullPool — no persistent connections.
# SQLite (local dev / fallback) uses StaticPool so requests share the same connection.
if _is_sqlite:
    engine = create_engine(
        _database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # Import psycopg lazily so missing binary doesn't crash the module on SQLite installs.
    engine = create_engine(_database_url, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
