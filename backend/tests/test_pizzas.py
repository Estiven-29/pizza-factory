"""Tests for the Pizza Factory API."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# DB en memoria SQLite para tests (no necesita PostgreSQL)
# ---------------------------------------------------------------------------

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


client = TestClient(app)


# ---------------------------------------------------------------------------
# Tests GET /api/pizzas/{style}
# ---------------------------------------------------------------------------

class TestGetPizza:
    def test_colombian_pizza(self):
        response = client.get("/api/pizzas/colombian")
        assert response.status_code == 200
        body = response.json()
        assert body["style"] == "colombian"
        assert "arepa" in body["ingredients"]
        assert "hogao" in body["ingredients"]
        assert isinstance(body["price"], float)

    def test_italian_pizza(self):
        response = client.get("/api/pizzas/italian")
        assert response.status_code == 200
        body = response.json()
        assert body["style"] == "italian"
        assert "mozzarella" in body["ingredients"]

    def test_american_pizza(self):
        response = client.get("/api/pizzas/american")
        assert response.status_code == 200
        body = response.json()
        assert body["style"] == "american"
        assert "pepperoni" in body["ingredients"]

    def test_invalid_style_returns_422(self):
        response = client.get("/api/pizzas/german")
        assert response.status_code == 422

    def test_list_pizzas(self):
        response = client.get("/api/pizzas/")
        assert response.status_code == 200
        styles = response.json()
        assert "colombian" in styles
        assert "italian" in styles
        assert "american" in styles


# ---------------------------------------------------------------------------
# Tests POST /api/orders
# ---------------------------------------------------------------------------

class TestCreateOrder:
    def test_create_colombian_order(self):
        response = client.post("/api/orders/", json={"style": "colombian"})
        assert response.status_code == 201
        body = response.json()
        assert body["style"] == "colombian"
        assert "arepa" in body["ingredients"]
        assert isinstance(body["id"], int)

    def test_create_italian_order(self):
        response = client.post("/api/orders/", json={"style": "italian"})
        assert response.status_code == 201
        assert response.json()["style"] == "italian"

    def test_invalid_order_style(self):
        response = client.post("/api/orders/", json={"style": "japanese"})
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
