'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../types/gamification';
import { gamificationService } from '../../services/gamificationService';

interface LeaderboardProps {
  userId: string;
}

type LeaderboardType = 'xp' | 'streak' | 'badges' | 'projects';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'all';

export const Leaderboard: React.FC<LeaderboardProps> = ({ userId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; total: number; percentile: number } | null>(null);
  const [type, setType] = useState<LeaderboardType>('xp');
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type, period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const [leaderboardData, rankData] = await Promise.all([
        gamificationService.getLeaderboard(type, period, 20),
        gamificationService.getUserRank(userId, type)
      ]);
      setLeaderboard(leaderboardData);
      setUserRank(rankData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getValueDisplay = (entry: LeaderboardEntry) => {
    switch (type) {
      case 'xp':
        return `${entry.score.toLocaleString()} XP`;
      case 'streak':
        return `${entry.score} days`;
      case 'badges':
        return `${entry.score} badges`;
      case 'projects':
        return `${entry.score} projects`;
      default:
        return entry.score.toString();
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        {userRank && (
          <div className="text-right">
            <div className="text-sm text-gray-300">Your Rank</div>
            <div className="text-lg font-bold text-purple-400">
              {getRankIcon(userRank.rank)} {userRank.percentile}th percentile
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {(['xp', 'streak', 'badges', 'projects'] as LeaderboardType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                type === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['weekly', 'monthly', 'all'] as LeaderboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No data available for this period
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.username === userId
                  ? 'bg-purple-600/20 border border-purple-400'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-yellow-400 w-8">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <div className="font-semibold text-white">{entry.username}</div>
                  <div className="text-sm text-gray-400">Level {entry.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-400">{getValueDisplay(entry)}</div>
                <div className="text-xs text-gray-400">Level {entry.level}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
