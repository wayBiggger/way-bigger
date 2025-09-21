import { UserProgress, Badge, LeaderboardEntry, XP_REWARDS } from '../types/gamification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class GamificationService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/gamification${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Gamification API error: ${response.statusText}`);
    }

    return response.json();
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    return this.makeRequest<UserProgress>(`/progress/${userId}`);
  }

  async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress> {
    return this.makeRequest<UserProgress>(`/progress/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  }

  // XP System
  async awardXP(userId: string, action: keyof typeof XP_REWARDS, metadata?: any): Promise<{ xp: number; levelUp: boolean; newLevel?: number }> {
    return this.makeRequest<{ xp: number; levelUp: boolean; newLevel?: number }>(`/xp/award`, {
      method: 'POST',
      body: JSON.stringify({ userId, action, metadata }),
    });
  }

  async getXPHistory(userId: string, limit = 50): Promise<Array<{ action: string; xp: number; timestamp: Date; metadata?: any }>> {
    return this.makeRequest<Array<{ action: string; xp: number; timestamp: Date; metadata?: any }>>(`/xp/history/${userId}?limit=${limit}`);
  }

  // Badges
  async getUserBadges(userId: string): Promise<Badge[]> {
    return this.makeRequest<Badge[]>(`/badges/${userId}`);
  }

  async awardBadge(userId: string, badgeId: string): Promise<Badge> {
    return this.makeRequest<Badge>(`/badges/award`, {
      method: 'POST',
      body: JSON.stringify({ userId, badgeId }),
    });
  }

  async checkBadgeEligibility(userId: string, badgeId: string): Promise<{ eligible: boolean; progress?: number; requirement?: number }> {
    return this.makeRequest<{ eligible: boolean; progress?: number; requirement?: number }>(`/badges/check/${userId}/${badgeId}`);
  }

  // Streaks
  async updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; streakBroken: boolean }> {
    return this.makeRequest<{ currentStreak: number; longestStreak: number; streakBroken: boolean }>(`/streak/update`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getStreakHistory(userId: string, days = 30): Promise<Array<{ date: string; active: boolean; xp: number }>> {
    return this.makeRequest<Array<{ date: string; active: boolean; xp: number }>>(`/streak/history/${userId}?days=${days}`);
  }

  // Leaderboards
  async getLeaderboard(type: 'xp' | 'streak' | 'badges' | 'projects', period: 'weekly' | 'monthly' | 'all', limit = 50): Promise<LeaderboardEntry[]> {
    return this.makeRequest<LeaderboardEntry[]>(`/leaderboard/${type}/${period}?limit=${limit}`);
  }

  async getUserRank(userId: string, type: 'xp' | 'streak' | 'badges' | 'projects'): Promise<{ rank: number; total: number; percentile: number }> {
    return this.makeRequest<{ rank: number; total: number; percentile: number }>(`/leaderboard/rank/${userId}/${type}`);
  }

  // Skill Trees
  async getSkillTree(userId: string, domain: string): Promise<{ domain: string; skills: Array<{ id: string; name: string; level: number; maxLevel: number; unlocked: boolean; xpRequired: number }> }> {
    return this.makeRequest<{ domain: string; skills: Array<{ id: string; name: string; level: number; maxLevel: number; unlocked: boolean; xpRequired: number }> }>(`/skills/${userId}/${domain}`);
  }

  async upgradeSkill(userId: string, skillId: string): Promise<{ success: boolean; newLevel: number; xpSpent: number }> {
    return this.makeRequest<{ success: boolean; newLevel: number; xpSpent: number }>(`/skills/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ userId, skillId }),
    });
  }

  // Unlock System
  async getUnlockedFeatures(userId: string): Promise<Array<{ id: string; name: string; description: string; unlockedAt: Date; level: number }>> {
    return this.makeRequest<Array<{ id: string; name: string; description: string; unlockedAt: Date; level: number }>>(`/unlocks/${userId}`);
  }

  async checkFeatureUnlock(userId: string, featureId: string): Promise<{ unlocked: boolean; requirements: Array<{ type: string; current: number; required: number; met: boolean }> }> {
    return this.makeRequest<{ unlocked: boolean; requirements: Array<{ type: string; current: number; required: number; met: boolean }> }>(`/unlocks/check/${userId}/${featureId}`);
  }

  // Analytics
  async getUserAnalytics(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    totalXP: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    badgesEarned: number;
    projectsCompleted: number;
    skillsUpgraded: number;
    featuresUnlocked: number;
    xpByAction: Record<string, number>;
    activityByDay: Array<{ date: string; xp: number; actions: number }>;
  }> {
    return this.makeRequest<{
      totalXP: number;
      level: number;
      currentStreak: number;
      longestStreak: number;
      badgesEarned: number;
      projectsCompleted: number;
      skillsUpgraded: number;
      featuresUnlocked: number;
      xpByAction: Record<string, number>;
      activityByDay: Array<{ date: string; xp: number; actions: number }>;
    }>(`/analytics/${userId}?period=${period}`);
  }

  // Notifications
  async getNotifications(userId: string, unreadOnly = false): Promise<Array<{
    id: string;
    type: 'level_up' | 'badge_earned' | 'streak_milestone' | 'feature_unlocked' | 'achievement';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    metadata?: any;
  }>> {
    return this.makeRequest<Array<{
      id: string;
      type: 'level_up' | 'badge_earned' | 'streak_milestone' | 'feature_unlocked' | 'achievement';
      title: string;
      message: string;
      read: boolean;
      createdAt: Date;
      metadata?: any;
    }>>(`/notifications/${userId}?unreadOnly=${unreadOnly}`);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.makeRequest<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    return this.makeRequest<void>(`/notifications/${userId}/read-all`, {
      method: 'PUT',
    });
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
