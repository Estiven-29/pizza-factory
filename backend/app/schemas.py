"""SQLAlchemy ORM models (DB schema)."""
from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.database import Base

# Use JSON generically (SQLite-compatible) but tell PostgreSQL to use JSONB.
_IngredientsType = JSON().with_variant(JSONB(), "postgresql")


class Order(Base):
    """Tabla orders: guarda cada pedido de pizza."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    style: Mapped[str] = mapped_column(String(50), nullable=False)
    ingredients: Mapped[list] = mapped_column(
        _IngredientsType, nullable=False, default=list
    )
