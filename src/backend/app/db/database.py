from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, StaticPool

from app.core.config import settings


def _normalized_database_url(url: str) -> str:
    # Many hosted providers expose postgres:// while SQLAlchemy expects postgresql+driver://.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


_database_url = _normalized_database_url(settings.database_url)
_is_sqlite = _database_url.startswith("sqlite")

# Serverless environments (Vercel) require NullPool — no persistent connections.
# SQLite (local dev) uses StaticPool so in-memory DBs work across requests.
if _is_sqlite:
    engine = create_engine(
        _database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(_database_url, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
