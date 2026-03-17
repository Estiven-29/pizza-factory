"""Pizza Factory API — punto de entrada principal."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.pizzas import orders_router, router as pizzas_router


# ---------------------------------------------------------------------------
# Lifespan — creación de tablas al arrancar
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Crea las tablas si no existen (no usa Alembic para simplicidad)
    Base.metadata.create_all(bind=engine)
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Pizza Factory API",
    description="Abstract Factory pattern para pizzas: Italian, American, Colombian.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(pizzas_router, prefix="/api")
app.include_router(orders_router, prefix="/api")


@app.get("/", tags=["health"])
def root() -> dict:
    return {"status": "ok", "docs": "/docs"}
