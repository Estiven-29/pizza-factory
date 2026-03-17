"""Pydantic v2 response/request models."""
from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class PizzaResponse(BaseModel):
    """Respuesta de GET /pizzas/{style}."""

    style: str
    ingredients: List[str]
    price: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    """Cuerpo de POST /orders."""

    style: str = Field(..., examples=["colombian"])


class OrderResponse(BaseModel):
    """Respuesta de POST /orders."""

    id: int
    style: str
    ingredients: List[str]

    model_config = {"from_attributes": True}
