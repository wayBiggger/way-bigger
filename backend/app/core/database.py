from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool, QueuePool
from .config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Performance monitoring
def log_query_time(conn, cursor, statement, parameters, context, executemany):
    start = time.time()
    result = cursor.execute(statement, parameters)
    end = time.time()
    if end - start > 0.1:  # Log slow queries (>100ms)
        logger.warning(f"Slow query ({end - start:.3f}s): {statement[:100]}...")
    return result

# Create engine lazily to ensure it uses the updated configuration
def get_engine():
    if settings.database_url.startswith("sqlite"):
        engine = create_engine(
            settings.database_url,
            connect_args={"check_same_thread": False},
            echo=settings.debug,
            poolclass=StaticPool,
            pool_pre_ping=True,
            pool_recycle=3600,  # Recycle connections every hour
        )
        logger.info(f"Using SQLite database: {settings.database_url}")
    else:
        # Use psycopg3 for PostgreSQL with optimized settings
        engine = create_engine(
            settings.database_url.replace("postgresql://", "postgresql+psycopg://"),
            echo=settings.debug,
            poolclass=QueuePool,
            pool_size=20,  # Increased pool size
            max_overflow=30,  # Allow overflow connections
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=3600,  # Recycle connections every hour
            pool_timeout=30,  # Timeout for getting connection from pool
        )
        logger.info("Using PostgreSQL database with psycopg3")
    
    # Add query performance monitoring
    event.listen(engine, "before_cursor_execute", log_query_time)
    
    return engine

# Create engine instance
engine = get_engine()

# Optimized session configuration
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False  # Prevent unnecessary queries on commit
)

Base = declarative_base()

# Connection pool monitoring
def get_connection_info():
    if hasattr(engine.pool, 'size'):
        return {
            'pool_size': engine.pool.size(),
            'checked_in': engine.pool.checkedin(),
            'checked_out': engine.pool.checkedout(),
            'overflow': engine.pool.overflow(),
        }
    return None

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
