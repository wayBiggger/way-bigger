from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine with SQLite-specific settings for local development
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=settings.debug
    )
    logger.info("Using SQLite database for local development")
else:
    # Use psycopg3 for PostgreSQL
    engine = create_engine(
        settings.database_url.replace("postgresql://", "postgresql+psycopg://"),
        echo=settings.debug
    )
    logger.info("Using PostgreSQL database with psycopg3")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
