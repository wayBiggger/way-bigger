'use client';

import React, { useState, useEffect } from 'react';
import { UserProgress, XP_REWARDS } from '../../types/gamification';
import { gamificationService } from '../../services/gamificationService';

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      const data = await gamificationService.getUserProgress(userId);
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-500">Failed to load progress data</p>
      </div>
    );
  }

  const totalXP = progress.total_xp || 0;
  const level = progress.level || 1;
  
  // Use level progress data from backend if available, otherwise calculate
  const levelProgress = progress.level_progress;
  const xpToNextLevel = levelProgress?.xp_to_next_level || 100;
  const progressPercentage = levelProgress?.percentage || 0;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Progress</h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-400">Level {level}</div>
          <div className="text-sm text-gray-300">{totalXP.toLocaleString()} XP</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Level {level}</span>
          <span>{xpToNextLevel} XP to next level</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{progress.current_streak || 0}</div>
          <div className="text-sm text-gray-300">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{progress.longest_streak || 0}</div>
          <div className="text-sm text-gray-300">Best Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{progress.recent_badges?.length || 0}</div>
          <div className="text-sm text-gray-300">Badges</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400">{progress.unlocked_features?.length || 0}</div>
          <div className="text-sm text-gray-300">Unlocked</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {Object.entries(XP_REWARDS).slice(0, 3).map(([action, xp]) => (
            <div key={action} className="flex justify-between items-center text-sm">
              <span className="text-gray-300 capitalize">{action.replace('_', ' ').toLowerCase()}</span>
              <span className="text-green-400">+{xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;