from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base


class ProjectDifficulty(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    RETIRED = "retired"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    brief = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Enum(ProjectDifficulty), nullable=False)
    tags = Column(JSON, default=list)  # List of skill tags
    required_skills = Column(JSON, default=list)  # List of skill IDs
    milestones = Column(JSON, default=list)  # List of milestone objects
    test_spec = Column(JSON, nullable=True)  # Test specifications
    is_community = Column(Boolean, default=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    estimated_hours = Column(Integer, nullable=True)
    max_team_size = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships intentionally omitted in development to avoid mapper errors


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=False)  # e.g., "web-dev", "ai", "mobile"
    description = Column(Text, nullable=True)
    levels = Column(JSON, default=list)  # List of difficulty levels
    ordering = Column(JSON, default=list)  # List of project IDs in order
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
