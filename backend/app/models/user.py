from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from ..core.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    MENTOR = "mentor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    reputation_score = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    
    # Onboarding fields
    selected_field = Column(String, nullable=True)  # e.g., "web-dev", "ai-ml", "mobile", "data-science"
    proficiency_level = Column(String, nullable=True)  # "beginner", "intermediate", "advanced"
    onboarding_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    skills = relationship("UserSkill", back_populates="user")
    submissions = relationship("Submission", back_populates="user")
    reviews = relationship("Review", back_populates="reviewer")
    team_memberships = relationship("TeamMember", back_populates="user")
    progress = relationship("UserProgress", back_populates="user", uselist=False)
    newsletters = relationship("Newsletter", back_populates="author")
    newsletter_subscriptions = relationship("NewsletterSubscription", back_populates="user")
    newsletter_likes = relationship("NewsletterLike", back_populates="user")
    newsletter_comments = relationship("NewsletterComment", back_populates="user")
