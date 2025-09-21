"""
Integrated Features API Endpoints
Combines all new features with existing WAY BIGGER architecture
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.gamification import UserProgress, Badge, UserBadge, XPTransaction
from app.models.collaboration import TeamProject, ProjectParticipant, CollaborationSession
from app.models.mentorship import MentorshipContext, MentorshipSession
from app.schemas.integrated_features import (
    UserDashboardResponse,
    FeatureUnlockRequest,
    CollaborationJoinRequest,
    MentorshipRequest,
    IndustryChallengeRegistration,
    PortfolioGenerationRequest
)

router = APIRouter()

# ==============================================
# INTEGRATED DASHBOARD ENDPOINTS
# ==============================================

@router.get("/dashboard", response_model=UserDashboardResponse)
async def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive user dashboard with all integrated features"""
    try:
        # Get user progress
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress:
            # Create initial progress if doesn't exist
            user_progress = UserProgress(
                user_id=str(current_user.id),
                level=1,
                total_xp=0,
                current_streak=0,
                longest_streak=0,
                skill_points={},
                unlocked_features=[]
            )
            db.add(user_progress)
            db.commit()
            db.refresh(user_progress)
        
        # Get recent badges
        recent_badges = db.query(UserBadge).join(Badge).filter(
            UserBadge.user_progress_id == user_progress.id
        ).order_by(UserBadge.earned_date.desc()).limit(5).all()
        
        # Get active collaborations
        active_collaborations = db.query(TeamProject).join(ProjectParticipant).filter(
            ProjectParticipant.user_id == str(current_user.id),
            ProjectParticipant.status == 'active'
        ).limit(3).all()
        
        # Get mentorship sessions
        mentorship_sessions = db.query(MentorshipSession).join(MentorshipContext).filter(
            MentorshipContext.user_id == str(current_user.id)
        ).order_by(MentorshipSession.scheduled_at.desc()).limit(3).all()
        
        return UserDashboardResponse(
            user=current_user,
            progress=user_progress,
            recent_badges=[badge.badge for badge in recent_badges],
            active_collaborations=active_collaborations,
            mentorship_sessions=mentorship_sessions,
            unlocked_features=user_progress.unlocked_features or [],
            level_progress={
                "current_level": user_progress.level,
                "total_xp": user_progress.total_xp,
                "xp_to_next_level": user_progress.level * 1000 - (user_progress.total_xp % (user_progress.level * 1000)),
                "percentage": ((user_progress.total_xp % (user_progress.level * 1000)) / (user_progress.level * 1000)) * 100
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard: {str(e)}"
        )

# ==============================================
# FEATURE UNLOCK SYSTEM
# ==============================================

@router.post("/features/unlock")
async def unlock_feature(
    request: FeatureUnlockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock a new feature based on user progress"""
    try:
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User progress not found"
            )
        
        # Check if feature is already unlocked
        if request.feature_name in (user_progress.unlocked_features or []):
            return {"message": "Feature already unlocked", "unlocked": True}
        
        # Check unlock requirements
        from app.models.gamification import FEATURE_UNLOCKS
        
        if request.feature_name not in FEATURE_UNLOCKS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feature not available for unlocking"
            )
        
        requirements = FEATURE_UNLOCKS[request.feature_name]
        
        # Check level requirement
        if user_progress.level < requirements.get("level", 1):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires level {requirements['level']}, current level: {user_progress.level}"
            )
        
        # Check projects completed requirement
        projects_completed = db.query(Submission).filter(
            Submission.user_id == current_user.id,
            Submission.status == "approved"
        ).count()
        
        if projects_completed < requirements.get("projects_completed", 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {requirements['projects_completed']} completed projects, current: {projects_completed}"
            )
        
        # Unlock the feature
        unlocked_features = user_progress.unlocked_features or []
        unlocked_features.append(request.feature_name)
        user_progress.unlocked_features = unlocked_features
        user_progress.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": f"Feature '{request.feature_name}' unlocked successfully!",
            "unlocked": True,
            "unlocked_features": unlocked_features
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlock feature: {str(e)}"
        )

# ==============================================
# COLLABORATION INTEGRATION
# ==============================================

@router.post("/collaboration/join")
async def join_collaboration(
    request: CollaborationJoinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a collaboration project with gamification rewards"""
    try:
        # Check if user has collaboration feature unlocked
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress or "collaboration" not in (user_progress.unlocked_features or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Collaboration feature not unlocked. Complete more projects to unlock it!"
            )
        
        # Check if project exists and has space
        project = db.query(TeamProject).filter(
            TeamProject.id == request.project_id
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check current participants
        current_participants = db.query(ProjectParticipant).filter(
            ProjectParticipant.project_id == request.project_id,
            ProjectParticipant.status == "active"
        ).count()
        
        if current_participants >= project.max_team_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project is full"
            )
        
        # Check if user is already a participant
        existing_participant = db.query(ProjectParticipant).filter(
            ProjectParticipant.project_id == request.project_id,
            ProjectParticipant.user_id == str(current_user.id)
        ).first()
        
        if existing_participant:
            if existing_participant.status == "active":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Already a participant in this project"
                )
            else:
                # Reactivate participant
                existing_participant.status = "active"
                existing_participant.joined_at = datetime.utcnow()
        else:
            # Create new participant
            participant = ProjectParticipant(
                project_id=request.project_id,
                user_id=str(current_user.id),
                role=request.role or "contributor",
                status="active"
            )
            db.add(participant)
        
        # Award XP for joining collaboration
        xp_reward = 50
        user_progress.total_xp += xp_reward
        user_progress.updated_at = datetime.utcnow()
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=xp_reward,
            source="collaboration_join",
            description=f"Joined collaboration project: {project.name}",
            transaction_metadata={"project_id": str(project.id), "project_name": project.name}
        )
        db.add(xp_transaction)
        
        db.commit()
        
        return {
            "message": f"Successfully joined project '{project.name}'!",
            "xp_earned": xp_reward,
            "project": {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "role": request.role or "contributor"
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join collaboration: {str(e)}"
        )

# ==============================================
# MENTORSHIP INTEGRATION
# ==============================================

@router.post("/mentorship/request")
async def request_mentorship(
    request: MentorshipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request mentorship with AI-powered matching"""
    try:
        # Check if user has mentorship feature unlocked
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress or "mentoring" not in (user_progress.unlocked_features or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Mentorship feature not unlocked. Reach level 10 to unlock it!"
            )
        
        # Create mentorship context
        context = MentorshipContext(
            user_id=str(current_user.id),
            mentor_id=request.mentor_id,
            context_type=request.context_type,
            context_data=request.context_data or {},
            status="pending"
        )
        db.add(context)
        db.commit()
        db.refresh(context)
        
        # Award XP for requesting mentorship
        xp_reward = 25
        user_progress.total_xp += xp_reward
        user_progress.updated_at = datetime.utcnow()
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=xp_reward,
            source="mentorship_request",
            description="Requested mentorship assistance",
            transaction_metadata={"context_id": str(context.id), "context_type": request.context_type}
        )
        db.add(xp_transaction)
        
        db.commit()
        
        return {
            "message": "Mentorship request submitted successfully!",
            "xp_earned": xp_reward,
            "context_id": str(context.id),
            "status": "pending"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request mentorship: {str(e)}"
        )

# ==============================================
# INDUSTRY CHALLENGES INTEGRATION
# ==============================================

@router.post("/challenges/register")
async def register_for_challenge(
    request: IndustryChallengeRegistration,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register for industry challenge with progress tracking"""
    try:
        # Check if user has industry challenges feature unlocked
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress or "industry_challenges" not in (user_progress.unlocked_features or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Industry challenges feature not unlocked. Complete more projects to unlock it!"
            )
        
        # Check if challenge exists and is active
        from app.models.industry_challenges import IndustryChallenge, ChallengeParticipant
        
        challenge = db.query(IndustryChallenge).filter(
            IndustryChallenge.id == request.challenge_id,
            IndustryChallenge.status == "active"
        ).first()
        
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found or not active"
            )
        
        # Check if user is already registered
        existing_participant = db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == request.challenge_id,
            ChallengeParticipant.user_id == str(current_user.id)
        ).first()
        
        if existing_participant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already registered for this challenge"
            )
        
        # Register for challenge
        participant = ChallengeParticipant(
            challenge_id=request.challenge_id,
            user_id=str(current_user.id),
            team_id=request.team_id,
            status="registered"
        )
        db.add(participant)
        
        # Award XP for registering
        xp_reward = 100
        user_progress.total_xp += xp_reward
        user_progress.updated_at = datetime.utcnow()
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=xp_reward,
            source="challenge_registration",
            description=f"Registered for challenge: {challenge.title}",
            transaction_metadata={"challenge_id": str(challenge.id), "challenge_title": challenge.title}
        )
        db.add(xp_transaction)
        
        db.commit()
        
        return {
            "message": f"Successfully registered for challenge '{challenge.title}'!",
            "xp_earned": xp_reward,
            "challenge": {
                "id": str(challenge.id),
                "title": challenge.title,
                "company": challenge.company,
                "deadline": challenge.submission_deadline
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register for challenge: {str(e)}"
        )

# ==============================================
# PORTFOLIO GENERATION INTEGRATION
# ==============================================

@router.post("/portfolio/generate")
async def generate_portfolio(
    request: PortfolioGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate living portfolio with AI assistance"""
    try:
        # Check if user has advanced portfolio feature unlocked
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress or "advanced_portfolio" not in (user_progress.unlocked_features or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Advanced portfolio feature not unlocked. Reach level 8 to unlock it!"
            )
        
        # Get user's projects and achievements
        user_projects = db.query(Submission).filter(
            Submission.user_id == current_user.id,
            Submission.status == "approved"
        ).all()
        
        user_badges = db.query(UserBadge).join(Badge).filter(
            UserBadge.user_progress_id == user_progress.id
        ).all()
        
        # Generate portfolio data
        portfolio_data = {
            "user_info": {
                "name": current_user.full_name,
                "username": current_user.username,
                "bio": current_user.bio,
                "avatar_url": current_user.avatar_url,
                "level": user_progress.level,
                "total_xp": user_progress.total_xp
            },
            "projects": [
                {
                    "id": str(project.id),
                    "title": project.project.title if project.project else "Unknown Project",
                    "description": project.project.description if project.project else "",
                    "technologies": project.project.tags if project.project else [],
                    "status": project.status,
                    "submitted_at": project.submitted_at.isoformat() if project.submitted_at else None
                }
                for project in user_projects
            ],
            "badges": [
                {
                    "name": badge.badge.name,
                    "description": badge.badge.description,
                    "icon": badge.badge.icon,
                    "earned_date": badge.earned_date.isoformat()
                }
                for badge in user_badges
            ],
            "skills": user_progress.skill_points or {},
            "achievements": {
                "level": user_progress.level,
                "total_xp": user_progress.total_xp,
                "current_streak": user_progress.current_streak,
                "longest_streak": user_progress.longest_streak
            }
        }
        
        # Save portfolio data
        from app.models.portfolio import UserPortfolio
        
        portfolio = UserPortfolio(
            user_id=str(current_user.id),
            template_id=request.template_id,
            portfolio_data=portfolio_data,
            is_public=request.is_public,
            custom_domain=request.custom_domain
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        
        # Award XP for portfolio generation
        xp_reward = 75
        user_progress.total_xp += xp_reward
        user_progress.updated_at = datetime.utcnow()
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=xp_reward,
            source="portfolio_generation",
            description="Generated living portfolio",
            transaction_metadata={"portfolio_id": str(portfolio.id), "template_id": str(request.template_id)}
        )
        db.add(xp_transaction)
        
        db.commit()
        
        # Trigger background portfolio generation
        background_tasks.add_task(generate_portfolio_assets, str(portfolio.id))
        
        return {
            "message": "Portfolio generation started!",
            "xp_earned": xp_reward,
            "portfolio_id": str(portfolio.id),
            "status": "generating"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate portfolio: {str(e)}"
        )

# ==============================================
# BACKGROUND TASKS
# ==============================================

async def generate_portfolio_assets(portfolio_id: str):
    """Background task to generate portfolio assets"""
    # This would integrate with your AI service to generate portfolio content
    # and file storage service to save generated assets
    pass

# ==============================================
# FEATURE STATUS ENDPOINTS
# ==============================================

@router.get("/features/status")
async def get_feature_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of all features for the current user"""
    try:
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == str(current_user.id)
        ).first()
        
        if not user_progress:
            return {"features": {}, "level": 1, "unlocked_features": []}
        
        from app.models.gamification import FEATURE_UNLOCKS
        
        feature_status = {}
        unlocked_features = user_progress.unlocked_features or []
        
        for feature_name, requirements in FEATURE_UNLOCKS.items():
            feature_status[feature_name] = {
                "unlocked": feature_name in unlocked_features,
                "requirements": requirements,
                "can_unlock": (
                    user_progress.level >= requirements.get("level", 1) and
                    db.query(Submission).filter(
                        Submission.user_id == current_user.id,
                        Submission.status == "approved"
                    ).count() >= requirements.get("projects_completed", 0)
                )
            }
        
        return {
            "features": feature_status,
            "level": user_progress.level,
            "unlocked_features": unlocked_features
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feature status: {str(e)}"
        )
