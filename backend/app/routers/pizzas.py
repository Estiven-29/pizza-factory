"""Pizzas router: GET /pizzas/{style} y POST /orders."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.factories import Pizza, available_styles, get_factory
from app.models import OrderCreate, OrderResponse, PizzaResponse
from app.schemas import Order

router = APIRouter(prefix="/pizzas", tags=["pizzas"])
orders_router = APIRouter(prefix="/orders", tags=["orders"])


# ---------------------------------------------------------------------------
# GET /pizzas/{style}
# ---------------------------------------------------------------------------

@router.get(
    "/{style}",
    response_model=PizzaResponse,
    summary="Obtener pizza por estilo",
)
def get_pizza(style: str) -> PizzaResponse:
    """Devuelve los ingredientes y precio de una pizza según su estilo.

    Estilos disponibles: italian, american, colombian.
    """
    try:
        factory = get_factory(style)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Estilo '{style}' no disponible. Estilos: {available_styles()}",
        )

    pizza = Pizza(factory)
    return PizzaResponse(
        style=factory.style,
        ingredients=pizza.ingredients,
        price=factory.price,
    )


# ---------------------------------------------------------------------------
# GET /pizzas  — listado de estilos
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=list[str],
    summary="Listar estilos disponibles",
)
def list_pizzas() -> list[str]:
    """Retorna los estilos de pizza disponibles."""
    return available_styles()


# ---------------------------------------------------------------------------
# POST /orders
# ---------------------------------------------------------------------------

@orders_router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear orden de pizza",
)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderResponse:
    """Crea y persiste un pedido en PostgreSQL."""
    try:
        factory = get_factory(payload.style)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Estilo '{payload.style}' no disponible. Estilos: {available_styles()}",
        )

    pizza = Pizza(factory)
    order = Order(style=factory.style, ingredients=pizza.ingredients)
    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderResponse(
        id=order.id,
        style=order.style,
        ingredients=order.ingredients,
    )
