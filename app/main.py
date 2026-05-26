from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

try:
    from .database import Base, engine
    from .routers import auth
    from . import models
except ImportError:
    from database import Base, engine
    from routers import auth
    import models


def ensure_auth_schema():
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    columns_to_add = {
        "steam_id": "VARCHAR(32)",
        "avatar_url": "VARCHAR(500)",
        "profile_url": "VARCHAR(500)",
    }

    with engine.begin() as connection:
        for column_name, column_type in columns_to_add.items():
            if column_name not in existing_columns:
                try:
                    connection.execute(
                        text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                    )
                except OperationalError as exc:
                    if "duplicate column name" not in str(exc).lower():
                        raise


Base.metadata.create_all(bind=engine)
ensure_auth_schema()

app = FastAPI(title="Astlora Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["User Authentication"])

@app.get("/")
def index():
    return {
        "status": "running",
        "msg": "Astlora authentication backend is ready.",
        "docs_url": "/docs"
    }
