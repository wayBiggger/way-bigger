from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..core.database import Base

class MentorshipContext(Base):
    __tablename__ = "mentorship_contexts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    
    # Current project context
    current_project_id = Column(String, nullable=True)
    current_project_name = Column(String, nullable=True)
    current_file = Column(String, nullable=True)
    current_language = Column(String, nullable=True)
    
    # Learning profile
    skill_level = Column(String, nullable=False, default="beginner")  # beginner, intermediate, advanced
    learning_style = Column(String, nullable=False, default="mixed")  # visual, auditory, kinesthetic, reading, mixed
    preferred_help_style = Column(String, nullable=False, default="detailed")  # detailed, hints, questions
    
    # Progress tracking
    struggling_areas = Column(JSON, default=list)  # List of areas where user struggles
    strong_areas = Column(JSON, default=list)  # List of areas where user excels
    learning_velocity = Column(Float, default=1.0)  # How fast user learns (1.0 = average)
    
    # Session data
    session_duration = Column(Integer, default=0)  # Current session duration in minutes
    last_activity = Column(DateTime, default=datetime.utcnow)
    total_mentorship_time = Column(Integer, default=0)  # Total time spent with mentor
    
    # Context awareness
    recent_errors = Column(JSON, default=list)  # Recent error patterns
    recent_questions = Column(JSON, default=list)  # Recent questions asked
    current_focus = Column(String, nullable=True)  # What user is currently working on
    
    # Adaptation data
    communication_preferences = Column(JSON, default=dict)  # User's communication preferences
    difficulty_preferences = Column(JSON, default=dict)  # Preferred difficulty levels
    resource_preferences = Column(JSON, default=dict)  # Preferred resource types
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MentorshipSession(Base):
    __tablename__ = "mentorship_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    context_id = Column(String, ForeignKey("mentorship_contexts.id"))
    
    # Session details
    session_type = Column(String, nullable=False)  # proactive, reactive, assessment, review
    project_id = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    
    # Interaction data
    user_message = Column(Text, nullable=True)
    mentor_response = Column(Text, nullable=False)
    response_type = Column(String, nullable=False)  # explanation, hint, question, encouragement
    difficulty_level = Column(Integer, default=1)  # 1-5 scale
    
    # Learning outcomes
    concepts_covered = Column(JSON, default=list)
    skills_practiced = Column(JSON, default=list)
    resources_provided = Column(JSON, default=list)
    follow_up_questions = Column(JSON, default=list)
    
    # Feedback
    user_satisfaction = Column(Integer, nullable=True)  # 1-5 scale
    was_helpful = Column(Boolean, nullable=True)
    learning_achieved = Column(Boolean, default=False)
    
    # Timing
    response_time = Column(Float, nullable=True)  # Time to generate response in seconds
    session_duration = Column(Integer, default=0)  # Session duration in minutes
    
    created_at = Column(DateTime, default=datetime.utcnow)

class LearningStyleProfile(Base):
    __tablename__ = "learning_style_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True, unique=True)
    
    # Assessment results
    visual_score = Column(Float, default=0.0)
    auditory_score = Column(Float, default=0.0)
    kinesthetic_score = Column(Float, default=0.0)
    reading_score = Column(Float, default=0.0)
    
    # Primary and secondary learning styles
    primary_style = Column(String, nullable=False, default="mixed")
    secondary_style = Column(String, nullable=True)
    
    # Learning preferences
    prefers_diagrams = Column(Boolean, default=False)
    prefers_examples = Column(Boolean, default=False)
    prefers_explanations = Column(Boolean, default=False)
    prefers_hands_on = Column(Boolean, default=False)
    
    # Communication preferences
    detail_level = Column(String, default="medium")  # low, medium, high
    explanation_style = Column(String, default="practical")  # theoretical, practical, mixed
    feedback_frequency = Column(String, default="moderate")  # low, moderate, high
    
    # Assessment metadata
    assessment_completed = Column(Boolean, default=False)
    assessment_date = Column(DateTime, nullable=True)
    confidence_level = Column(Float, default=0.0)  # How confident we are in this profile
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MentorshipResource(Base):
    __tablename__ = "mentorship_resources"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Resource details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String, nullable=False)  # article, video, tutorial, exercise, diagram
    url = Column(String, nullable=True)
    content = Column(Text, nullable=True)  # For embedded content
    
    # Categorization
    skill_level = Column(String, nullable=False)  # beginner, intermediate, advanced
    learning_style = Column(String, nullable=False)  # visual, auditory, kinesthetic, reading, mixed
    topics = Column(JSON, default=list)  # List of topics this resource covers
    languages = Column(JSON, default=list)  # Programming languages this applies to
    
    # Quality metrics
    difficulty_level = Column(Integer, default=1)  # 1-5 scale
    time_required = Column(Integer, default=0)  # Estimated time in minutes
    quality_score = Column(Float, default=0.0)  # 0-1 scale
    
    # Usage tracking
    times_used = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)  # How often it helps users
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProactiveIntervention(Base):
    __tablename__ = "proactive_interventions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    context_id = Column(String, ForeignKey("mentorship_contexts.id"))
    
    # Intervention details
    trigger_type = Column(String, nullable=False)  # stuck, struggling, idle, error_pattern, success
    trigger_data = Column(JSON, nullable=False)  # Data that triggered the intervention
    
    # Intervention content
    message = Column(Text, nullable=False)
    intervention_type = Column(String, nullable=False)  # suggestion, encouragement, resource, break
    priority = Column(Integer, default=1)  # 1-5 scale
    
    # Response tracking
    was_shown = Column(Boolean, default=False)
    was_clicked = Column(Boolean, default=False)
    was_helpful = Column(Boolean, nullable=True)
    user_response = Column(Text, nullable=True)
    
    # Timing
    triggered_at = Column(DateTime, default=datetime.utcnow)
    shown_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
