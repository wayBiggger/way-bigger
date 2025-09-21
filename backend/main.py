from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import Base, engine
from app.middleware.security import SecurityMiddleware, InputValidationMiddleware, CSRFMiddleware, LoggingMiddleware
# Import all models so they get created in the database
from app.models import *

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A platform where students learn by building real projects",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Dev-friendly: auto-create tables on startup (safe for local/docker dev; use migrations in prod)
@app.on_event("startup")
def create_database_tables() -> None:
    Base.metadata.create_all(bind=engine)

# Security middleware (order matters - add in reverse order)
app.add_middleware(LoggingMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(InputValidationMiddleware)
app.add_middleware(SecurityMiddleware)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.waybigger.com", "waybigger.com"]
)

# CORS middleware
# Expand CORS for common local dev hosts and allow-all when debug is true
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-CSRF-Token"]
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Project Learning Platform API",
        "version": settings.app_version,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working"}

@app.get("/simple")
async def simple_endpoint():
    return {"message": "Simple endpoint working", "data": [1, 2, 3]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
