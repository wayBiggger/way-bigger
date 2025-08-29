from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application
    app_name: str = "Project Learning Platform"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database - Use SQLite for local development without Docker
    database_url: str = "sqlite:///./local_dev.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OAuth
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    frontend_url: str = "http://localhost:3000"
    
    # Redis - Disable for local development without Docker
    redis_url: str = "redis://localhost:6379"
    use_redis: bool = False
    
    # External Services
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # File Storage
    s3_bucket: Optional[str] = None
    s3_access_key: Optional[str] = None
    s3_secret_key: Optional[str] = None
    
    class Config:
        env_file = "env.local"
        case_sensitive = False


settings = Settings()

