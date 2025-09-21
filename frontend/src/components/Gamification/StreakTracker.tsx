'use client';

import React, { useState, useEffect } from 'react';
import { gamificationService } from '../../services/gamificationService';

interface StreakTrackerProps {
  userId: string;
}

interface StreakDay {
  date: string;
  active: boolean;
  xp: number;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ userId }) => {
  const [streakData, setStreakData] = useState<StreakDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, [userId]);

  const loadStreakData = async () => {
    try {
      const [history, progress] = await Promise.all([
        gamificationService.getStreakHistory(userId, 30),
        gamificationService.getUserProgress(userId)
      ]);
      setStreakData(history);
      setCurrentStreak(progress.current_streak);
      setLongestStreak(progress.longest_streak);
    } catch (error) {
      console.error('Failed to load streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const result = await gamificationService.updateStreak(userId);
      setCurrentStreak(result.currentStreak);
      setLongestStreak(result.longestStreak);
      await loadStreakData(); // Refresh the calendar
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Streak Tracker</h2>
        <button
          onClick={updateStreak}
          className="glass-button px-4 py-2 text-sm hover:scale-105 transition-transform"
        >
          Update Streak
        </button>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">{currentStreak}</div>
          <div className="text-sm text-gray-300">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400">{longestStreak}</div>
          <div className="text-sm text-gray-300">Best Streak</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">Last 30 Days</h3>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center text-xs text-gray-400 p-2">
              {day}
            </div>
          ))}
          {streakData.map((day, index) => (
            <div
              key={index}
              className={`h-8 rounded flex items-center justify-center text-xs ${
                day.active
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-500'
              }`}
              title={`${day.date}: ${day.active ? `${day.xp} XP` : 'No activity'}`}
            >
              {day.active ? '🔥' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Streak Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">Keep Your Streak Alive!</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Complete at least one project daily</li>
          <li>• Earn XP to maintain your streak</li>
          <li>• Missing a day resets your current streak</li>
          <li>• Long streaks unlock special rewards</li>
        </ul>
      </div>
    </div>
  );
};

export default StreakTracker;
