"""SQLAlchemy engine, session factory, and declarative base."""
from __future__ import annotations

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL: str = os.environ.get(
    "DATABASE_URL",
    "postgresql://user:pass@db:5432/pizza",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # verifica conexión antes de usarla
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Dependency inyectable en FastAPI
# ---------------------------------------------------------------------------

def get_db():
    """FastAPI dependency: yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
