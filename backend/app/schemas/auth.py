from pydantic import BaseModel, EmailStr
from typing import Union, Optional


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class OnboardingField(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class OnboardingProficiencyLevel(BaseModel):
    id: int
    level: str
    display_name: str
    description: str
    estimated_weeks: Optional[int] = None


class FieldSelectionRequest(BaseModel):
    field_id: int


class ProficiencySelectionRequest(BaseModel):
    proficiency_level_id: int


class OnboardingStatus(BaseModel):
    onboarding_completed: bool
    selected_field: Optional[str] = None
    proficiency_level: Optional[str] = None
    current_step: str  # "welcome", "field_selection", "proficiency_selection", "completed"


class UserProfile(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    reputation_score: int
    total_points: int
    onboarding_completed: bool
    selected_field: Optional[str] = None
    proficiency_level: Optional[str] = None
