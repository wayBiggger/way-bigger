"""
Gamification Models
Database models for user progression, badges, achievements, and unlocks
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..core.database import Base

class UserProgress(Base):
    __tablename__ = "user_progress"
    __table_args__ = {'extend_existing': True}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    total_xp = Column(Integer, default=0, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    skill_points = Column(JSON, default=dict)  # {"python": 100, "javascript": 50, ...}
    unlocked_features = Column(JSON, default=list)  # ["collaboration", "mentoring", ...]
    last_active_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")
    badges = relationship("UserBadge", back_populates="user_progress")
    xp_transactions = relationship("XPTransaction", back_populates="user_progress")
    streak_history = relationship("StreakHistory", back_populates="user_progress")

class Badge(Base):
    __tablename__ = "badges"
    __table_args__ = {'extend_existing': True}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)  # Icon identifier
    category = Column(String(20), nullable=False)  # completion, skill, social, special
    rarity = Column(String(20), default="common")  # common, rare, epic, legendary
    xp_reward = Column(Integer, default=0)
    requirements = Column(JSON, default=dict)  # {"projects_completed": 5, "streak_days": 7}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")

class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = {'extend_existing': True}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_progress_id = Column(String, ForeignKey("user_progress.id"), nullable=False)
    badge_id = Column(String, ForeignKey("badges.id"), nullable=False)
    earned_date = Column(DateTime, default=datetime.utcnow)
    is_featured = Column(Boolean, default=False)  # Show on profile
    
    # Relationships
    user_progress = relationship("UserProgress", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_progress_id = Column(String, ForeignKey("user_progress.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False)  # project_complete, streak, collaboration, etc.
    description = Column(String(200), nullable=False)
    transaction_metadata = Column(JSON, default=dict)  # Additional context
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_progress = relationship("UserProgress", back_populates="xp_transactions")

class StreakHistory(Base):
    __tablename__ = "streak_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_progress_id = Column(String, ForeignKey("user_progress.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    activity_type = Column(String(50), nullable=False)  # coding, project_complete, login
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_progress = relationship("UserProgress", back_populates="streak_history")

class UnlockableFeature(Base):
    __tablename__ = "unlockable_features"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)
    requirements = Column(JSON, nullable=False)  # {"level": 3, "projects_completed": 5}
    category = Column(String(30), nullable=False)  # collaboration, mentoring, challenges, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Leaderboard(Base):
    __tablename__ = "leaderboards"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period = Column(String(20), nullable=False)  # weekly, monthly, all_time
    category = Column(String(30), nullable=False)  # xp, streak, projects, collaboration
    rank = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class SkillTree(Base):
    __tablename__ = "skill_trees"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)
    color = Column(String(7), nullable=False)  # Hex color
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SkillNode(Base):
    __tablename__ = "skill_nodes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    skill_tree_id = Column(String, ForeignKey("skill_trees.id"), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)
    level = Column(Integer, nullable=False)  # 1-5
    xp_cost = Column(Integer, nullable=False)
    requirements = Column(JSON, default=dict)  # {"prerequisite_nodes": [], "min_level": 1}
    benefits = Column(JSON, default=dict)  # {"xp_multiplier": 1.1, "unlock_feature": "advanced_editor"}
    position_x = Column(Float, nullable=False)  # For UI positioning
    position_y = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    skill_tree = relationship("SkillTree")

class UserSkillNode(Base):
    __tablename__ = "user_skill_nodes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_progress_id = Column(String, ForeignKey("user_progress.id"), nullable=False)
    skill_node_id = Column(String, ForeignKey("skill_nodes.id"), nullable=False)
    unlocked_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_progress = relationship("UserProgress")
    skill_node = relationship("SkillNode")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)
    category = Column(String(30), nullable=False)
    rarity = Column(String(20), default="common")
    xp_reward = Column(Integer, default=0)
    requirements = Column(JSON, nullable=False)
    is_hidden = Column(Boolean, default=False)  # Secret achievements
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_progress_id = Column(String, ForeignKey("user_progress.id"), nullable=False)
    achievement_id = Column(String, ForeignKey("achievements.id"), nullable=False)
    earned_date = Column(DateTime, default=datetime.utcnow)
    progress = Column(Integer, default=0)  # For progress tracking
    
    # Relationships
    user_progress = relationship("UserProgress")
    achievement = relationship("Achievement")

# XP Rewards Configuration
XP_REWARDS = {
    "PROJECT_COMPLETE": 100,
    "PROJECT_COMPLETE_BEGINNER": 75,
    "PROJECT_COMPLETE_INTERMEDIATE": 125,
    "PROJECT_COMPLETE_ADVANCED": 200,
    "STREAK_DAY": 25,
    "STREAK_WEEK": 200,
    "STREAK_MONTH": 1000,
    "COLLABORATION_JOIN": 150,
    "COLLABORATION_COMPLETE": 300,
    "HELP_PEER": 50,
    "CODE_QUALITY_HIGH": 75,
    "CODE_QUALITY_PERFECT": 150,
    "INDUSTRY_PROJECT": 250,
    "FIRST_PROJECT": 200,
    "DAILY_LOGIN": 10,
    "WEEKLY_GOAL": 500,
    "MONTHLY_GOAL": 2000,
    "SKILL_NODE_UNLOCK": 50,
    "BADGE_EARNED": 25,
    "ACHIEVEMENT_EARNED": 100,
    "LEADERBOARD_TOP_10": 100,
    "LEADERBOARD_TOP_3": 250,
    "LEADERBOARD_FIRST": 500
}

# Level Requirements (XP needed for each level)
LEVEL_REQUIREMENTS = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000,
    7: 1350,
    8: 1750,
    9: 2200,
    10: 2700,
    11: 3250,
    12: 3850,
    13: 4500,
    14: 5200,
    15: 5950,
    16: 6750,
    17: 7600,
    18: 8500,
    19: 9450,
    20: 10450,
    21: 11500,
    22: 12600,
    23: 13750,
    24: 14950,
    25: 16200,
    26: 17500,
    27: 18850,
    28: 20250,
    29: 21700,
    30: 23200,
    31: 24750,
    32: 26350,
    33: 28000,
    34: 29700,
    35: 31450,
    36: 33250,
    37: 35100,
    38: 37000,
    39: 38950,
    40: 40950,
    41: 43000,
    42: 45100,
    43: 47250,
    44: 49450,
    45: 51700,
    46: 54000,
    47: 56350,
    48: 58750,
    49: 61200,
    50: 63700
}

# Feature Unlock Requirements
FEATURE_UNLOCKS = {
    "collaboration": {"level": 3, "projects_completed": 5},
    "mentoring": {"level": 10, "projects_completed": 15},
    "industry_challenges": {"level": 15, "projects_completed": 25},
    "portfolio_certification": {"level": 25, "projects_completed": 50},
    "advanced_editor": {"level": 5, "projects_completed": 10},
    "team_formation": {"level": 8, "projects_completed": 12},
    "custom_projects": {"level": 12, "projects_completed": 20},
    "ai_assistant_advanced": {"level": 18, "projects_completed": 30}
}
