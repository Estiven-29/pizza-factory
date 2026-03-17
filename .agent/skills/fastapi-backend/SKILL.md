---
name: fastapi-pizza-api
description: FastAPI backend con Abstract Factory integrado, Pydantic, CORS, Docker.
---
# FastAPI Pizza API

**Goal**: APIs completas en backend/: GET/POST pizzas.

**Instructions**:
1. main.py: app = FastAPI(), routers.
2. /pizzas/{style} -> PizzaResponse(ingredients=[], style).
3. POST /order: guarda en PostgreSQL (psycopg2).
4. Integra factories de abstract-factory skill.
5. Dockerfile + requirements.txt (fastapi,uvicorn,pydantic,psycopg2).

**Constraints**:
- CORS origins: ["http://localhost:5173"].
- Valid styles o 422.
- Tests pytest en tests/.
- .env: DB_URL=postgresql://user:pass@db:5432/pizza.

**Scripts**:
docker_build.sh: docker build -t pizza-api .
