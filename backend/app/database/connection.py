import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "banco_digital")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DATABASE_URL = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        # Test PostgreSQL connection with a short timeout
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
except Exception:
    # Graceful fallback to SQLite for local development when Postgres is inactive
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "banco_digital.db")
    engine = create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Crea todas las tablas si no existen."""
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


# Auto-crear esquema para desarrollo inmediato
try:
    init_db()
except Exception:
    pass



def get_db() -> Generator[Session, None, None]:
    """
    Dependencia FastAPI que proporciona una sesión SQLAlchemy por petición.
    La sesión se cierra automáticamente al finalizar cada petición HTTP.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False

