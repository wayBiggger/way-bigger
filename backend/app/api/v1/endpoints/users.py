from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.entities import Field, ProficiencyLevel
from app.schemas.auth import UserProfile, OnboardingField, OnboardingProficiencyLevel, FieldSelectionRequest, ProficiencySelectionRequest, OnboardingStatus, UserCreate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=list[dict])
async def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "created_at": user.created_at
    }

@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int, 
    user_data: UserCreate, 
    db: Session = Depends(get_db)
):
    """Update user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    user.email = user_data.email
    user.username = user_data.username
    user.full_name = user_data.full_name
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User updated successfully", "user_id": user.id}

@router.delete("/{user_id}", response_model=dict)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.get("/onboarding/status", response_model=OnboardingStatus)
async def get_onboarding_status(current_user: User = Depends(get_current_user)):
    """Get current user's onboarding status"""
    if not current_user.onboarding_completed:
        if not current_user.selected_field:
            current_step = "field_selection"
        elif not current_user.proficiency_level:
            current_step = "proficiency_selection"
        else:
            current_step = "completed"
    else:
        current_step = "completed"
    
    return OnboardingStatus(
        onboarding_completed=current_user.onboarding_completed,
        selected_field=current_user.selected_field,
        proficiency_level=current_user.proficiency_level,
        current_step=current_step
    )

@router.get("/onboarding/fields", response_model=List[OnboardingField])
async def get_available_fields(db: Session = Depends(get_db)):
    """Get all available fields for onboarding"""
    fields = db.query(Field).filter(Field.is_active == True).all()
    return fields

@router.get("/onboarding/fields/{field_id}/proficiency-levels", response_model=List[OnboardingProficiencyLevel])
async def get_proficiency_levels_for_field(field_id: int, db: Session = Depends(get_db)):
    """Get proficiency levels for a specific field"""
    levels = db.query(ProficiencyLevel).filter(ProficiencyLevel.field_id == field_id).all()
    if not levels:
        raise HTTPException(status_code=404, detail="Field not found or no proficiency levels available")
    return levels

@router.post("/onboarding/select-field")
async def select_field(
    request: FieldSelectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Select a field during onboarding"""
    # Verify field exists
    field = db.query(Field).filter(Field.id == request.field_id, Field.is_active == True).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Update user's selected field
    current_user.selected_field = field.name
    db.commit()
    
    return {"message": f"Field '{field.display_name}' selected successfully"}

@router.post("/onboarding/select-proficiency")
async def select_proficiency_level(
    request: ProficiencySelectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Select proficiency level during onboarding"""
    if not current_user.selected_field:
        raise HTTPException(status_code=400, detail="Must select a field first")
    
    # Verify proficiency level exists for the selected field
    level = db.query(ProficiencyLevel).filter(
        ProficiencyLevel.id == request.proficiency_level_id,
        ProficiencyLevel.field_id == db.query(Field.id).filter(Field.name == current_user.selected_field).scalar()
    ).first()
    
    if not level:
        raise HTTPException(status_code=404, detail="Proficiency level not found for selected field")
    
    # Update user's proficiency level and mark onboarding as complete
    current_user.proficiency_level = level.level
    current_user.onboarding_completed = True
    db.commit()
    
    return {"message": f"Proficiency level '{level.display_name}' selected successfully. Onboarding completed!"}

@router.get("/projects/recommended")
async def get_recommended_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get projects recommended based on user's field and proficiency level"""
    if not current_user.onboarding_completed:
        raise HTTPException(status_code=400, detail="Must complete onboarding first")
    
    # This would typically query projects based on user preferences
    # For now, return a simple message
    return {
        "message": f"Showing {current_user.proficiency_level} level projects in {current_user.selected_field}",
        "user_preferences": {
            "field": current_user.selected_field,
            "proficiency": current_user.proficiency_level
        }
    }
