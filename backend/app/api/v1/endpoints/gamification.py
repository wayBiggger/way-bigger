"""
Gamification API Endpoints
Handles user progression, badges, achievements, and leaderboards
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import uuid

from ....core.database import get_db
from ....models.user import User
from ....models.gamification import (
    UserProgress, Badge, UserBadge, XPTransaction, StreakHistory,
    UnlockableFeature, Leaderboard, SkillTree, SkillNode, UserSkillNode,
    Achievement, UserAchievement, XP_REWARDS, LEVEL_REQUIREMENTS, FEATURE_UNLOCKS
)
from ....core.security import get_current_user, get_optional_user

router = APIRouter()

@router.get("/progress/{user_id}")
async def get_user_progress(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's gamification progress"""
    try:
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        
        if not user_progress:
            # Create initial progress for new user
            user_progress = UserProgress(
                user_id=user_id,
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
        
        # Calculate level progress
        current_level_xp = LEVEL_REQUIREMENTS.get(user_progress.level, 0)
        next_level_xp = LEVEL_REQUIREMENTS.get(user_progress.level + 1, current_level_xp)
        xp_to_next_level = next_level_xp - user_progress.total_xp
        xp_for_current_level = next_level_xp - current_level_xp
        xp_progress = user_progress.total_xp - current_level_xp
        level_progress_percentage = (xp_progress / xp_for_current_level * 100) if xp_for_current_level > 0 else 100
        
        # Get recent badges
        recent_badges = db.query(UserBadge, Badge).join(Badge).filter(
            UserBadge.user_progress_id == user_progress.id
        ).order_by(desc(UserBadge.earned_date)).limit(5).all()
        
        # Get recent XP transactions
        recent_xp = db.query(XPTransaction).filter(
            XPTransaction.user_progress_id == user_progress.id
        ).order_by(desc(XPTransaction.created_at)).limit(10).all()
        
        return {
            "user_id": user_progress.user_id,
            "level": user_progress.level,
            "total_xp": user_progress.total_xp,
            "current_streak": user_progress.current_streak,
            "longest_streak": user_progress.longest_streak,
            "skill_points": user_progress.skill_points,
            "unlocked_features": user_progress.unlocked_features,
            "last_active_date": user_progress.last_active_date,
            "level_progress": {
                "current_level_xp": current_level_xp,
                "next_level_xp": next_level_xp,
                "xp_to_next_level": xp_to_next_level,
                "xp_progress": xp_progress,
                "percentage": level_progress_percentage
            },
            "recent_badges": [
                {
                    "id": badge.id,
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "rarity": badge.rarity,
                    "earned_date": user_badge.earned_date
                }
                for user_badge, badge in recent_badges
            ],
            "recent_xp": [
                {
                    "amount": xp.amount,
                    "source": xp.source,
                    "description": xp.description,
                    "created_at": xp.created_at
                }
                for xp in recent_xp
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user progress: {str(e)}")

@router.post("/xp/award")
async def award_xp(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Award XP to user for specific actions"""
    try:
        user_id = str(current_user.id)
        source = request.get("source")
        amount = request.get("amount", 0)
        description = request.get("description", "")
        metadata = request.get("metadata", {})
        
        if not source or amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid XP award request")
        
        # Get or create user progress
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not user_progress:
            user_progress = UserProgress(
                user_id=user_id,
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
        
        # Award XP
        user_progress.total_xp += amount
        user_progress.updated_at = datetime.utcnow()
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=amount,
            source=source,
            description=description,
            transaction_metadata=metadata
        )
        db.add(xp_transaction)
        
        # Check for level up
        old_level = user_progress.level
        new_level = calculate_level(user_progress.total_xp)
        leveled_up = new_level > old_level
        
        if leveled_up:
            user_progress.level = new_level
            # Award level up XP bonus
            level_bonus = new_level * 50
            user_progress.total_xp += level_bonus
            
            level_bonus_transaction = XPTransaction(
                user_progress_id=user_progress.id,
                amount=level_bonus,
                source="level_up",
                description=f"Level {new_level} bonus!",
                metadata={"level": new_level}
            )
            db.add(level_bonus_transaction)
        
        # Check for new unlocks
        new_unlocks = check_feature_unlocks(user_progress)
        if new_unlocks:
            user_progress.unlocked_features.extend(new_unlocks)
        
        # Check for badge eligibility
        new_badges = await check_badge_eligibility(user_progress, db)
        
        db.commit()
        
        return {
            "success": True,
            "amount_awarded": amount,
            "total_xp": user_progress.total_xp,
            "level": user_progress.level,
            "leveled_up": leveled_up,
            "new_unlocks": new_unlocks,
            "new_badges": new_badges,
            "xp_transaction_id": str(xp_transaction.id)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to award XP: {str(e)}")

@router.post("/streak/update")
async def update_streak(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's daily streak"""
    try:
        user_id = str(current_user.id)
        activity_type = request.get("activity_type", "login")
        
        # Get user progress
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not user_progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        today = datetime.utcnow().date()
        last_active = user_progress.last_active_date.date() if user_progress.last_active_date else None
        
        # Check if streak should continue or reset
        if last_active == today:
            # Already active today, no change
            return {"success": True, "current_streak": user_progress.current_streak, "streak_updated": False}
        elif last_active == today - timedelta(days=1):
            # Consecutive day, increment streak
            user_progress.current_streak += 1
            streak_updated = True
        else:
            # Streak broken, reset to 1
            user_progress.current_streak = 1
            streak_updated = True
        
        # Update longest streak
        if user_progress.current_streak > user_progress.longest_streak:
            user_progress.longest_streak = user_progress.current_streak
        
        user_progress.last_active_date = datetime.utcnow()
        
        # Award streak XP
        streak_xp = XP_REWARDS.get("STREAK_DAY", 25)
        user_progress.total_xp += streak_xp
        
        # Create streak record
        streak_record = StreakHistory(
            user_progress_id=user_progress.id,
            date=datetime.utcnow(),
            activity_type=activity_type,
            xp_earned=streak_xp
        )
        db.add(streak_record)
        
        # Create XP transaction
        xp_transaction = XPTransaction(
            user_progress_id=user_progress.id,
            amount=streak_xp,
            source="streak",
            description=f"Daily streak day {user_progress.current_streak}",
            transaction_metadata={"streak_day": user_progress.current_streak}
        )
        db.add(xp_transaction)
        
        # Check for streak milestones
        streak_milestones = [7, 30, 100]
        if user_progress.current_streak in streak_milestones:
            milestone_xp = XP_REWARDS.get("STREAK_WEEK", 200) if user_progress.current_streak == 7 else \
                          XP_REWARDS.get("STREAK_MONTH", 1000) if user_progress.current_streak == 30 else \
                          XP_REWARDS.get("STREAK_MONTH", 1000) * 2  # 100 days
            
            user_progress.total_xp += milestone_xp
            
            milestone_transaction = XPTransaction(
                user_progress_id=user_progress.id,
                amount=milestone_xp,
                source="streak_milestone",
                description=f"{user_progress.current_streak} day streak milestone!",
                metadata={"streak_days": user_progress.current_streak}
            )
            db.add(milestone_transaction)
        
        db.commit()
        
        return {
            "success": True,
            "current_streak": user_progress.current_streak,
            "longest_streak": user_progress.longest_streak,
            "streak_updated": streak_updated,
            "xp_earned": streak_xp
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update streak: {str(e)}")

@router.get("/badges/{user_id}")
async def get_user_badges(
    user_id: str,
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's badges"""
    try:
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not user_progress:
            return {"badges": []}
        
        query = db.query(UserBadge, Badge).join(Badge).filter(
            UserBadge.user_progress_id == user_progress.id
        )
        
        if category:
            query = query.filter(Badge.category == category)
        
        badges = query.order_by(desc(UserBadge.earned_date)).all()
        
        return {
            "badges": [
                {
                    "id": str(user_badge.id),
                    "badge_id": str(badge.id),
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "category": badge.category,
                    "rarity": badge.rarity,
                    "earned_date": user_badge.earned_date,
                    "is_featured": user_badge.is_featured
                }
                for user_badge, badge in badges
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user badges: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(
    period: str = Query("weekly"),
    category: str = Query("xp"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get leaderboard data"""
    try:
        # Calculate period dates
        now = datetime.utcnow()
        if period == "weekly":
            start_date = now - timedelta(days=7)
        elif period == "monthly":
            start_date = now - timedelta(days=30)
        else:  # all_time
            start_date = datetime.min
        
        # Get leaderboard data based on category
        if category == "xp":
            leaderboard_data = db.query(
                User.username,
                UserProgress.total_xp,
                UserProgress.level,
                UserProgress.current_streak
            ).join(UserProgress).order_by(desc(UserProgress.total_xp)).limit(limit).all()
        elif category == "streak":
            leaderboard_data = db.query(
                User.username,
                UserProgress.current_streak,
                UserProgress.total_xp,
                UserProgress.level
            ).join(UserProgress).order_by(desc(UserProgress.current_streak)).limit(limit).all()
        elif category == "projects":
            # This would require joining with projects table
            leaderboard_data = db.query(
                User.username,
                UserProgress.total_xp,
                UserProgress.level,
                UserProgress.current_streak
            ).join(UserProgress).order_by(desc(UserProgress.total_xp)).limit(limit).all()
        else:
            raise HTTPException(status_code=400, detail="Invalid category")
        
        # Format leaderboard data
        leaderboard = []
        for i, row in enumerate(leaderboard_data, 1):
            leaderboard.append({
                "rank": i,
                "username": row.username,
                "score": getattr(row, category) if hasattr(row, category) else row.total_xp,
                "level": row.level,
                "total_xp": row.total_xp,
                "current_streak": row.current_streak
            })
        
        return {
            "period": period,
            "category": category,
            "leaderboard": leaderboard,
            "generated_at": now
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

@router.get("/unlocks/{user_id}")
async def get_user_unlocks(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's unlocked features"""
    try:
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not user_progress:
            return {"unlocked_features": [], "available_unlocks": []}
        
        # Get all unlockable features
        all_features = db.query(UnlockableFeature).filter(UnlockableFeature.is_active == True).all()
        
        unlocked_features = user_progress.unlocked_features or []
        available_unlocks = []
        
        for feature in all_features:
            if feature.name not in unlocked_features:
                # Check if user meets requirements
                requirements = feature.requirements
                meets_requirements = True
                
                if "level" in requirements and user_progress.level < requirements["level"]:
                    meets_requirements = False
                if "projects_completed" in requirements:
                    # This would require counting completed projects
                    # For now, we'll use a placeholder
                    projects_completed = 0  # TODO: Implement actual project counting
                    if projects_completed < requirements["projects_completed"]:
                        meets_requirements = False
                
                if meets_requirements:
                    available_unlocks.append({
                        "name": feature.name,
                        "display_name": feature.display_name,
                        "description": feature.description,
                        "icon": feature.icon,
                        "category": feature.category,
                        "requirements": requirements
                    })
        
        return {
            "unlocked_features": unlocked_features,
            "available_unlocks": available_unlocks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user unlocks: {str(e)}")

@router.post("/badges/feature")
async def feature_badge(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Feature or unfeature a badge on user's profile"""
    try:
        user_id = str(current_user.id)
        badge_id = request.get("badge_id")
        is_featured = request.get("is_featured", True)
        
        if not badge_id:
            raise HTTPException(status_code=400, detail="Badge ID is required")
        
        user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not user_progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        user_badge = db.query(UserBadge).filter(
            UserBadge.user_progress_id == user_progress.id,
            UserBadge.badge_id == badge_id
        ).first()
        
        if not user_badge:
            raise HTTPException(status_code=404, detail="Badge not found")
        
        user_badge.is_featured = is_featured
        db.commit()
        
        return {"success": True, "is_featured": is_featured}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to feature badge: {str(e)}")

# Helper functions
def calculate_level(total_xp: int) -> int:
    """Calculate user level based on total XP"""
    for level, required_xp in sorted(LEVEL_REQUIREMENTS.items(), reverse=True):
        if total_xp >= required_xp:
            return level
    return 1

def check_feature_unlocks(user_progress: UserProgress) -> List[str]:
    """Check if user has unlocked any new features"""
    new_unlocks = []
    current_unlocks = user_progress.unlocked_features or []
    
    for feature_name, requirements in FEATURE_UNLOCKS.items():
        if feature_name not in current_unlocks:
            meets_requirements = True
            
            if "level" in requirements and user_progress.level < requirements["level"]:
                meets_requirements = False
            if "projects_completed" in requirements:
                # This would require actual project counting
                # For now, we'll use a placeholder
                projects_completed = 0  # TODO: Implement actual project counting
                if projects_completed < requirements["projects_completed"]:
                    meets_requirements = False
            
            if meets_requirements:
                new_unlocks.append(feature_name)
    
    return new_unlocks

async def check_badge_eligibility(user_progress: UserProgress, db: Session) -> List[Dict[str, Any]]:
    """Check if user is eligible for any new badges"""
    new_badges = []
    
    # Get all badges user doesn't have
    user_badge_ids = db.query(UserBadge.badge_id).filter(
        UserBadge.user_progress_id == user_progress.id
    ).all()
    user_badge_ids = [str(badge_id[0]) for badge_id in user_badge_ids]
    
    available_badges = db.query(Badge).filter(
        Badge.is_active == True,
        ~Badge.id.in_(user_badge_ids)
    ).all()
    
    for badge in available_badges:
        requirements = badge.requirements
        eligible = True
        
        # Check requirements
        if "level" in requirements and user_progress.level < requirements["level"]:
            eligible = False
        if "total_xp" in requirements and user_progress.total_xp < requirements["total_xp"]:
            eligible = False
        if "streak_days" in requirements and user_progress.current_streak < requirements["streak_days"]:
            eligible = False
        if "projects_completed" in requirements:
            # This would require actual project counting
            projects_completed = 0  # TODO: Implement actual project counting
            if projects_completed < requirements["projects_completed"]:
                eligible = False
        
        if eligible:
            # Award badge
            user_badge = UserBadge(
                user_progress_id=user_progress.id,
                badge_id=badge.id,
                earned_date=datetime.utcnow()
            )
            db.add(user_badge)
            
            # Award XP for badge
            if badge.xp_reward > 0:
                user_progress.total_xp += badge.xp_reward
                
                xp_transaction = XPTransaction(
                    user_progress_id=user_progress.id,
                    amount=badge.xp_reward,
                    source="badge_earned",
                    description=f"Badge earned: {badge.name}",
                    metadata={"badge_id": str(badge.id)}
                )
                db.add(xp_transaction)
            
            new_badges.append({
                "id": str(badge.id),
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "rarity": badge.rarity,
                "xp_reward": badge.xp_reward
            })
    
    return new_badges
