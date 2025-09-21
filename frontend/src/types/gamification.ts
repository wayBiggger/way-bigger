/**
 * Gamification Types and Interfaces
 * Defines the structure for user progression, badges, achievements, and unlocks
 */

export interface UserProgress {
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  skill_points: Record<string, number>;
  unlocked_features: string[];
  last_active_date: string;
  level_progress: {
    current_level_xp: number;
    next_level_xp: number;
    xp_to_next_level: number;
    xp_progress: number;
    percentage: number;
  };
  recent_badges: Badge[];
  recent_xp: XPTransaction[];
}

export interface Badge {
  id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'skill' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_date: string;
  is_featured: boolean;
  xp_reward?: number;
}

export interface XPTransaction {
  amount: number;
  source: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const XP_REWARDS = {
  PROJECT_COMPLETE: 100,
  STREAK_DAY: 25,
  STREAK_WEEK: 200,
  COLLABORATION_JOIN: 150,
  HELP_PEER: 50,
  CODE_QUALITY_HIGH: 75,
  INDUSTRY_PROJECT: 250,
  FIRST_PROJECT: 50,
  WEEKLY_STREAK: 100,
  MONTHLY_STREAK: 500,
  COLLABORATION_MASTER: 200,
  MENTOR_HELP: 75,
  BUG_FIX: 25,
  FEATURE_ADD: 50,
  CODE_REVIEW: 30,
  DOCUMENTATION: 40,
  TESTING: 35,
  REFACTORING: 45,
  LEARNING_NEW_TECH: 60,
  COMMUNITY_CONTRIBUTION: 80
} as const;

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_updated: boolean;
  xp_earned: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  total_xp: number;
  current_streak: number;
}

export interface Leaderboard {
  period: 'weekly' | 'monthly' | 'all_time';
  category: 'xp' | 'streak' | 'projects' | 'collaboration';
  leaderboard: LeaderboardEntry[];
  generated_at: string;
}

export interface UnlockableFeature {
  name: string;
  display_name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    level?: number;
    projects_completed?: number;
    total_xp?: number;
    streak_days?: number;
  };
}

export interface UserUnlocks {
  unlocked_features: string[];
  available_unlocks: UnlockableFeature[];
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  nodes: SkillNode[];
}

export interface SkillNode {
  id: string;
  skill_tree_id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  xp_cost: number;
  requirements: {
    prerequisite_nodes?: string[];
    min_level?: number;
  };
  benefits: {
    xp_multiplier?: number;
    unlock_feature?: string;
  };
  position_x: number;
  position_y: number;
  is_active: boolean;
  is_unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  requirements: Record<string, any>;
  is_hidden: boolean;
  progress: number;
  is_earned: boolean;
}

export interface LevelUpData {
  old_level: number;
  new_level: number;
  xp_gained: number;
  new_unlocks: string[];
  new_badges: Badge[];
  rewards: {
    xp_bonus: number;
    skill_points: number;
    features_unlocked: string[];
  };
}

export interface GamificationStats {
  total_users: number;
  total_xp_awarded: number;
  total_badges_earned: number;
  average_level: number;
  top_performers: LeaderboardEntry[];
  recent_activity: {
    user: string;
    action: string;
    xp_earned: number;
    timestamp: string;
  }[];
}

export interface XPRequest {
  source: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface StreakRequest {
  activity_type: string;
}

export interface BadgeFeatureRequest {
  badge_id: string;
  is_featured: boolean;
}

// XP Sources
export const XP_SOURCES = {
  PROJECT_COMPLETE: 'project_complete',
  PROJECT_COMPLETE_BEGINNER: 'project_complete_beginner',
  PROJECT_COMPLETE_INTERMEDIATE: 'project_complete_intermediate',
  PROJECT_COMPLETE_ADVANCED: 'project_complete_advanced',
  STREAK_DAY: 'streak',
  STREAK_WEEK: 'streak_milestone',
  STREAK_MONTH: 'streak_milestone',
  COLLABORATION_JOIN: 'collaboration_join',
  COLLABORATION_COMPLETE: 'collaboration_complete',
  HELP_PEER: 'help_peer',
  CODE_QUALITY_HIGH: 'code_quality_high',
  CODE_QUALITY_PERFECT: 'code_quality_perfect',
  INDUSTRY_PROJECT: 'industry_project',
  FIRST_PROJECT: 'first_project',
  DAILY_LOGIN: 'daily_login',
  WEEKLY_GOAL: 'weekly_goal',
  MONTHLY_GOAL: 'monthly_goal',
  SKILL_NODE_UNLOCK: 'skill_node_unlock',
  BADGE_EARNED: 'badge_earned',
  ACHIEVEMENT_EARNED: 'achievement_earned',
  LEADERBOARD_TOP_10: 'leaderboard_top_10',
  LEADERBOARD_TOP_3: 'leaderboard_top_3',
  LEADERBOARD_FIRST: 'leaderboard_first',
  LEVEL_UP: 'level_up'
} as const;

// Badge Categories
export const BADGE_CATEGORIES = {
  COMPLETION: 'completion',
  SKILL: 'skill',
  SOCIAL: 'social',
  SPECIAL: 'special'
} as const;

// Rarity Levels
export const RARITY_LEVELS = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const;

// Leaderboard Periods
export const LEADERBOARD_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALL_TIME: 'all_time'
} as const;

// Leaderboard Categories
export const LEADERBOARD_CATEGORIES = {
  XP: 'xp',
  STREAK: 'streak',
  PROJECTS: 'projects',
  COLLABORATION: 'collaboration'
} as const;

// Feature Unlocks
export const FEATURE_UNLOCKS = {
  COLLABORATION: 'collaboration',
  MENTORING: 'mentoring',
  INDUSTRY_CHALLENGES: 'industry_challenges',
  PORTFOLIO_CERTIFICATION: 'portfolio_certification',
  ADVANCED_EDITOR: 'advanced_editor',
  TEAM_FORMATION: 'team_formation',
  CUSTOM_PROJECTS: 'custom_projects',
  AI_ASSISTANT_ADVANCED: 'ai_assistant_advanced'
} as const;

// Skill Tree Categories
export const SKILL_TREE_CATEGORIES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DATA_SCIENCE: 'data_science',
  AI_ML: 'ai_ml',
  MOBILE: 'mobile',
  DEVOPS: 'devops',
  GAME_DEV: 'game_dev',
  BLOCKCHAIN: 'blockchain'
} as const;

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  PROJECTS: 'projects',
  STREAKS: 'streaks',
  COLLABORATION: 'collaboration',
  SKILLS: 'skills',
  SOCIAL: 'social',
  SPECIAL: 'special',
  MILESTONE: 'milestone'
} as const;

export default UserProgress;
