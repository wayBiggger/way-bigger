from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Newsletter(Base):
    __tablename__ = "newsletters"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    status = Column(String, default="draft")  # draft, published, archived
    tags = Column(JSON, nullable=True)  # Array of tags
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    field = relationship("Field", backref="newsletters")
    author = relationship("User", back_populates="newsletters")

class NewsletterSubscription(Base):
    __tablename__ = "newsletter_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="newsletter_subscriptions")
    field = relationship("Field", backref="subscribers")

class NewsletterLike(Base):
    __tablename__ = "newsletter_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    newsletter_id = Column(Integer, ForeignKey("newsletters.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="newsletter_likes")
    newsletter = relationship("Newsletter", backref="user_likes")

class NewsletterComment(Base):
    __tablename__ = "newsletter_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    newsletter_id = Column(Integer, ForeignKey("newsletters.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("newsletter_comments.id"), nullable=True)  # For replies
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    newsletter = relationship("Newsletter", backref="comments")
    user = relationship("User", back_populates="newsletter_comments") 
    parent = relationship("NewsletterComment", remote_side=[id], backref="replies")
