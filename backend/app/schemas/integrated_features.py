"""
Integrated Features Schemas
Pydantic models for all integrated features
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

# ==============================================
# ENUMS
# ==============================================

class FeatureStatus(str, Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    CAN_UNLOCK = "can_unlock"

class CollaborationRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    CONTRIBUTOR = "contributor"
    VIEWER = "viewer"

class MentorshipContextType(str, Enum):
    PROJECT_HELP = "project_help"
    CAREER_GUIDANCE = "career_guidance"
    CODE_REVIEW = "code_review"
    LEARNING_PATH = "learning_path"

class ChallengeStatus(str, Enum):
    ACTIVE = "active"
    UPCOMING = "upcoming"
    ENDED = "ended"
    CANCELLED = "cancelled"

class PortfolioTemplateType(str, Enum):
    DEVELOPER = "developer"
    DESIGNER = "designer"
    DATA_SCIENTIST = "data_scientist"
    FULL_STACK = "full_stack"

# ==============================================
# BASE MODELS
# ==============================================

class UserProfile(BaseModel):
    id: str
    username: str
    full_name: str
    email: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    level: int = 1
    total_xp: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    unlocked_features: List[str] = []

class LevelProgress(BaseModel):
    current_level: int
    total_xp: int
    xp_to_next_level: int
    percentage: float

class BadgeInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str
    rarity: str
    earned_date: datetime

class ProjectInfo(BaseModel):
    id: str
    name: str
    description: str
    difficulty_level: str
    status: str
    created_at: datetime

class MentorshipSessionInfo(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    session_type: str
    scheduled_at: Optional[datetime] = None
    status: str

# ==============================================
# DASHBOARD RESPONSES
# ==============================================

class UserDashboardResponse(BaseModel):
    user: UserProfile
    progress: Dict[str, Any]
    recent_badges: List[BadgeInfo]
    active_collaborations: List[ProjectInfo]
    mentorship_sessions: List[MentorshipSessionInfo]
    unlocked_features: List[str]
    level_progress: LevelProgress

# ==============================================
# FEATURE UNLOCK REQUESTS
# ==============================================

class FeatureUnlockRequest(BaseModel):
    feature_name: str = Field(..., description="Name of the feature to unlock")

class FeatureUnlockResponse(BaseModel):
    message: str
    unlocked: bool
    unlocked_features: List[str]

# ==============================================
# COLLABORATION REQUESTS
# ==============================================

class CollaborationJoinRequest(BaseModel):
    project_id: str = Field(..., description="ID of the project to join")
    role: Optional[CollaborationRole] = CollaborationRole.CONTRIBUTOR

class CollaborationJoinResponse(BaseModel):
    message: str
    xp_earned: int
    project: ProjectInfo

class CollaborationCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    difficulty_level: str
    max_team_size: int = Field(5, ge=2, le=20)
    min_team_size: int = Field(2, ge=1, le=10)
    is_public: bool = True

class CollaborationCreateResponse(BaseModel):
    message: str
    project: ProjectInfo

# ==============================================
# MENTORSHIP REQUESTS
# ==============================================

class MentorshipRequest(BaseModel):
    mentor_id: Optional[str] = None
    context_type: MentorshipContextType
    context_data: Optional[Dict[str, Any]] = {}

class MentorshipRequestResponse(BaseModel):
    message: str
    xp_earned: int
    context_id: str
    status: str

class MentorshipSessionCreateRequest(BaseModel):
    context_id: str
    title: str
    description: Optional[str] = None
    session_type: str = "video_call"
    scheduled_at: Optional[datetime] = None
    duration_minutes: int = Field(60, ge=15, le=240)

class MentorshipSessionCreateResponse(BaseModel):
    message: str
    session: MentorshipSessionInfo

# ==============================================
# INDUSTRY CHALLENGES REQUESTS
# ==============================================

class IndustryChallengeRegistration(BaseModel):
    challenge_id: str = Field(..., description="ID of the challenge to register for")
    team_id: Optional[str] = None

class IndustryChallengeRegistrationResponse(BaseModel):
    message: str
    xp_earned: int
    challenge: Dict[str, Any]

class IndustryChallengeCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    company: Optional[str] = None
    industry: str
    difficulty_level: str
    duration_days: Optional[int] = Field(None, ge=1, le=365)
    prize_amount: Optional[float] = Field(None, ge=0)
    requirements: Dict[str, Any]
    evaluation_criteria: Dict[str, Any]
    submission_deadline: Optional[datetime] = None

class IndustryChallengeCreateResponse(BaseModel):
    message: str
    challenge: Dict[str, Any]

# ==============================================
# PORTFOLIO REQUESTS
# ==============================================

class PortfolioGenerationRequest(BaseModel):
    template_id: Optional[str] = None
    is_public: bool = True
    custom_domain: Optional[str] = None

class PortfolioGenerationResponse(BaseModel):
    message: str
    xp_earned: int
    portfolio_id: str
    status: str

class PortfolioUpdateRequest(BaseModel):
    portfolio_data: Dict[str, Any]
    is_public: Optional[bool] = None
    custom_domain: Optional[str] = None

class PortfolioUpdateResponse(BaseModel):
    message: str
    portfolio: Dict[str, Any]

# ==============================================
# FILE STORAGE REQUESTS
# ==============================================

class FileUploadRequest(BaseModel):
    file_name: str
    file_type: str
    is_public: bool = False
    metadata: Optional[Dict[str, Any]] = {}

class FileUploadResponse(BaseModel):
    message: str
    file_id: str
    file_url: str

class FileDownloadRequest(BaseModel):
    file_id: str

class FileDownloadResponse(BaseModel):
    file_url: str
    expires_at: Optional[datetime] = None

# ==============================================
# MONACO EDITOR REQUESTS
# ==============================================

class EditorRestrictionRequest(BaseModel):
    project_id: str
    restriction_type: str
    restriction_data: Dict[str, Any]

class EditorRestrictionResponse(BaseModel):
    message: str
    restrictions: List[Dict[str, Any]]

# ==============================================
# FEATURE STATUS RESPONSES
# ==============================================

class FeatureRequirement(BaseModel):
    level: int
    projects_completed: int

class FeatureStatus(BaseModel):
    unlocked: bool
    requirements: FeatureRequirement
    can_unlock: bool

class FeatureStatusResponse(BaseModel):
    features: Dict[str, FeatureStatus]
    level: int
    unlocked_features: List[str]

# ==============================================
# GAMIFICATION RESPONSES
# ==============================================

class XPAwardRequest(BaseModel):
    source: str
    amount: int
    description: str
    metadata: Optional[Dict[str, Any]] = {}

class XPAwardResponse(BaseModel):
    message: str
    xp_earned: int
    new_total_xp: int
    level_up: bool
    new_level: Optional[int] = None

class BadgeEarnedResponse(BaseModel):
    message: str
    badge: BadgeInfo
    xp_earned: int

# ==============================================
# NOTIFICATION RESPONSES
# ==============================================

class NotificationRequest(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    data: Optional[Dict[str, Any]] = {}

class NotificationResponse(BaseModel):
    message: str
    notification_id: str

# ==============================================
# ANALYTICS RESPONSES
# ==============================================

class UserAnalyticsRequest(BaseModel):
    period: str = "week"  # week, month, year
    metrics: List[str] = ["xp_earned", "projects_completed", "badges_earned"]

class UserAnalyticsResponse(BaseModel):
    period: str
    metrics: Dict[str, Any]
    charts_data: Dict[str, List[Dict[str, Any]]]

# ==============================================
# ERROR RESPONSES
# ==============================================

class ErrorResponse(BaseModel):
    error: str
    detail: str
    code: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ValidationErrorResponse(BaseModel):
    error: str = "Validation Error"
    detail: str
    field_errors: Dict[str, List[str]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
