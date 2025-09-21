'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProgress, Badge, XP_REWARDS } from '../types/gamification';
import { gamificationService } from '../services/gamificationService';

interface UseGamificationReturn {
  progress: UserProgress | null;
  badges: Badge[];
  loading: boolean;
  error: string | null;
  awardXP: (action: keyof typeof XP_REWARDS, metadata?: any) => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

export const useGamification = (userId: string): UseGamificationReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [progressData, badgesData] = await Promise.all([
        gamificationService.getUserProgress(userId),
        gamificationService.getUserBadges(userId)
      ]);
      
      setProgress(progressData);
      // Handle both array and object with badges property
      const badgesArray = Array.isArray(badgesData) ? badgesData : ((badgesData as any).badges || []);
      setBadges(badgesArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
      console.error('Gamification data load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const awardXP = useCallback(async (action: keyof typeof XP_REWARDS, metadata?: any) => {
    try {
      const result = await gamificationService.awardXP(userId, action, metadata);
      
      // Update local progress state
      if (progress) {
        setProgress(prev => prev ? {
          ...prev,
          total_xp: prev.total_xp + result.xp,
          level: result.levelUp ? (result.newLevel || prev.level) : prev.level
        } : null);
      }

      // Show level up notification if applicable
      if (result.levelUp) {
        // You can add a toast notification here
        console.log(`🎉 Level up! You're now level ${result.newLevel}!`);
      }

      // Refresh data to get latest badges and progress
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      console.error('XP award error:', err);
    }
  }, [userId, progress, loadData]);

  const refreshProgress = useCallback(async () => {
    try {
      const data = await gamificationService.getUserProgress(userId);
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh progress');
    }
  }, [userId]);

  const refreshBadges = useCallback(async () => {
    try {
      const data = await gamificationService.getUserBadges(userId);
      setBadges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh badges');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  return {
    progress,
    badges,
    loading,
    error,
    awardXP,
    refreshProgress,
    refreshBadges
  };
};

export default useGamification;
