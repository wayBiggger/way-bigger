from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from ..core.database import Base

class ProjectRole(enum.Enum):
    LEADER = "leader"
    FRONTEND_DEVELOPER = "frontend_developer"
    BACKEND_DEVELOPER = "backend_developer"
    UI_UX_DESIGNER = "ui_ux_designer"
    DATA_SCIENTIST = "data_scientist"
    DEVOPS_ENGINEER = "devops_engineer"
    CONTRIBUTOR = "contributor"

class ParticipantStatus(enum.Enum):
    ONLINE = "online"
    AWAY = "away"
    BUSY = "busy"
    OFFLINE = "offline"

class ProjectPermission(enum.Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"

class TeamProject(Base):
    __tablename__ = "team_projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String, nullable=False, index=True)  # User ID of project leader
    
    # Project settings
    difficulty_level = Column(String, nullable=False, default="intermediate")  # beginner, intermediate, advanced
    max_team_size = Column(Integer, default=5)
    min_team_size = Column(Integer, default=2)
    is_public = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    
    # Project state
    status = Column(String, nullable=False, default="active")  # active, completed, paused, cancelled
    progress_percentage = Column(Integer, default=0)
    
    # Collaboration settings
    allow_voice_chat = Column(Boolean, default=True)
    allow_screen_share = Column(Boolean, default=True)
    auto_save_interval = Column(Integer, default=30)  # seconds
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    participants = relationship("ProjectParticipant", back_populates="project", cascade="all, delete-orphan")
    sessions = relationship("CollaborationSession", back_populates="project", cascade="all, delete-orphan")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")

class ProjectParticipant(Base):
    __tablename__ = "project_participants"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("team_projects.id"), nullable=False)
    user_id = Column(String, nullable=False, index=True)
    
    # Role and permissions
    role = Column(Enum(ProjectRole), nullable=False, default=ProjectRole.CONTRIBUTOR)
    permissions = Column(JSON, default=list)  # List of ProjectPermission enums
    
    # Participation details
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ParticipantStatus), default=ParticipantStatus.OFFLINE)
    
    # Contribution tracking
    lines_contributed = Column(Integer, default=0)
    commits_made = Column(Integer, default=0)
    hours_contributed = Column(Float, default=0.0)
    
    # Relationships
    project = relationship("TeamProject", back_populates="participants")
    cursor_positions = relationship("CursorPosition", back_populates="participant", cascade="all, delete-orphan")

class CollaborationSession(Base):
    __tablename__ = "collaboration_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("team_projects.id"), nullable=False)
    session_name = Column(String, nullable=True)  # Optional session name
    
    # Session state
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    
    # Active participants
    active_participants = Column(JSON, default=list)  # List of user IDs currently in session
    active_files = Column(JSON, default=list)  # List of file IDs currently being edited
    
    # Communication state
    voice_channel_active = Column(Boolean, default=False)
    screen_share_active = Column(Boolean, default=False)
    screen_share_user = Column(String, nullable=True)  # User ID of person sharing screen
    
    # Relationships
    project = relationship("TeamProject", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ProjectFile(Base):
    __tablename__ = "project_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("team_projects.id"), nullable=False)
    
    # File details
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # file extension
    language = Column(String, nullable=True)  # programming language
    
    # Content and versioning
    content = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    last_modified_by = Column(String, nullable=True)
    last_modified_at = Column(DateTime, default=datetime.utcnow)
    
    # File permissions
    is_locked = Column(Boolean, default=False)
    locked_by = Column(String, nullable=True)  # User ID of person who locked the file
    locked_at = Column(DateTime, nullable=True)
    
    # Relationships
    project = relationship("TeamProject", back_populates="files")
    changes = relationship("FileChange", back_populates="file", cascade="all, delete-orphan")

class FileChange(Base):
    __tablename__ = "file_changes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey("project_files.id"), nullable=False)
    user_id = Column(String, nullable=False)
    
    # Change details
    change_type = Column(String, nullable=False)  # insert, delete, replace
    start_position = Column(Integer, nullable=False)
    end_position = Column(Integer, nullable=False)
    old_content = Column(Text, nullable=True)
    new_content = Column(Text, nullable=True)
    
    # Operational Transform data
    operation_id = Column(String, nullable=False)  # Unique ID for this operation
    parent_operation_id = Column(String, nullable=True)  # ID of parent operation for conflict resolution
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    applied_at = Column(DateTime, nullable=True)
    
    # Relationships
    file = relationship("ProjectFile", back_populates="changes")

class CursorPosition(Base):
    __tablename__ = "cursor_positions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String, ForeignKey("project_participants.id"), nullable=False)
    file_id = Column(String, ForeignKey("project_files.id"), nullable=False)
    
    # Position data
    line = Column(Integer, nullable=False)
    column = Column(Integer, nullable=False)
    selection_start = Column(Integer, nullable=True)
    selection_end = Column(Integer, nullable=True)
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    participant = relationship("ProjectParticipant", back_populates="cursor_positions")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("collaboration_sessions.id"), nullable=False)
    user_id = Column(String, nullable=False)
    
    # Message content
    message_type = Column(String, nullable=False, default="text")  # text, system, file_shared, etc.
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, default=dict)  # Additional message data
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="messages")

class TeamInvitation(Base):
    __tablename__ = "team_invitations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("team_projects.id"), nullable=False)
    invited_user_id = Column(String, nullable=False, index=True)
    invited_by = Column(String, nullable=False)
    
    # Invitation details
    role = Column(Enum(ProjectRole), nullable=False, default=ProjectRole.CONTRIBUTOR)
    message = Column(Text, nullable=True)
    
    # Status
    status = Column(String, nullable=False, default="pending")  # pending, accepted, declined, expired
    expires_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

class CollaborationStats(Base):
    __tablename__ = "collaboration_stats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    project_id = Column(String, ForeignKey("team_projects.id"), nullable=False)
    
    # Session statistics
    total_sessions = Column(Integer, default=0)
    total_hours = Column(Float, default=0.0)
    last_session_at = Column(DateTime, nullable=True)
    
    # Contribution statistics
    lines_written = Column(Integer, default=0)
    lines_deleted = Column(Integer, default=0)
    files_created = Column(Integer, default=0)
    files_modified = Column(Integer, default=0)
    
    # Communication statistics
    messages_sent = Column(Integer, default=0)
    voice_minutes = Column(Float, default=0.0)
    screen_share_minutes = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
